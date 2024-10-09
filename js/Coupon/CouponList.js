var table;
var checkedRows = new Set();

$(document).ready(function () {

   // 初始化日期範圍選擇器並獲取預設的租車時間範圍
   var defaultDateRange = initializeDateRangePickers();

   // 初始數據加載，傳入預設的租車時間範圍
   fetchCouponList(defaultDateRange);

   var uploadForm = document.getElementById("uploadForm");
    uploadForm.addEventListener("submit", function (event) {
        event.preventDefault();
        if (checkedRows.size === 0) {
            showWarningcouponNotification();
        } else if (!uploadForm.checkValidity()) {
            event.stopPropagation();
            uploadForm.classList.add('was-validated');
        } else {
            insertCouponDetail();
        }
    });
});

function initializeDateRangePickers() {
    // 計算過去一個月的日期範圍
    var endDate = moment().endOf('day');
    var startDate = moment().subtract(1, 'month').startOf('day');
    // var today = moment().format('YYYY/MM/DD');

    // 初始化所有日期範圍選擇器
    $("input.dateRange").daterangepicker({
        autoUpdateInput: false,
        locale: {
            cancelLabel: 'Clear',
            format: 'YYYY/MM/DD'
        }
    });

    // 為 "最後租車時間" 設置特定的預設值
    $("#lastRentalTime").daterangepicker({
        startDate: startDate,
        endDate: endDate,
        locale: {
            format: 'YYYY/MM/DD'
        }
    });

    // // 為 "生日" 和 "註冊時間" 設置當天到當天的預設值
    // $("#birthday, #registrationTime").daterangepicker({
    //     startDate: today,
    //     endDate: today,
    //     locale: {
    //         format: 'YYYY/MM/DD'
    //     }
    // });

    // 當日期被選中時更新輸入框
    $('input.dateRange').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('YYYY/MM/DD') + ' - ' + picker.endDate.format('YYYY/MM/DD'));
    });

    // 當點擊清除按鈕時清空輸入框
    $('input.dateRange').on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
    });

    // 初始設置 "生日" 和 "註冊時間" 的輸入框值
    // $("#birthday, #registrationTime").val(today + ' - ' + today);

    // 設置並返回預設的最後租車時間範圍
    $("#lastRentalTime").val(startDate.format('YYYY/MM/DD') + ' - ' + endDate.format('YYYY/MM/DD'));
    return {
        lastRentalSTime: startDate.format('YYYY-MM-DD'),
        lastRentalETime: endDate.format('YYYY-MM-DD')
    };
}

function initializeDataTable(data) {
    if ($.fn.DataTable.isDataTable('#couponList')) {
        $('#couponList').DataTable().destroy();
    }
    
    allData = data; // 存儲完整數據集

    table = $("#couponList").DataTable({
        data: data,
        columns: [
            {
                data: null,
                render: function (data, type, row, meta) {
                    if (type === 'display') {
                        return '<input type="checkbox" class="coupon-checkbox">';
                    }
                    return null;
                },
                orderable: false
            },
            { data: "account" },
            { data: "name" },
            { data: "birthDay" },
            { data: "email" },
            { data: "phone" },
            { data: "totalMileage" },
            { data: "levelName" },
            { data: "createTime" },
            { data: "lastOrderTime" },
            { data: "couponAmount" }
        ],
        pageLength: 3, // 設置每頁顯示 3 個項目
        lengthMenu: false, // 禁用長度菜單
        lengthChange: false, // 禁止更改每頁顯示數量
        rowCallback: function(row, data) {
            var checkbox = $('input.coupon-checkbox', row);
            checkbox.prop('checked', checkedRows.has(data.id));
            checkbox.data('id', data.id);
        },
        drawCallback: function () {
            handlePagePermissions(currentUser, currentUrl);
            updateSelectAllCheckbox();
        },
        columnDefs: [{ orderable: false, targets: [0] }],
        order: [],
        initComplete: function() {
            attachEventListeners();
            setupSearchEventListener();
            updateSelectAllCheckbox();
        }
    });
}

function updateSelectAllCheckbox() {
    if (!table) return; // 如果表格未初始化則退出
    var totalRows = table.rows().count();
    var selectedRows = checkedRows.size;
    $('#select-all').prop('checked', totalRows > 0 && selectedRows === totalRows);
}

function attachEventListeners() {
    // 處理 "全選" 複選框
    $('#select-all').off('click').on('click', function() {
        var isChecked = $(this).prop('checked');
        table.rows().every(function(rowIdx, tableLoop, rowLoop) {
            var data = this.data();
            if (isChecked) {
                checkedRows.add(data.id);
            } else {
                checkedRows.delete(data.id);
            }
        });
        table.rows().nodes().to$().find('.coupon-checkbox').prop('checked', isChecked);
        updateSelectAllCheckbox();
    });

    // 處理單個複選框點擊
    $('#couponList').off('click', '.coupon-checkbox').on('click', '.coupon-checkbox', function(e) {
        e.stopPropagation(); // 防止行選擇
        var id = $(this).data('id');
        if (this.checked) {
            checkedRows.add(id);
        } else {
            checkedRows.delete(id);
        }
        updateSelectAllCheckbox();
    });
}

function setupSearchEventListener() {
    $("#searchBtn").on("click", async function() {
        var filterData = getFilterData();
        if (Object.keys(filterData).length > 0) {
            await sendApiRequest(filterData);
        } else {
            await fetchCouponList();
        }
    });
}


function getLevelName(levelId) {
    const levelMap = {
        "1": "普通輕型機車",
        "2": "普通重型機車",
        "3": "大型三輪機車",
        "4": "大型速克達機車",
        "5": "大型重型機車"
    };
    return levelMap[levelId] || "";
}

// 更新獲取過濾數據的函數
function getFilterData() {
    var filterData = {};

    // 轉換日期格式
    function convertDateFormat(dateString) {
        console.log("dateString:", dateString);
        if (!dateString) return { start: '', end: '' };
        var dates = dateString.split(' - ');
        return {
            start: moment(dates[0], 'YYYY/MM/DD').format('YYYY-MM-DD'),
            end: moment(dates[1], 'YYYY/MM/DD').format('YYYY-MM-DD')
        };
    }

    // 日期
    var lastRentalTime = convertDateFormat($("#lastRentalTime").val());
    if (lastRentalTime.start && lastRentalTime.end) {
        filterData.lastOrderSTime = lastRentalTime.start;
        filterData.lastOrderETime = lastRentalTime.end;
    }

    var birthday = convertDateFormat($("#birthday").val());
    if (birthday.start && birthday.end) {
        filterData.birthDaySTime = birthday.start;
        filterData.birthDayETime = birthday.end;
    }

    var registrationTime = convertDateFormat($("#registrationTime").val());
    if (registrationTime.start && registrationTime.end) {
        filterData.createSTime = registrationTime.start;
        filterData.createETime = registrationTime.end;
    }

    // 其他查詢
    var license = $("#Car-levelId").val();
    if (license) filterData.levelId = license;

    var totalMileageStart = $("#totalMileageStart").val();
    if (totalMileageStart) filterData.totalMileageS = totalMileageStart;

    var totalMileageEnd = $("#totalMileageEnd").val();
    if (totalMileageEnd) filterData.totalMileageE = totalMileageEnd;

    console.log("filter data:", filterData);

    return filterData;
}

// 更新發送 API 請求的函數
async function sendApiRequest(filterData) {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getMemberCouponList";
    var source = "HBEVBACKEND";
    var chsmtoGetMessageList = action + source + "HBEVCouponBApi";
    var chsm = CryptoJS.MD5(chsmtoGetMessageList).toString().toLowerCase();

    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/coupon`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
                data: JSON.stringify(filterData)
            }
        });

        if (responseData.returnCode === "1") {
            console.log("AJAX response data:", responseData.returnData);
            updatePageWithData(responseData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error sending API request:", error);
        showErrorNotification();
    }
}

async function fetchCouponList(defaultDateRange = null) {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    var action = "getMemberCouponList";
    var source = "HBEVBACKEND";
    var chsmtoGetMessageList = action + source + "HBEVCouponBApi";
    var chsm = CryptoJS.MD5(chsmtoGetMessageList).toString().toLowerCase();

    var requestData = {
        action: action,
        source: source,
        chsm: chsm
    };

    // 如果有預設日期範圍，添加到請求數據中
    if (defaultDateRange) {
        requestData.data = JSON.stringify(defaultDateRange);
    }

    $.ajax({
        type: "POST",
        url: `${apiURL}/coupon`,
        headers: { Authorization: "Bearer " + user_token },
        data: requestData,
        success: function (responseData) {
            if (responseData.returnCode === "1") {
                console.log("AJAX response data:", responseData.returnData);
                initializeDataTable(responseData.returnData);
            } else {
                handleApiResponse(responseData);
            }
        },
        error: function (error) {
            showErrorNotification();
        },
    });
}

function insertCouponDetail() {
    showSpinner(); // 顯示 loading spinner

    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    // 收集表單數據
    const couponData = {
        couponName: $("#couponName").val(),
        couponValue: $("#couponValue").val(),
        deadline: $("#deadline").val()
    };

    // 獲取被選中的用戶 ID
    const selectedUserIds = Array.from(checkedRows);
    const action = "insertCouponDetail";
    const source = "HBEVBACKEND";

    // 準備 API 請求數據
    const requestData = {
        action: "insertCouponDetail",
        source: "HBEVBACKEND",
        chsm: CryptoJS.MD5(action + source + "HBEVCouponBApi").toString().toLowerCase(),
        data: JSON.stringify(couponData),
        userId: JSON.stringify(selectedUserIds)
    };

    // 發送 API 請求
    $.ajax({
        type: "POST",
        url: `${apiURL}/coupon`,
        headers: { Authorization: "Bearer " + user_token },
        data: requestData,
        success: function (responseData) {
            hideSpinner(); // 隱藏 loading spinner
            if (responseData.returnCode === "1") {
                showSuccessFileNotification();
                console.log("AJAX response data:", responseData);
                // 可能需要重新加載數據或更新界面
                window.location.reload();
                fetchCouponList();
            } else {
                handleApiResponse(responseData);
            }
        },
        error: function (error) {
            hideSpinner(); // 隱藏 loading spinner
            showErrorNotification("優惠券發送失敗");
        },
    });
}

// 更新頁面數據
function updatePageWithData(responseData) {
    if ($.fn.DataTable.isDataTable('#couponList')) {
        $('#couponList').DataTable().destroy();
    }

    table = $("#couponList").DataTable({
        data: responseData.returnData,
        columns: [
            {
                data: null,
                render: function (data, type, row, meta) {
                    if (type === 'display') {
                        return '<input type="checkbox" class="coupon-checkbox">';
                    }
                    return null;
                },
                orderable: false
            },
            { data: "account" },
            { data: "name" },
            { data: "birthDay" },
            { data: "email" },
            { data: "phone" },
            { data: "totalMileage" },
            { data: "levelName" },
            { data: "createTime" },
            { data: "lastOrderTime" },
            { data: "couponAmount" }
        ],
        pageLength: 3, // 設置每頁顯示 3 個項目
        lengthMenu: false, // 禁用長度菜單
        lengthChange: false, // 禁止更改每頁顯示數量
        drawCallback: function () {
            handlePagePermissions(currentUser, currentUrl);
            updateSelectAllCheckbox();
        },
        columnDefs: [{ orderable: false, targets: [0] }],
        order: [],
        rowCallback: function(row, data) {
            var checkbox = $('input.coupon-checkbox', row);
            checkbox.prop('checked', checkedRows.has(data.id));
            checkbox.data('id', data.id);
        },
        initComplete: function() {
            updateSelectAllCheckbox();
        }
    });
}

function showSpinner() {
    $("#spinner").removeClass("hide").addClass("show");
}

function hideSpinner() {
    $("#spinner").removeClass("show").addClass("hide");
}
