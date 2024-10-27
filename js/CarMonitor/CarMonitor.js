// 使用 async/await 重構主要的初始化函數
async function initializeCarMonitorList() {
    try {
        await fetchCarMonitorList();
        await Promise.all([
            initializeCompanyList(),
            initializeSiteList(),
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
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error fetching site list:", error);
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


// 設置事件監聽器
function setupEventListeners() {
    var selectedCompanyId, selectedSiteId, selectedcarStatus, selectedStatusId;

    $("#companySelect").on("change", function () {
        selectedCompanyId = $(this).val();
    });

    $("#siteSelect").on("change", function () {
        selectedSiteId = $(this).val();
    });

    $("#carStatusSelect").on("change", function () {
        selectedcarStatus = $(this).val();
    });

    $("#StatusSelect").on("change", function () {
        selectedStatusId = $(this).val();
    });

    $("#searchBtn").on("click", async function () {
        var filterData = {};

        if (selectedCompanyId) filterData.companyId = selectedCompanyId;
        if (selectedSiteId) filterData.siteId = selectedSiteId;
        if (selectedcarStatus) filterData.carStatus = selectedcarStatus;
        if (selectedStatusId) filterData.status = selectedStatusId;
        

        if (Object.keys(filterData).length > 0) {
            await sendApiRequest(filterData);
        } else {
            await fetchCarMonitorList();
        }
    });
}

// 發送 API 請求
async function sendApiRequest(filterData) {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getCarMonitor";
    var source = "HBEVBACKEND";
    var chsmtoGetMonitorList = action + source + "HBEVCarBApi";
    var chsm = CryptoJS.MD5(chsmtoGetMonitorList).toString().toLowerCase();

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

// 獲取車輛監控列表
async function fetchCarMonitorList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getCarMonitor";
    var source = "HBEVBACKEND";
    var chsmtoGetCarMonitorList = action + source + "HBEVCarBApi";
    var chsm = CryptoJS.MD5(chsmtoGetCarMonitorList).toString().toLowerCase();

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
    var dataTable = $("#carMonitorList").DataTable();
    dataTable.clear().destroy();
    var data = responseData.returnData;

    table = $("#carMonitorList").DataTable({
        columns: [
            {
                render: function (data, type, row) {
                    var unlockButtonHtml = `<button class="btn btn-success text-white unlock-button" style="display:none; margin-bottom:5px" data-button-type="powerOn" data-id="${row.id}">解鎖</button>`;
                    var lockButtonHtml = `<button class="btn btn-danger text-white lock-button" style="display:none; margin-bottom:5px " data-button-type="powerOff" data-id="${row.id}">上鎖</button>`;
                    var orderDetailButtonHtml = `<a href="../orderList/orderDetail_read.html" data-id="${row.orderNo}" data-button-type="orderDetail" class="btn btn-primary text-white" style="display:none; margin-bottom:5px">前往訂單</a>`;
                    var carMapButtonHtml = `<a href="../carMap/carMap.html" data-id="${row.licensePlateNumber}" data-button-type="carMap" class="btn btn-primary text-white" style="display:none; margin-bottom:5px" onclick="setCarMapSearch('${row.licensePlateNumber}')">前往地圖</a>`;
                    return unlockButtonHtml + "&nbsp;" + lockButtonHtml + "&nbsp;" + orderDetailButtonHtml + "&nbsp;" + carMapButtonHtml;
                },
            },
            { data: "RTCTime" },
            { data: "companyName" },
            { data: "siteName" },
            { data: "licensePlateNumber" },
            { data: "IMEI" },
            { data: "carBigBatterySOC" },
            { data: "gpsBatteryVoltage" },
            { data: "carVoltage" },
            { data: "carStatusName" },
            { data: "statusName" },
            { data: "orderNo" }
        ],
        drawCallback: function () {
            handlePagePermissions(currentUser, currentUrl);
        },
        columnDefs: [{ orderable: false, targets: [0] }],
        order: [],
    });
    table.rows.add(data).draw();
}

function setCarMapSearch(licensePlateNumber) {
    localStorage.setItem('carMapSearch', licensePlateNumber);
}

// 設置按鈕點擊事件
$(document).on("click", ".unlock-button", function () {
    var id = $(this).data("id");
    $('#confirmUnlockModal').data('id', id).modal('show');
});

$(document).on("click", ".lock-button", function () {
    var id = $(this).data("id");
    $('#confirmLockModal').data('id', id).modal('show');
});

// 確認解鎖
$('#confirmUnlock').on('click', function() {
    var id = $('#confirmUnlockModal').data('id');
    $('#confirmUnlockModal').modal('hide');
    callPowerApi(id, "powerOn");
});

// 確認上鎖
$('#confirmLock').on('click', function() {
    var id = $('#confirmLockModal').data('id');
    $('#confirmLockModal').modal('hide');
    callPowerApi(id, "powerOff");
});

// 呼叫電源 API
async function callPowerApi(id, action) {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var source = "HBEVBACKEND";
    var chsmString = action + source + "HBEVCarBApi";
    var chsm = CryptoJS.MD5(chsmString).toString().toLowerCase();

    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/car`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
                data: JSON.stringify({ carId: id })
            }
        });

        if (responseData.returnCode === "1") {
            showSuccessNotification(action === "powerOn" ? "解鎖成功" : "上鎖成功");
            console.log(responseData);
            // 重新加載車輛列表
            await fetchCarMonitorList();
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error(`Error calling ${action} API:`, error);
        showErrorNotification();
    }
}

// 頁面加載時初始化
$(document).ready(function () {
    initializeCarMonitorList();
});

// 顯示成功通知
function showSuccessNotification(message) {
    // 實現顯示成功通知的邏輯
    toastr.success(message, "成功");
}