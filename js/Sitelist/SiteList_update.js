$(document).ready(async function () {
    handlePageUpdatePermissions(currentUser, currentUrl);
    try {
        await initializeUpdateSiteForm();
    } catch (error) {
        toastr.error("頁面載入錯誤:", error);
        showErrorNotification();
    }
});

async function initializeUpdateSiteForm() {
    try {
        const siteId = sessionStorage.getItem("updateSiteId");
        if (!siteId) {
            throw new Error("localStorage 中缺少 updateSiteId");
        }

        const [siteDetails, companyList] = await Promise.all([
            fetchSiteDetails(siteId),
            fetchCompanyList()
        ]);

        populateSiteDetails(siteDetails);
        populateCompanyDropdown(companyList);
        setupUpdateSite(siteId);
    } catch (error) {
        console.error("表單初始化錯誤:", error);
        showErrorNotification();
    }
}

async function fetchSiteDetails(siteId) {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const action = "getSiteDetail";
    const source = "HBEVBACKEND";
    const chsm = CryptoJS.MD5(action + source + "HBEVSiteBApi").toString().toLowerCase();

    try {
        const response = await $.ajax({
            type: "POST",
            url: `${apiURL}/site`,
            headers: { Authorization: "Bearer " + userData.token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
                data: JSON.stringify({ id: siteId })
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

function populateSiteDetails(siteData) {
    $("#R-company_name").val(siteData.companyId);
    $("#R-rentalsite").val(siteData.name);
    $("#R-parkingnum").val(siteData.parkingAmount);
    $("#R-address").val(siteData.address);
    $("#R-phoneNumber").val(siteData.tel);
    $("#R-openingtime").val(siteData.businessHour);
    $("#R-sitenum-X").val(siteData.coordinateX);
    $("#R-sitenum-Y").val(siteData.coordinateY);
    $("#R-sitenum1-X").val(siteData.coordinateULX);
    $("#R-sitenum1-Y").val(siteData.coordinateULY);
    $("#R-sitenum2-X").val(siteData.coordinateURX);
    $("#R-sitenum2-Y").val(siteData.coordinateURY);
    $("#R-sitenum3-X").val(siteData.coordinateLLX);
    $("#R-sitenum3-Y").val(siteData.coordinateLLY);
    $("#R-sitenum4-X").val(siteData.coordinateLRX);
    $("#R-sitenum4-Y").val(siteData.coordinateLRY);
    $("#R-status").val(siteData.status);
    $("#R-siteOrder").val(siteData.siteOrder);

    $("#BuildTime").val(siteData.createTime);
    $("#EditTime").val(siteData.updateTime);
    $("#EditAccount").val(siteData.updateOperatorName);

    // Handle photo
    handlePhoto(siteData.photo);

    // Store the original company ID for later use
    $("#R-company_name").data("originalCompanyId", siteData.companyId);

    $("#spinner").hide();
}

function handlePhoto(photoUrl) {
    if (photoUrl === null || photoUrl === "") {
        $("#sitePhotoContainer").hide();
    } else {
        $("#sitePhotoContainer").show();
        $("#sitePhoto").attr("src", photoUrl);
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

    // Set the selected company to the original company
    const originalCompanyId = $("#R-company_name").data("originalCompanyId");
    if (originalCompanyId) {
        $("#R-company_name").val(originalCompanyId);
    }
}

function setupUpdateSite(siteId) {
    const uploadForm = document.getElementById("uploadForm");
    const photoInput = document.getElementById("sitePhotoUpload");

    if (!uploadForm || !photoInput) {
        toast.error("上傳表單或照片不存在。");
        return;
    }

    photoInput.addEventListener("change", function(event) {
        if (photoInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $("#sitePhotoContainer").show();
                $("#sitePhoto").attr("src", e.target.result);
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

            const action = "updateSiteDetail";
            const source = "HBEVBACKEND";
            const chsm = CryptoJS.MD5(action + source + "HBEVSiteBApi").toString().toLowerCase();

            const siteData = {
                id: siteId,
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
                            // toastr.info('上傳進度：', percentComplete * 100 + '%');
                        }
                    }, false);
                    return xhr;
                }
            });

            if (response.returnCode === "001") {
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
        uploadForm.classList.add("was-validated");
    });
}