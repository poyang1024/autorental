$(document).ready(async function () {
    handlePageReadPermissions(currentUser, currentUrl);
    await fetchCarDetails(); // 等待 fetchCarDetails 執行完成
    fetchCompanyList();
    fetchSiteList();
    fetchBrandList();
    fetchModelList();
});

function fetchCarDetails() {
    return new Promise((resolve, reject) => {
        const jsonStringFromLocalStorage = localStorage.getItem("userData");
        const gertuserData = JSON.parse(jsonStringFromLocalStorage);
        const user_token = gertuserData.token;

        var readCarId = sessionStorage.getItem("readCarId");
        const getreadCarId = { id: parseInt(readCarId) };

        var action = "getCarDetail";
        var source = "HBEVBACKEND";
        var chsmtoGetCarDetail = action + source + "HBEVCarBApi";
        var chsm = CryptoJS.MD5(chsmtoGetCarDetail).toString().toLowerCase();

        $.ajax({
            type: "POST",
            url: `${apiURL}/car`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
                data: JSON.stringify(getreadCarId)
            },
            success: function (response) {
                if (response.returnCode === "1" && response.returnData.length > 0) {
                    const carData = response.returnData[0];
                    console.log(carData);
                    populateCarDetails(carData);
                    resolve(); // 操作成功，返回 resolve
                } else {
                    showErrorNotification();
                    reject(); // 操作失败，返回 reject
                }
            },
            error: function (error) {
                showErrorNotification();
                reject(error); // 操作失败，返回 reject
            }
        });
    });
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

// 獲取公司列表
function fetchCompanyList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    var action = "getCompanyList";
    var source = "HBEVBACKEND";
    var chsmtoGetCompanyList = action + source + "HBEVCompanyBApi";
    var chsm = CryptoJS.MD5(chsmtoGetCompanyList).toString().toLowerCase();

    $.ajax({
        type: "POST",
        url: `${apiURL}/company`,
        headers: { Authorization: "Bearer " + user_token },
        data: {
            action: action,
            source: source,
            chsm: chsm
        },
        success: function (responseData) {
            if (responseData.returnCode === "1" && responseData.returnData.length > 0) {
                console.log("AJAX company response data:", responseData.returnData); // Log response data
                populateCompanyDropdown(responseData.returnData);
            } else {
                handleApiResponse(responseData);
            }
        },
        error: function (error) {
            showErrorNotification();
        },
    });
}

function populateCompanyDropdown(companies) {
    const companyList = document.getElementById("Car-companyName");
    companyList.innerHTML = ''; // Clear existing options

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
function fetchSiteList() {
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