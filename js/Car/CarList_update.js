$(document).ready(async function () {
    handlePageUpdatePermissions(currentUser, currentUrl);
    await initializeUpdateCarForm();
});

async function initializeUpdateCarForm() {
    try {
        await fetchCarDetails();
        await Promise.all([
            fetchCompanyList(),
            fetchSiteList(),
            fetchBrandList(),
            fetchModelList()
        ]);
        setupUpdateCar();
    } catch (error) {
        console.error("Error during initilization:", error);
        showErrorNotification();
    }
}

async function fetchCarDetails() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var updateCarId = sessionStorage.getItem("updateCarId");
    const update_CarId = { id: parseInt(updateCarId) };

    var action = "getCarDetail";
    var source = "HBEVBACKEND";
    var chsmtoGetCarDetail = action + source + "HBEVCarBApi";
    var chsm = CryptoJS.MD5(chsmtoGetCarDetail).toString().toLowerCase();

    try {
        const response = await $.ajax({
            type: "POST",
            url: `${apiURL}/car`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
                data: JSON.stringify(update_CarId)
            }
        });

        if (response.returnCode === "1" && response.returnData.length > 0) {
            const carData = response.returnData[0];
            populateCarDetails(carData);
        } else {
            showErrorNotification();
            throw new Error("Invalid response");
        }
    } catch (error) {
        console.error("Error fetching account details:", error);
        showErrorNotification();
        throw error;
    }
}

function populateCarDetails(carData) {
    sessionStorage.setItem("companyId", carData.companyId);
    sessionStorage.setItem("siteId", carData.siteId);
    sessionStorage.setItem("positionSiteId", carData.positionSiteId);
    $("#Car-manufactureYear").val(carData.manufactureYear);
    $("#Car-licensePlateNumber").val(carData.licensePlateNumber);
    $("#Car-IMEI").val(carData.IMEI);
    $("#Car-ICCID").val(carData.ICCID);
    $("#Car-monthlyMileage").val(carData.monthlyMileage);
    $("#Car-totalMileage").val(carData.totalMileage);
    sessionStorage.setItem("modelId", carData.modelId);
    sessionStorage.setItem("brandId", carData.brandId);
    $("#Car-levelId").val(carData.levelId);
    $("#carStatus").val(carData.status);
    
    $("#BuildTime").val(carData.createTime);
    $("#EditTime").val(carData.updateTime);
    $("#EditAccount").val(carData.updateOperatorName);

    $("#spinner").hide();
}

async function fetchCompanyList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getCompanyList";
    var source = "HBEVBACKEND";
    var chsmtoGetCompanyList = action + source + "HBEVCompanyBApi";
    var chsm = CryptoJS.MD5(chsmtoGetCompanyList).toString().toLowerCase();

    try {
        const response = await $.ajax({
            type: "POST",
            url: `${apiURL}/company`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm
            }
        });

        if (response.returnCode === "1" && response.returnData.length > 0) {
            populateCompanyDropdown(response.returnData);
        } else {
            handleApiResponse(response);
            throw new Error("Invalid response");
        }
    } catch (error) {
        console.error("Error fetching company list:", error);
        showErrorNotification();
        throw error;
    }
}

function populateCompanyDropdown(companies) {
    const companyList = document.getElementById("Car-companyName");
    companyList.innerHTML = ''; // Clear existing options
    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇公司";
    defaultOption.value = "";
    companyList.appendChild(defaultOption);

    const selectedCompanyId = sessionStorage.getItem("companyId");

    companies.forEach(company => {
        const option = document.createElement("option");
        option.text = company.name;
        option.value = company.id;
        if (company.id.toString() === selectedCompanyId) {
            option.selected = true;
        }
        companyList.appendChild(option);
    });
}

// 獲取站點列表
async function fetchSiteList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    var action = "getSiteList";
    var source = "HBEVBACKEND";
    var chsmtoGetSiteList = action + source + "HBEVSiteBApi";
    var chsm = CryptoJS.MD5(chsmtoGetSiteList).toString().toLowerCase();

    $.ajax({
        type: "POST",
        url: `${apiURL}/site`,
        headers: { Authorization: "Bearer " + user_token },
        data: {
            action: action,
            source: source,
            chsm: chsm
        },
        success: function (responseData) {
            if (responseData.returnCode === "1" && responseData.returnData.length > 0) {
                populateSiteDropdown(responseData.returnData);
                populatepositionSiteDropdown(responseData.returnData);
            } else {
                handleApiResponse(responseData);
            }
        },
        error: function (error) {
            showErrorNotification();
        },
    });
}

function populateSiteDropdown(sites) {
    const siteList = document.getElementById("Car-siteName");
    siteList.innerHTML = ''; // Clear existing options
    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇角色";
    defaultOption.value = "";
    siteList.appendChild(defaultOption);

    const selectedsiteId = sessionStorage.getItem("siteId");

    sites.forEach(site => {
        const option = document.createElement("option");
        option.text = site.name;
        option.value = site.id;
        if (site.id.toString() === selectedsiteId) {
            option.selected = true;
        }
        siteList.appendChild(option);
    });
}

function populatepositionSiteDropdown(positionSites) {
    const positionSiteList = document.getElementById("Car-positionSiteName");
    positionSiteList.innerHTML = ''; // Clear existing options
    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇角色";
    defaultOption.value = "";
    positionSiteList.appendChild(defaultOption);

    const positionSiteId = sessionStorage.getItem("positionSiteId");

    positionSites.forEach(positionSite => {
        const option = document.createElement("option");
        option.text = positionSite.name;
        option.value = positionSite.id;
        if (positionSite.id.toString() === positionSiteId) {
            option.selected = true;
        }
        positionSiteList.appendChild(option);
    });
}

// 獲取品牌列表
function fetchBrandList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    var action = "getBrandList";
    var source = "HBEVBACKEND";
    var chsmtoGetBrandList = action + source + "HBEVBrandBApi";
    var chsm = CryptoJS.MD5(chsmtoGetBrandList).toString().toLowerCase();

    $.ajax({
        type: "POST",
        url: `${apiURL}/brand`,
        headers: { Authorization: "Bearer " + user_token },
        data: {
            action: action,
            source: source,
            chsm: chsm
        },
        success: function (responseData) {
            if (responseData.returnCode === "1" && responseData.returnData.length > 0) {
                populateBrandDropdown(responseData.returnData);
            } else {
                handleApiResponse(responseData);
            }
        },
        error: function (error) {
            showErrorNotification();
        },
    });

}

function populateBrandDropdown(Brands) {
    const brandList = document.getElementById("Car-brandName");
    brandList.innerHTML = ''; // Clear existing options
    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇角色";
    defaultOption.value = "";
    brandList.appendChild(defaultOption);

    const brandId = sessionStorage.getItem("brandId");

    Brands.forEach(Brand => {
        const option = document.createElement("option");
        option.text = Brand.name;
        option.value = Brand.id;
        if (Brand.id.toString() === brandId) {
            option.selected = true;
        }
        brandList.appendChild(option);
    });
}

// 獲取車型列表
function fetchModelList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    var action = "getModelList";
    var source = "HBEVBACKEND";
    var chsmtoGetModelList = action + source + "HBEVModelBApi";
    var chsm = CryptoJS.MD5(chsmtoGetModelList).toString().toLowerCase();

    $.ajax({
        type: "POST",
        url: `${apiURL}/model`,
        headers: { Authorization: "Bearer " + user_token },
        data: {
            action: action,
            source: source,
            chsm: chsm
        },
        success: function (responseData) {
            if (responseData.returnCode === "1" && responseData.returnData.length > 0) {
                populateModelDropdown(responseData.returnData);
            } else {
                handleApiResponse(responseData);
            }
        },
        error: function (error) {
            showErrorNotification();
        },
    });
}

function populateModelDropdown(Models) {
    const modelList = document.getElementById("Car-modelName");
    modelList.innerHTML = ''; // Clear existing options
    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇角色";
    defaultOption.value = "";
    modelList.appendChild(defaultOption);

    const modelId = sessionStorage.getItem("modelId");

    Models.forEach(Model => {
        const option = document.createElement("option");
        option.text = Model.name;
        option.value = Model.id;
        if (Model.id.toString() === modelId) {
            option.selected = true;
        }
        modelList.appendChild(option);
    });
}

function setupUpdateCar() {
    var formData = new FormData();
    var uploadForm = document.getElementById("uploadForm");

    uploadForm.addEventListener("submit", function (event) {
        if (uploadForm.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            showWarningfillFormNotification();
        } else {
            event.preventDefault();
            const jsonStringFromLocalStorage = localStorage.getItem("userData");
            const getUserData = JSON.parse(jsonStringFromLocalStorage);
            const user_token = getUserData.token;

            var action = "updateCarDetail";
            var source = "HBEVBACKEND";
            var chsmtoUpdateCar = action + source + "HBEVCarBApi";
            var chsm = CryptoJS.MD5(chsmtoUpdateCar).toString().toLowerCase();
            
            var updateCarId = sessionStorage.getItem("updateCarId");
            const carData = {
                id: parseInt(updateCarId),
				companyId: $("#Car-companyName").val(),
				siteId: $("#Car-siteName").val(),
				positionSiteId: $("#Car-positionSiteName").val(),
				manufactureYear: $("#Car-manufactureYear").val(),
				licensePlateNumber: $("#Car-licensePlateNumber").val(),
				IMEI: $("#Car-IMEI").val(),
				ICCID: $("#Car-ICCID").val(),
				monthlyMileage: $("#Car-monthlyMileage").val(),
                totalMileage: $("#Car-totalMileage").val(),
                levelId: $("#Car-levelId").val(),
				brandId: $("#Car-brandName").val(),
				modelId: $("#Car-modelName").val(),
				status: $("#carStatus").val()
			};

            const formData = new FormData();
            formData.append("action", action);
            formData.append("source", source);
            formData.append("chsm", chsm);
            formData.append("data", JSON.stringify(carData));

            $.ajax({
                type: "POST",
                url: `${apiURL}/car`,
                headers: { Authorization: "Bearer " + user_token },
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    if (response.returnCode === "1") {
                        showSuccessFileNotification();
                        setTimeout(function () {
                            var newPageUrl = "carList.html";
                            window.location.href = newPageUrl;
                        }, 1000);
                    } else {
                        handleApiResponse(response);
                        console.log("Api response: " + response);
                    }
                },
                error: function (error) {
                    console.error(error);
                    showErrorNotification();
                }
            });
        }
        uploadForm.classList.add("was-validated");
    });
}