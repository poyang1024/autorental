// 使用 async/await 重構主要的初始化函數
async function initializeCarList() {
    try {
        await fetchCarList();
        await Promise.all([
            initializeCompanyList(),
            initializeSiteList(),
            initializeModelList()
        ]);
        setupEventListeners();
    } catch (error) {
        console.error("Error during initialization:", error);
        showErrorNotification();
    }
}

// 初始化公司列表
async function initializeCompanyList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getCompanyList";
    var source = "HBEVBACKEND";
    var chsmtoGetManualList = action + source + "HBEVCompanyBApi";
    var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/company`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm
            }
        });

        if (responseData.returnCode === "1") {
            populateCompanyDropdown(responseData.returnData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error fetching company list:", error);
        showErrorNotification();
    }
}

// 初始化站點列表
async function initializeSiteList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getSiteList";
    var source = "HBEVBACKEND";
    var chsmtoGetSiteList = action + source + "HBEVSiteBApi";
    var chsm = CryptoJS.MD5(chsmtoGetSiteList).toString().toLowerCase();

    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/site`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
            }
        });

        if (responseData.returnCode === "1") {
            populateSiteDropdown(responseData.returnData);
            populatepositionSiteDropdown(responseData.returnData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error fetching site list:", error);
        showErrorNotification();
    }
}

// 初始化車型列表
async function initializeModelList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getModelList";
    var source = "HBEVBACKEND";
    var chsmtoGetModelList = action + source + "HBEVModelBApi";
    var chsm = CryptoJS.MD5(chsmtoGetModelList).toString().toLowerCase();

    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/model`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
            }
        });

        if (responseData.returnCode === "1") {
            populateModelDropdown(responseData.returnData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error fetching model list:", error);
        showErrorNotification();
    }
}

// 填充公司下拉列表
function populateCompanyDropdown(companies) {
    const companyList = document.getElementById("companySelect");
    companyList.innerHTML = ''; // 清空現有選項

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

// 填充權限下拉列表
function populateSiteDropdown(Sites) {
    const siteList = document.getElementById("siteSelect");
    siteList.innerHTML = ''; // 清空現有選項

    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇站點";
    defaultOption.value = "";
    siteList.appendChild(defaultOption);

    Sites.forEach(site => {
        const option = document.createElement("option");
        option.text = site.name;
        option.value = site.id;
        siteList.appendChild(option);
    });
}

// 填充權限下拉列表
function populatepositionSiteDropdown(positionSites) {
    const positionSiteList = document.getElementById("positionSiteIdSelect");
    positionSiteList.innerHTML = ''; // 清空現有選項

    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇站點";
    defaultOption.value = "";
    positionSiteList.appendChild(defaultOption);

    positionSites.forEach(positionSite => {
        const option = document.createElement("option");
        option.text = positionSite.name;
        option.value = positionSite.id;
        positionSiteList.appendChild(option);
    });
}

// 填充權限下拉列表
function populateModelDropdown(Models) {
    const modelList = document.getElementById("modelSelect");
    modelList.innerHTML = ''; // 清空現有選項

    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇車型";
    defaultOption.value = "";
    modelList.appendChild(defaultOption);

    Models.forEach(model => {
        const option = document.createElement("option");
        option.text = model.name;
        option.value = model.id;
        modelList.appendChild(option);
    });
}

// 設置事件監聽器
function setupEventListeners() {
    var selectedCompanyId, selectedSiteId, positionSiteIdSelect, selectedModelId, selectedcarStatus;

    $("#companySelect").on("change", function () {
        selectedCompanyId = $(this).val();
    });

    $("#siteSelect").on("change", function () {
        selectedSiteId = $(this).val();
    });

    $("#positionSiteIdSelect").on("change", function () {
        positionSiteIdSelect = $(this).val();
    });

    $("#modelSelect").on("change", function () {
        selectedModelId = $(this).val();
    });

    $("#carStatusSelect").on("change", function () {
        selectedcarStatus = $(this).val();
    });

    $("#searchBtn").on("click", async function () {
        var filterData = {};

        if (selectedCompanyId) filterData.companyId = selectedCompanyId;
        if (selectedSiteId) filterData.siteId = selectedSiteId;
        if (positionSiteIdSelect) filterData.positionSiteId = positionSiteIdSelect;
        if (selectedModelId) filterData.modelId = selectedModelId;
        if (selectedcarStatus) filterData.status = selectedcarStatus;

        if (Object.keys(filterData).length > 0) {
            await sendApiRequest(filterData);
        } else {
            await fetchCarList();
        }
    });
}

// 發送 API 請求
async function sendApiRequest(filterData) {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getCarList";
    var source = "HBEVBACKEND";
    var chsmtoGetCarList = action + source + "HBEVCarBApi";
    var chsm = CryptoJS.MD5(chsmtoGetCarList).toString().toLowerCase();

    var filterDataJSON = JSON.stringify(filterData);

    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/car`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
                data: filterDataJSON
            }
        });

        if (responseData.returnCode === "1") {
            updatePageWithData(responseData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error sending API request:", error);
        showErrorNotification();
    }
}

// 獲取帳號列表
async function fetchCarList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getCarList";
    var source = "HBEVBACKEND";
    var chsmtoGetManualList = action + source + "HBEVCarBApi";
    var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/car`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm
            }
        });

        if (responseData.returnCode === "1") {
            console.log(responseData.returnData);
            updatePageWithData(responseData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error fetching car list:", error);
        showErrorNotification();
    }
}

// 更新頁面數據
function updatePageWithData(responseData) {
    var dataTable = $("#carList").DataTable();
    dataTable.clear().destroy();
    var data = responseData.returnData;

    table = $("#carList").DataTable({
        columns: [
            {
                render: function (data, type, row) {
                    var modifyButtonHtml = `<a href="carDetail_update.html" style="display:none" class="btn btn-primary text-white modify-button" data-button-type="update" data-id="${row.id}">修改</a>`;
                    var readButtonHtml = `<a href="carDetail_read.html" style="display:none; margin-bottom:5px" class="btn btn-warning text-white read-button" data-button-type="read" data-id="${row.id}">查看詳情</a>`;
                    return readButtonHtml + "&nbsp;" + modifyButtonHtml;
                },
            },
            { data: "comapnyName" },
            { data: "siteName" },
            { data: "positionSiteName" },
            { data: "brandName" },
            { data: "modelName" },
            { data: "levelName" },
            { data: "manufactureYear" },
            { data: "licensePlateNumber" },
            { data: "monthlyMileage" },
            { data: "totalMileage" },
            { data: "statusName" },
        ],
        drawCallback: function () {
            handlePagePermissions(currentUser, currentUrl);
        },
        columnDefs: [{ orderable: false, targets: [0] }],
        order: [],
    });
    table.rows.add(data).draw();
}

// 設置按鈕點擊事件
$(document).on("click", ".modify-button", function () {
    var id = $(this).data("id");
    sessionStorage.setItem("updateCarId", id);
});

$(document).on("click", ".read-button", function () {
    var id = $(this).data("id");
    sessionStorage.setItem("readCarId", id);
});

// 頁面加載時初始化
$(document).ready(function () {
    initializeCarList();
});