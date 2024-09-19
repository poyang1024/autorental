$(document).ready(async function () {
    handlePageCreatePermissions(currentUser, currentUrl);
    try {
        await initializeCreateSiteForm();
    } catch (error) {
        console.error("初始化錯誤:", error);
        showErrorNotification();
    }
});

async function initializeCreateSiteForm() {
    try {
        const companyList = await fetchCompanyList();
        populateCompanyDropdown(companyList);
        setupCreateSite();
    } catch (error) {
        console.error("表單初始化錯誤:", error);
        showErrorNotification();
    }
}

async function fetchCompanyList() {
    const userData = JSON.parse(localStorage.getItem("userData"));

    const action = "getCompanyList";
    const source = "HBEVBACKEND";
    const chsm = CryptoJS.MD5(action + source + "HBEVCompanyBApi").toString().toLowerCase();

    try {
        const response = await $.ajax({
            type: "POST",
            url: `${apiURL}/company`,
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

function populateCompanyDropdown(companies) {
    const companyList = document.getElementById("R-company_name");
    companyList.innerHTML = '';
    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇公司";
    defaultOption.value = "";
    companyList.appendChild(defaultOption);

    companies.forEach(company => {
        const option = document.createElement("option");
        option.text = company.name;
        option.value = company.id;
        companyList.appendChild(option);
    });
}

function setupCreateSite() {
    const createForm = document.getElementById("uploadForm");
    const photoInput = document.getElementById("sitePhotoUpload");

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
                $("#sitePhotoContainer").show();
                $("#sitePhoto").attr("src", e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    createForm.addEventListener("submit", async function (event) {   
        if (!createForm.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
            showWarningfillFormNotification();
            createForm.classList.add("was-validated");
            return;
        }

        try {
            event.preventDefault();

            const userData = JSON.parse(localStorage.getItem("userData"));

            const action = "insertSiteDetail";
            const source = "HBEVBACKEND";
            const chsm = CryptoJS.MD5(action + source + "HBEVSiteBApi").toString().toLowerCase();

            const siteData = {
                companyId: $("#R-company_name").val(),
                name: $("#R-rentalsite").val(),
                parkingAmount: $("#R-parkingnum").val(),
                address: $("#R-address").val(),
                coordinateX: $("#R-sitenum-X").val(),
                coordinateY: $("#R-sitenum-Y").val(),
                tel: $("#R-phoneNumber").val(),
                businessHour: $("#R-openingtime").val(),
                coordinateULX: $("#R-sitenum1-X").val(),
                coordinateULY: $("#R-sitenum1-Y").val(),
                coordinateURX: $("#R-sitenum2-X").val(),
                coordinateURY: $("#R-sitenum2-Y").val(),
                coordinateLLX: $("#R-sitenum3-X").val(),
                coordinateLLY: $("#R-sitenum3-Y").val(),
                coordinateLRX: $("#R-sitenum4-X").val(),
                coordinateLRY: $("#R-sitenum4-Y").val(),
                status: $("#R-status").val(),
                siteOrder: $("#R-siteOrder").val()
            };

            const formData = new FormData();
            formData.append("action", action);
            formData.append("source", source);
            formData.append("chsm", chsm);
            formData.append("data", JSON.stringify(siteData));

            // Handle photo upload
            if (photoInput.files.length > 0) {
                formData.append("sitePhoto", photoInput.files[0]);
            }

            const response = await $.ajax({
                type: "POST",
                url: `${apiURL}/site`,
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
                    window.location.href = "siteList.html";
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