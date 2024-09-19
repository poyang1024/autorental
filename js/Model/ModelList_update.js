$(document).ready(async function () {
    handlePageUpdatePermissions(currentUser, currentUrl);
    try {
        await initializeCreateModelForm();
    } catch (error) {
        console.error("初始化錯誤:", error);
        showErrorNotification();
    }
});

async function initializeCreateModelForm() {
    try {
        const modelId = sessionStorage.getItem("updateModelId");
        // const modelId = "5"; // for test
        if (!modelId) {
            throw new Error("sessionStorage 中缺少 updateModelId");
        }

        const [ModelDetails, brandList] = await Promise.all([
            fetchModelDetails(modelId),
            fetchBrandList()
        ]);

        populateModelDetails(ModelDetails);
        populateBrandDropdown(brandList);
        setupUpdateModel(modelId);
    } catch (error) {
        console.error("表單初始化錯誤:", error);
        showErrorNotification();
    }
}

async function fetchModelDetails(modelId) {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const action = "getModelDetail";
    const source = "HBEVBACKEND";
    const chsm = CryptoJS.MD5(action + source + "HBEVModelBApi").toString().toLowerCase();

    try {
        const response = await $.ajax({
            type: "POST",
            url: `${apiURL}/model`,
            headers: { Authorization: "Bearer " + userData.token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
                data: JSON.stringify({ id: modelId })
            }
        });

        if (response.returnCode === "1" && response.returnData.length > 0) {
            return response.returnData[0];
        } else {
            handleApiResponse(response);
        }
    } catch (error) {
        showErrorNotification();
    }
}

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

function populateModelDetails(modelData) {
    // Store the original company ID for later use
    $("#M-brand_name").val(modelData.brandId);
    $("#M-brand_name").data("originalBrandId", modelData.brandId);
    
    $("#M-modelname").val(modelData.name);
    $("#M-levelId").val(modelData.levelId);

    $("#M-length").val(modelData.length);
    $("#M-width").val(modelData.width);
    $("#M-height").val(modelData.height);

    $("#M-wheelBase").val(modelData.wheelBase);
    $("#M-seatHeight").val(modelData.seatHeight);
    $("#M-weight").val(modelData.weight);
    $("#M-horsepower").val(modelData.horsepower);
    $("#M-torque").val(modelData.torque);
    $("#M-transmissionType").val(modelData.transmissionType);
    $("#M-powerMode").val(modelData.powerMode);
    $("#M-backShockAbsorberSpec").val(modelData.backShockAbsorberSpec);
    $("#M-frontTireSpec").val(modelData.frontTireSpec);
    $("#M-backTireSpec").val(modelData.backTireSpec);
    $("#M-frontDiscSpec").val(modelData.frontDiscSpec);
    $("#M-backDiscSpec").val(modelData.backDiscSpec);
    $("#M-backGloveBoxSpace").val(modelData.backGloveBoxSpace);

    // // Handle phone number
    // handleNullableField("#phoneNumberContainer", "#R-phoneNumber", siteData.tel);

    $("#M-status").val(modelData.status);
    $("#M-modelOrder").val(modelData.modelOrder);

    $("#BuildTime").val(modelData.createTime);
    $("#EditTime").val(modelData.updateTime);
    $("#EditAccount").val(modelData.updateOperatorName);

    // Handle photo
    handlePhoto(modelData.photo);

    $("#spinner").hide();
}

function handlePhoto(photoUrl) {
    if (photoUrl === null || photoUrl === "") {
        setDefaultImage("#modelPhoto");
    } else {
        $("#modelPhotoContainer").show();
        $("#modelPhoto").attr("src", photoUrl);
    }
}

// Set default image
function setDefaultImage(imgElement) {
    const defaultSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#f0f0f0"/>
            <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#999" text-anchor="middle" dy=".3em">No Image</text>
        </svg>
    `;
    
    $(imgElement).attr("src", "data:image/svg+xml;charset=utf-8," + encodeURIComponent(defaultSvg))
        .css({
            'max-width': '100%',
            'height': 'auto'
        });
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

    // Set the selected company to the original brand
    const originalBrandId = $("#M-brand_name").data("originalBrandId");
    if (originalBrandId) {
        $("#M-brand_name").val(originalBrandId);
    }
}

function setupUpdateModel(modelId) {
    const uploadForm = document.getElementById("uploadForm");
    const photoInput = document.getElementById("modelPhotoUpload");

    if (!uploadForm || !photoInput) {
        console.error("上傳表單或照片輸入匡不存在。");
        return;
    }

    photoInput.addEventListener("change", function(event) {
        if (photoInput.files.length > 0) {

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
            reader.readAsDataURL(photoInput.files[0]);
        }
    });

    uploadForm.addEventListener("submit", async function (event) {   
        if (!uploadForm.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
            showWarningfillFormNotification();
            uploadForm.classList.add("was-validated");
            return;
        }else{}

        try {
            event.preventDefault();

            const userData = JSON.parse(localStorage.getItem("userData"));

            const action = "updateModelDetail";
            const source = "HBEVBACKEND";
            const chsm = CryptoJS.MD5(action + source + "HBEVModelBApi").toString().toLowerCase();

            const modelData = {
                id: modelId,
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
        uploadForm.classList.add("was-validated");
    });
}
