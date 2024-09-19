$(document).ready(async function () {
    handlePageCreatePermissions(currentUser, currentUrl);
    try {
        await initializeCreateModelForm();
    } catch (error) {
        console.error("初始化錯誤:", error);
        showErrorNotification();
    }
});

async function initializeCreateModelForm() {
    try {
        const brandList = await fetchBrandList();
        populateBrandDropdown(brandList);
        setupCreateModel();
    } catch (error) {
        console.error("表單初始化錯誤:", error);
        showErrorNotification();
    }
}

// 獲取品牌列表
async function fetchBrandList() {
    const userData = JSON.parse(localStorage.getItem("userData"));

    const action = "getBrandList";
    const source = "HBEVBACKEND";
    const chsm = CryptoJS.MD5(action + source + "HBEVBrandBApi").toString().toLowerCase();

    try {
        const response = await $.ajax({
            type: "POST",
            url: `${apiURL}/brand`,
            headers: { Authorization: "Bearer " + userData.token },
            data: {
                action: action,
                source: source,
                chsm: chsm
            }
        });

        if (response.returnCode === "1" && response.returnData.length > 0) {
            return response.returnData;
        } else {
            handleApiResponse(response);
        }
    } catch (error) {
        showErrorNotification();
    }
}

function populateBrandDropdown(brands) {
    const brandList = document.getElementById("M-brand_name");
    brandList.innerHTML = '';
    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇品牌";
    defaultOption.value = "";
    brandList.appendChild(defaultOption);

    brands.forEach(brand => {
        const option = document.createElement("option");
        option.text = brand.name;
        option.value = brand.id;
        brandList.appendChild(option);
    });
}

function setupCreateModel() {
    const createForm = document.getElementById("uploadForm");
    const photoInput = document.getElementById("modelPhotoUpload");

    if (!createForm || !photoInput) {
        console.error("上傳表單或照片輸入匡不存在。");
        return;
    }

    photoInput.addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            // Check file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                alert('請上傳 JPG、PNG 或 GIF 格式的圖片。');
                this.value = ''; // Clear the file input
                return;
            }

            // Check file size (e.g., limit to 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                alert('檔案大小不能超過 5MB。');
                this.value = ''; // Clear the file input
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                $("#modelPhotoContainer").show();
                $("#modelPhoto").attr("src", e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    createForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        
        if (!createForm.checkValidity()) {
            event.stopPropagation();
            showWarningfillFormNotification();
            createForm.classList.add("was-validated");
            return;
        }

        try {
            const userData = JSON.parse(localStorage.getItem("userData"));

            const action = "insertModelDetail";
            const source = "HBEVBACKEND";
            const chsm = CryptoJS.MD5(action + source + "HBEVModelBApi").toString().toLowerCase();

            const modelData = {
                brandId: $("#M-brand_name").val(),
                name: $("#M-modelname").val(),
                levelId: $("#M-levelId").val(),
                length: $("#M-length").val(),
                width: $("#M-width").val(),
                height: $("#M-height").val(),
                wheelBase: $("#M-wheelBase").val(),
                seatHeight: $("#M-seatHeight").val(),
                weight: $("#M-weight").val(),
                horsepower: $("#M-horsepower").val(),
                torque: $("#M-torque").val(),
                transmissionType: $("#M-transmissionType").val(),
                powerMode: $("#M-powerMode").val(),
                backShockAbsorberSpec: $("#M-backShockAbsorberSpec").val(),
                frontTireSpec: $("#M-frontTireSpec").val(),
                backTireSpec: $("#M-backTireSpec").val(),
                frontDiscSpec: $("#M-frontDiscSpec").val(),
                backDiscSpec: $("#M-backDiscSpec").val(),
                backGloveBoxSpace: $("#M-backGloveBoxSpace").val(),
                status: $("#M-status").val(),
                modelOrder: $("#M-modelOrder").val()
            };

            const formData = new FormData();
            formData.append("action", action);
            formData.append("source", source);
            formData.append("chsm", chsm);
            formData.append("data", JSON.stringify(modelData));

            // Handle photo upload
            if (photoInput.files.length > 0) {
                formData.append("modelPhoto", photoInput.files[0]);
            }

            const response = await $.ajax({
                type: "POST",
                url: `${apiURL}/model`,
                headers: { 
                    Authorization: "Bearer " + userData.token
                },
                data: formData,
                processData: false,
                contentType: false,
                xhr: function() {
                    var xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener("progress", function(evt) {
                        if (evt.lengthComputable) {
                            var percentComplete = evt.loaded / evt.total;
                            console.log('上傳進度：', percentComplete * 100 + '%');
                        }
                    }, false);
                    return xhr;
                }
            });

            if (response.returnCode === "1") {
                showSuccessFileNotification();

                setTimeout(() => {
                    window.location.href = "modelList.html";
                }, 1000);
            } else {
                handleApiResponse(response);
            }
        } catch (error) {
            showErrorNotification();
        }
    createForm.classList.add("was-validated");
    });
}