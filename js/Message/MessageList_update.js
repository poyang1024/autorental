$(document).ready(function () {
    handlePageUpdatePermissions(currentUser, currentUrl);
    setupUpdateMessage();
});

function setupUpdateMessage() {
    const uploadForm = document.getElementById("uploadForm");
    const photoUploadContainer = document.getElementById("photoUploadContainer");
    const addMorePhotosButton = document.getElementById("addMorePhotos");
    let photoCount = 1;
    let updateMessageId = sessionStorage.getItem("updateMessageId");
    let existingPhotos = [];

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
            uploadItem.remove();
        }
    }

    // document.getElementById("messagePhotoUpload0").addEventListener("change", handleFileSelect);

    // photoUploadContainer.addEventListener('click', function(event) {
    //     if (event.target.classList.contains('delete-photo')) {
    //         deletePhotoUpload(event);
    //     }
    // });

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

    async function getThumbnailUrl(filename) {
        const jsonStringFromLocalStorage = localStorage.getItem("userData");
        const gertuserData = JSON.parse(jsonStringFromLocalStorage);
        const user_token = gertuserData.token;
        const fileParameter = "messagePhoto"
        var action = "getCompressionPhoto";
        var source = "HBEVBACKEND";
        var chsmtoGetphoto = action + source + "HBEVGetFileBApi";
        var chsm = CryptoJS.MD5(chsmtoGetphoto).toString().toLowerCase();
        try {
            const response = await $.ajax({
                type: "POST",
                url: `${apiURL}/getFile`,
                headers: { Authorization: "Bearer " + user_token },
                data: {
                    action: action,
                    source: source,
                    chsm: chsm,
                    fileParameter: fileParameter,
                    fileName: filename
                },
            });
            
            if (response.returnCode === "1" && response.returnData) {
                return response.returnData;
            } else {
                console.error("獲取縮略圖失敗:", response);
                return null;
            }
        } catch (error) {
            console.error("獲取縮略圖時發生錯誤:", error);
            return null;
        }
    }

    async function handlePhotoList(messagePhoto) {
        const photoSection = $("#photoSection");
        const photoGallery = $("#photoGallery");

        console.log("messagePhoto:", messagePhoto);

        if (messagePhoto && typeof messagePhoto === 'string') {
            try {
                const photoArray = JSON.parse(messagePhoto);
                console.log("解析後的 photoArray:", photoArray);

                if (Array.isArray(photoArray) && photoArray.length > 0) {
                    photoGallery.empty();
                    for (let index = 0; index < photoArray.length; index++) {
                        const filename = photoArray[index];
                        const thumbnailUrl = await getThumbnailUrl(filename);
                        
                        if (thumbnailUrl) {
                            console.log(`縮圖 ${index + 1} URL:`, thumbnailUrl[0].photo);
                            
                            const imgContainer = $("<div>").addClass("upload-item position-relative m-2");
                            const img = $("<img>")
                                .attr("src", thumbnailUrl[0].photo)
                                .attr("alt", `照片 ${index + 1}`)
                                .addClass("img-thumbnail")
                                .css({width: "300px", height: "300px", objectFit: "cover"});
                            const deleteBtn = $("<button>")
                                .addClass("btn btn-danger btn-sm position-absolute top-0 end-0 delete-photo")
                                .text("X")
                                .on("click", function() {
                                    existingPhotos.splice(index, 1);
                                    imgContainer.remove();
                                });
                            
                            imgContainer.append(img, deleteBtn);
                            photoGallery.append(imgContainer);

                            fetch(thumbnailUrl[0].photo)
                                .then(res => res.blob())
                                .then(blob => {
                                    const file = new File([blob], filename, { type: blob.type });
                                    existingPhotos.push(file);
                                });
                        } else {
                            console.error(`無法獲取縮圖 ${index + 1}`);
                        }
                    }

                    photoSection.show();
                } else {
                    console.log("沒有找到照片");
                    photoSection.hide();
                }
            } catch (e) {
                console.error("解析 messagePhoto 字符串時出錯:", e);
                photoSection.hide();
            }
        } else {
            console.log("messagePhoto 不是有效的字符串");
            photoSection.hide();
        }
    }

    function loadMessageDetails(messageId) {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const user_token = userData.token;

        if (!user_token) {
            console.error("未找到用戶 token");
            showErrorNotification("請重新登錄");
            return;
        }

        const action = "getMessageDetail";
        const source = "HBEVBACKEND";
        const chsm = CryptoJS.MD5(action + source + "HBEVMessageBApi").toString().toLowerCase();

        $.ajax({
            type: "POST",
            url: `${apiURL}/message`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
                data: JSON.stringify({ id: messageId })
            },
            success: function (response) {
                if (response.returnCode === "1" && response.returnData.length > 0) {
                    const messageData = response.returnData[0];
                    fillFormFields(messageData);
                    try {
                        handlePhotoList(messageData.photo);
                    } catch (e) {
                        console.error("解析照片資料時出錯:", e);
                        showErrorNotification();
                    }
                } else {
                    handleApiResponse(response);
                }
            },
            error: function (error) {
                console.error("載入訊息詳情時發生錯誤:", error);
                showErrorNotification("載入訊息詳情時發生錯誤: " + (error.responseJSON?.message || error.statusText));
            },
        });
    }

    function fillFormFields(messageData) {
        $("#M-title").val(messageData.title);
        $("#M-description").val(messageData.description);
        $("#M-tag").val(messageData.tag);
        
        setDateTimeValue("M-pushtime", messageData.pushTime);
        setDateTimeValue("M-starttime", messageData.startTime);
        setDateTimeValue("M-endtime", messageData.endTime);
        
        $("#M-content").val(messageData.content);
    }

    function setDateTimeValue(elementId, dateTimeString) {
        const element = $(`#${elementId}`);
        if (dateTimeString === null) {
            element.attr('type', 'text').val("無可用數據");
        } else if (dateTimeString === "0000-00-00 00:00:00") {
            element.attr('type', 'text').val(dateTimeString);
        } else {
            element.attr('type', 'datetime-local').val(formatDateTimeAdjusted(dateTimeString));
        }
    }

    function formatDateTimeAdjusted(dateTimeString) {
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) {
            console.error('無效的日期時間字符串:', dateTimeString);
            return '';
        }
        return date.toISOString().slice(0, 16);
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
                    id: updateMessageId,
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

                const action = "updateMessageDetail";
                const source = "HBEVBACKEND";
                const chsmtoGetManualList = action + source + "HBEVMessageBApi";
                const chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

                formData.set("action", action);
                formData.set("source", source);
                formData.set("chsm", chsm);
                formData.set("data", JSON.stringify(messageData));

                // Add existing photos
                existingPhotos.forEach((file, index) => {
                    formData.append(`messagePhoto[]`, file);
                });

                // Add newly uploaded photos
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

    if (updateMessageId) {
        loadMessageDetails(updateMessageId);
    } else {
        console.error("未找到要更新的訊息 ID");
        showErrorNotification("無法載入訊息詳情：缺少訊息 ID");
    }
}