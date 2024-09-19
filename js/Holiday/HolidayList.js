var table;
$(document).ready(function () {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    var action = "getHolidayList";
    var source = "HBEVBACKEND";
    var chsmtoGetHolidayList = action + source + "HBEVHolidayBApi";
    var chsm = CryptoJS.MD5(chsmtoGetHolidayList).toString().toLowerCase();

    if ($.fn.DataTable.isDataTable('#holidayList')) {
        $('#holidayList').DataTable().clear().destroy();
    }
    table = $("#holidayList").DataTable({
        columns: [
            {
                render: function (data, type, row) {
                    var modifyButtonHtml = `<a href="holidayDetail_update.html" style="display:none" class="btn btn-primary text-white modify-button" data-button-type="update" data-id="${row.id}">修改</a>`;
                    var readButtonHtml = `<a href="holidayDetail_read.html" style="display:none" class="btn btn-warning text-white read-button" data-button-type="read" data-id="${row.id}">查看詳請</a>`;
                    // var deleteButtonHtml = `<button class="btn btn-danger delete-button" style="display:none" data-button-type="delete"  data-id="${row.id}">刪除</button>`;
                    var buttonsHtml = readButtonHtml + "&nbsp;" + modifyButtonHtml ;

					return buttonsHtml;
                },
            },
            { data: "name" },
            { data: "specifyDate" },
        ],
        drawCallback: function () {
            handlePagePermissions(currentUser, currentUrl);
        },
        columnDefs: [{ orderable: false, targets: [0] }],
        order: [],
    });

    $.ajax({
        type: "POST",
        url: `${apiURL}/holiday`,
        headers: { Authorization: "Bearer " + user_token },
        data: {
            action: action,
            source: source,
            chsm: chsm
        },
        success: function (responseData) {
            if (responseData.returnCode === "1") {
                // console.log("AJAX response data:", responseData.returnData); // Log response data
                updatePageWithData(responseData);
            } else {
                handleApiResponse(responseData);
            }
        },
        error: function (error) {
            showErrorNotification();
        },
    });

    function updatePageWithData(responseData) {
        table.clear().rows.add(responseData.returnData).draw();
    }

    $(document).on("click", ".modify-button", function () {
        var id = $(this).data("id");
        sessionStorage.setItem("updateHolidayId", id);
    });

    $(document).on("click", ".read-button", function () {
        var id = $(this).data("id");
        sessionStorage.setItem("readHolidayId", id);
    });
});