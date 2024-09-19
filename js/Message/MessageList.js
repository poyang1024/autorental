var table;

$(document).ready(function () {
    initializeMessageList();
    setupEventListeners();
    initializeDateRangePicker();
});

// Initialize message list
async function initializeMessageList() {
    try {
        await fetchMessageList();
    } catch (error) {
        console.error("Error during initialization:", error);
        showErrorNotification();
    }
}

// Initialize pushTime date range picker
function initializeDateRangePicker() {
    // var today = moment().format('YYYY/MM/DD');
    // $("#pushTime").daterangepicker({
    //     startDate: today,
    //     endDate: today,
    //     locale: {
    //         format: 'YYYY/MM/DD',
    //         cancelLabel: 'Clear'
    //     }
    // });

    // 初始化所有日期範圍選擇器
    $("input.dateRange").daterangepicker({
        autoUpdateInput: false,
        locale: {
            cancelLabel: 'Clear',
            format: 'YYYY/MM/DD'
        }
    });

    $("#pushTime").on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('YYYY/MM/DD') + ' - ' + picker.endDate.format('YYYY/MM/DD'));
    });

    $("#pushTime").on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
    });

    // $("#pushTime").val(today + ' - ' + today);

    // console.log("pushTime:", $("#pushTime").val());
}

// Set up event listeners
function setupEventListeners() {
    $("#searchBtn").on("click", async function () {
        var filterData = getFilterData();
        console.log("Search button clicked. Filter data:", filterData);
        await fetchMessageList(filterData);
    });
}

// Get filter data
function getFilterData() {
    var filterData = {};

    // Convert date format
    function convertDateTimeFormat(dateString) {
        return dateString.replace(/\//g, '-');
    }

    // 轉換日期格式
    function convertDateFormat(dateString) {
        if (!dateString) return { start: '', end: '' };
        var dates = dateString.split(' - ');
        return {
            start: moment(dates[0], 'YYYY/MM/DD').format('YYYY-MM-DD'),
            end: moment(dates[1], 'YYYY/MM/DD').format('YYYY-MM-DD')
        };
    }

     // Push Time (range)
     var pushTime = convertDateFormat($("#pushTime").val());
     if (pushTime.start && pushTime.end) {  // 確保 start 和 end 都有值
         filterData.pushSTime = pushTime.start;
         filterData.pushETime = pushTime.end;
     }

    // Start Time (single date)
    var startTime = $("#startTime").val();
    if (startTime) filterData.startTime = convertDateTimeFormat(startTime);

    // End Time (single date)
    var endTime = $("#endTime").val();
    if (endTime) filterData.endTime = convertDateTimeFormat(endTime);

    console.log("filter data:", filterData);
    return filterData;
}

// Fetch message list
async function fetchMessageList(filterData = {}) {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getMessageList";
    var source = "HBEVBACKEND";
    var chsmtoGetMessageList = action + source + "HBEVMessageBApi";
    var chsm = CryptoJS.MD5(chsmtoGetMessageList).toString().toLowerCase();

    var requestData = {
        action: action,
        source: source,
        chsm: chsm
    };

    // 將 filterData 添加到 requestData
    if (Object.keys(filterData).length > 0) {
        requestData.data = JSON.stringify(filterData);
        console.log(requestData);
    }


    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/message`,
            headers: { Authorization: "Bearer " + user_token },
            data: requestData
        });

        if (responseData.returnCode === "1") {
            console.log("AJAX response data:", responseData.returnData);
            updatePageWithData(responseData.returnData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error fetching message list:", error);
        showErrorNotification();
    }
}

// Update page data
function updatePageWithData(data) {
    if ($.fn.DataTable.isDataTable('#messageList')) {
        $('#messageList').DataTable().clear().destroy();
    }

    table = $("#messageList").DataTable({
        data: data,
        columns: [
            {
                render: function (data, type, row) {
                    var modifyButtonHtml = `<a href="messageDetail_update.html" style="display:none" class="btn btn-primary text-white modify-button" data-button-type="update" data-id="${row.id}">修改</a>`;
                    var readButtonHtml = `<a href="messageDetail_read.html" style="display:none" class="btn btn-warning text-white read-button" data-button-type="read" data-id="${row.id}">查看詳請</a>`;
                    var buttonsHtml = readButtonHtml + "&nbsp;" + modifyButtonHtml;
                    return buttonsHtml;
                },
            },
            { data: "title" },
            { data: "description" },
            { data: "tag" },
            { data: "pushTime" },
            { data: "startTime" },
            { data: "endTime" },
            { data: "updateTime" },
        ],
        drawCallback: function () {
            handlePagePermissions(currentUser, currentUrl);
        },
        columnDefs: [{ orderable: false, targets: [0] }],
        order: [],
        scrollX: true
    });
}

// Set up button click events
$(document).on("click", ".modify-button", function () {
    var id = $(this).data("id");
    sessionStorage.setItem("updateMessageId", id);
});

$(document).on("click", ".read-button", function () {
    var id = $(this).data("id");
    sessionStorage.setItem("readMessageId", id);
});