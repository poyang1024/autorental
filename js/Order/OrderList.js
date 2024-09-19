var table;

$(document).ready(function () {
    initializeOrderList();
});

async function initializeOrderList() {
    try {
        await fetchOrderList();
        await Promise.all([
            initializeSiteList(),
            initializeModelList()
        ]);
        initializeDateRangePickers();
        setupSearchEventListener();
    } catch (error) {
        console.error("Error during initialization:", error);
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
        await fetchOrderList(filterData);
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

    var modelId = $("#modelSelect").val();
    if (modelId) filterData.modelId = modelId;

    var status = $("#orderStatusSelect").val();
    if (status) filterData.status = status;

    console.log("Filter data:", filterData);
    return filterData;
}

async function fetchOrderList(filterData = {}) {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getOrderList";
    var source = "HBEVBACKEND";
    var chsmtoGetManualList = action + source + "HBEVOrderBApi";
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
            url: `${apiURL}/order`,
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
    if ($.fn.DataTable.isDataTable('#orderList')) {
        $('#orderList').DataTable().destroy();
    }

    var data = responseData.returnData;

    if (!Array.isArray(data)) {
        data = [];
    }

    table = $("#orderList").DataTable({
        data: data,
        columns: [
            {
                render: function (data, type, row) {
                    var readButtonHtml = `<a href="orderDetail_read.html" style="display:none; margin-bottom:5px" class="btn btn-warning text-white read-button" data-button-type="read" data-id="${row.orderNo}">查看詳情</a>`;
                    return readButtonHtml;
                },
            },
            { data: "orderNo" },
            { data: "createTime" },
            { data: "orderStime" },
            { data: "orderEtime" },
            { data: "modelName" },
            { data: "licensePlateNumber" },
            { data: "createOperatorName" },
            { data: "pickSiteName" },
            { data: "returnSiteName" },
            { data: "salesPlanName" },
            { data: "rentHour" },
            { data: "deposit" },
            { data: "returnFee" },
            { data: "totalAmount" },
            { data: "statusName" },
        ],
        drawCallback: function () {
            handlePagePermissions(currentUser, currentUrl);
        },
        columnDefs: [{ orderable: false, targets: [0] }],
        order: [],
    });
}

$(document).on("click", ".read-button", function () {
    var id = $(this).data("id");
    sessionStorage.setItem("readOrderId", id);
});