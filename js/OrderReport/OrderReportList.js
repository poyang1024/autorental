var table;

$(document).ready(function () {
    initializeOrderList();
});

async function initializeOrderList() {
    try {
        await fetchOrderReportList();
        await Promise.all([
            initializeCompanyList(),
            initializeSiteList(),
            initializeModelList()
        ]);
        initializeDateRangePickers();
        setupSearchEventListener();
        setupGetOrderReportCsvEventListener();
    } catch (error) {
        console.error("Error during initialization:", error);
        showErrorNotification();
    }
}

async function initializeCompanyList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getCompanyList";
    var source = "HBEVBACKEND";
    var chsmtoGetSiteList = action + source + "HBEVCompanyBApi";
    var chsm = CryptoJS.MD5(chsmtoGetSiteList).toString().toLowerCase();

    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/company`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
            }
        });

        if (responseData.returnCode === "1") {
            populatepickupCompanyDropdown(responseData.returnData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error fetching site list:", error);
        showErrorNotification();
    }
}

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
            populatepickupStationDropdown(responseData.returnData);
            populatereturnStationDropdown(responseData.returnData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error fetching site list:", error);
        showErrorNotification();
    }
}

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

function populatepickupCompanyDropdown(Companies) {
    const companyList = document.getElementById("companySelect");
    companyList.innerHTML = '';
    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇公司";
    defaultOption.value = "";
    companyList.appendChild(defaultOption);
    Companies.forEach(company => {
        const option = document.createElement("option");
        option.text = company.name;
        option.value = company.id;
        companyList.appendChild(option);
    });
}

function populatepickupStationDropdown(Sites) {
    const siteList = document.getElementById("pickupStation");
    siteList.innerHTML = '';
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

function populatereturnStationDropdown(positionSites) {
    const positionSiteList = document.getElementById("returnStation");
    positionSiteList.innerHTML = '';
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

function populateModelDropdown(Models) {
    const modelList = document.getElementById("modelSelect");
    modelList.innerHTML = '';
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

function initializeDateRangePickers() {
    $("input.dateRange").daterangepicker({
        autoUpdateInput: false,
        locale: {
            cancelLabel: 'Clear',
            format: 'YYYY/MM/DD'
        }
    });

    $("#startTime, #endTime").daterangepicker({
        autoUpdateInput: false,
        locale: {
            format: 'YYYY/MM/DD'
        }
    });

    $('input.dateRange, #startTime, #endTime').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('YYYY/MM/DD') + ' - ' + picker.endDate.format('YYYY/MM/DD'));
    });

    $('input.dateRange, #startTime, #endTime').on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
    });
}

function setupSearchEventListener() {
    $("#searchBtn").off('click').on("click", async function() {
        var filterData = getFilterData();
        await fetchOrderReportList(filterData);
    });
}

function getFilterData() {
    var filterData = {};

    function convertDateFormat(dateString) {
        console.log("dateString:", dateString);
        if (!dateString) return { start: '', end: '' };
        var dates = dateString.split(' - ');
        return {
            start: moment(dates[0], 'YYYY/MM/DD').format('YYYY-MM-DD'),
            end: moment(dates[1], 'YYYY/MM/DD').format('YYYY-MM-DD')
        };
    }

    var startTime = convertDateFormat($("#startTime").val());
    if (startTime.start) {
        filterData.orderStimeS = startTime.start;
        filterData.orderStimeE = startTime.end;
    }

    var endTime = convertDateFormat($("#endTime").val());
    if (endTime.start) {
        filterData.orderEtimeS = endTime.start;
        filterData.orderEtimeE = endTime.end;
    }

    var pickupStation = $("#pickupStation").val();
    if (pickupStation) filterData.pickSiteId = pickupStation;

    var returnStation = $("#returnStation").val();
    if (returnStation) filterData.returnSiteId = returnStation;

    var companyId = $("#companySelect").val();
    if (companyId) filterData.companyId = companyId;

    var modelId = $("#modelSelect").val();
    if (modelId) filterData.modelId = modelId;

    var status = $("#orderStatusSelect").val();
    if (status) filterData.status = status;

    console.log("Filter data:", filterData);
    return filterData;
}

async function fetchOrderReportList(filterData = {}) {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getOrderReport";
    var source = "HBEVBACKEND";
    var chsmtoGetManualList = action + source + "HBEVReportBApi";
    var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

    var requestData = {
        action: action,
        source: source,
        chsm: chsm
    };

    if (Object.keys(filterData).length > 0) {
        requestData.data = JSON.stringify(filterData);
    }

    console.log("Request data:", requestData);

    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/report`,
            headers: { Authorization: "Bearer " + user_token },
            data: requestData
        });

        if (responseData.returnCode === "1") {
            console.log("API response data:", responseData.returnData);
            updatePageWithData(responseData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error fetching order list:", error);
        showErrorNotification();
    }
}

function updatePageWithData(responseData) {
    if ($.fn.DataTable.isDataTable('#orderReportList')) {
        $('#orderReportList').DataTable().destroy();
    }

    var data = responseData.returnData;

    if (!Array.isArray(data)) {
        data = [];
    }

    table = $("#orderReportList").DataTable({
        data: data,
        columns: [
            { data: "orderNo" },
            { data: "createTime" },
            { data: "orderStime" },
            { data: "orderEtime" },
            { data: "pickTime" },
            { data: "returnTime" },
            { data: "modelName" },
            { data: "licensePlateNumber" },
            { data: "createOperatorName" },
            { data: "companyName" },
            { data: "pickSiteName" },
            { data: "returnSiteName" },
            { data: "realPickSiteName" },
            { data: "realReturnSiteName" },
            { data: "deviceType" },
            { data: "salesPlanName" },
            { data: "amount" },
            { data: "rentHour" },
            { data: "pickCarFee" },
            { data: "deposit" },
            { data: "pickTotalMileage" },
            { data: "returnTotalMileage" },
            { data: "totalMileage" },
            { data: "exceedMileageFee" },
            { data: "exceedTimeFee" },
            { data: "returnFee" },
            { data: "appealFee" },
            { data: "cancelFee" },
            { data: "totalAmount" },
            { data: "statusName" },
            { data: "remark" },
        ],
        drawCallback: function () {
            handlePagePermissions(currentUser, currentUrl);
        },
        // Remove the columnDefs option to make all columns sortable
        order: [[0, 'asc']], // Optional: Set initial sort on the first column
    });
}

function setupGetOrderReportCsvEventListener() {
    $("#csvBtn").off('click').on("click", async function() {
        await getOrderReportCsv();
    });
}

async function getOrderReportCsv() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getOrderReportCSV";
    var source = "HBEVBACKEND";
    var chsmtoGetManualList = action + source + "HBEVReportBApi";
    var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

    var requestData = {
        action: action,
        source: source,
        chsm: chsm
    };

    try {
        const response = await $.ajax({
            type: "POST",
            url: `${apiURL}/report`,
            headers: { 
                Authorization: "Bearer " + user_token
            },
            data: requestData,
            // 設定回應類型為 blob
            xhrFields: {
                responseType: 'blob'
            }
        });

        // 創建 Blob 物件
        const blob = new Blob([response], { type: 'text/csv' });
        
        // 創建下載連結
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // 設定檔案名稱（可以根據需求修改）
        const currentDate = new Date().toISOString().slice(0,10);
        link.download = `order_report_${currentDate}.csv`;
        
        // 添加連結到文件中並觸發點擊
        document.body.appendChild(link);
        link.click();
        
        // 清理
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Error downloading CSV file:", error);
        showErrorNotification();
    }
}
