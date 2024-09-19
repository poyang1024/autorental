$(document).ready(function () {
    handlePageCreatePermissions(currentUser, currentUrl);
    setupCreateMessage();
});

function setupCreateMessage() {
    const uploadForm = document.getElementById("uploadForm");
    const photoUploadContainer = document.getElementById("photoUploadContainer");
    const addMorePhotosButton = document.getElementById("addMorePhotos");
    let photoCount = 1;

    function clearPreview(previewElement) {
        if (previewElement) {
            previewElement.innerHTML = '';
            previewElement.style.display = 'none';
        }
    }

    function handleFileSelect(event) {
        const input = event.target;
        const files = input.files;
        const uploadItem = input.closest('.upload-item');
        let photoPreview = uploadItem.querySelector('.photo-preview');
        
        if (!photoPreview) {
            photoPreview = document.createElement('div');
            photoPreview.className = 'photo-preview';
            photoPreview.style.display = 'none';
            uploadItem.appendChild(photoPreview);
        }

        clearPreview(photoPreview);
        
        if (files.length === 0) {
            return;
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file) {
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
                if (!allowedTypes.includes(file.type)) {
                    alert('請上傳 JPG、PNG 或 GIF 格式的圖片。');
                    continue;
                }

                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                    alert('檔案大小不能超過 5MB。');
                    continue;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'col-sm-3 mb-3 position-relative';
                    
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.width = "300px";
                    img.style.height = "300px";
                    img.style.objectFit = "cover";
                    
                    imgContainer.appendChild(img);
                    photoPreview.appendChild(imgContainer);
                };
                reader.readAsDataURL(file);
            }
        }
        photoPreview.style.display = 'flex';
        photoPreview.style.flexWrap = 'wrap';
    }

    function deletePhotoUpload(event) {
        const uploadItem = event.target.closest('.upload-item');
        if (uploadItem) {
            // Remove the entire upload item
            uploadItem.remove();
        }
    }

    document.getElementById("messagePhotoUpload0").addEventListener("change", handleFileSelect);

    photoUploadContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-photo')) {
            deletePhotoUpload(event);
        }
    });

    if (addMorePhotosButton) {
        addMorePhotosButton.addEventListener("click", function(event) {
            event.preventDefault();
            console.log('addMorePhotos called');

            const newPhotoInput = `
                <div class="upload-item position-relative">
                    <label for="messagePhotoUpload${photoCount}" class="form-label">上傳訊息照片</label>
                    <input type="file" class="form-control messagePhotoUpload" id="messagePhotoUpload${photoCount}" name="messagePhotoUpload[]" accept=".jpg,.jpeg,.png,.gif">
                    <small class="form-text text-muted">允許的檔案類型：JPG, JPEG, PNG, GIF。</small>
                    <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 mt-1 me-1 delete-photo">X</button>
                </div>
            `;
            photoUploadContainer.insertAdjacentHTML('beforeend', newPhotoInput);
            
            const newInput = document.getElementById(`messagePhotoUpload${photoCount}`);
            newInput.addEventListener("change", handleFileSelect);
            
            photoCount++;
        });
    }

    if (uploadForm) {
        uploadForm.addEventListener("submit", function (event) {
            if (uploadForm.checkValidity() === false) {
                event.preventDefault();
                event.stopPropagation();
                showWarningfillFormNotification();
            } else {
                event.preventDefault();

                const formData = new FormData();

                const messageData = {
                    title: $("#M-title").val(),
                    description: $("#M-description").val(),
                    tag: $("#M-tag").val(),
                    pushTime: $("#M-pushtime").val(),
                    startTime: $("#M-starttime").val(),
                    endTime: $("#M-endtime").val(),
                    content: $("#M-content").val()
                };

                const jsonStringFromLocalStorage = localStorage.getItem("userData");
                const getUserData = JSON.parse(jsonStringFromLocalStorage);
                const user_token = getUserData.token;

                const action = "insertMessageDetail";
                const source = "HBEVBACKEND";
                const chsmtoGetManualList = action + source + "HBEVMessageBApi";
                const chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

                formData.set("action", action);
                formData.set("source", source);
                formData.set("chsm", chsm);
                formData.set("data", JSON.stringify(messageData));

                const photoInputs = document.querySelectorAll('.messagePhotoUpload');
                photoInputs.forEach((input, index) => {
                    if (input.files.length > 0) {
                        formData.append(`messagePhoto[]`, input.files[0]);
                    }
                });

                $.ajax({
                    type: "POST",
                    url: `${apiURL}/message`,
                    headers: { Authorization: "Bearer " + user_token },
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        if (response.returnCode === "1") {
                            showSuccessFileNotification();
                            setTimeout(function () {
                                window.location.href = "messageList.html";
                            }, 1000);
                        } else {
                            handleApiResponse(response);
                        }
                    },
                    error: function (error) {
                        console.error(error);
                        showErrorNotification();
                    },
                });
            }
            uploadForm.classList.add("was-validated");
        });
    }
}