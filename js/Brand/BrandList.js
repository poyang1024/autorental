var table;
$(document).ready(function () {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    var action = "getBrandList";
    var source = "HBEVBACKEND";
    var chsmtoGetHolidayList = action + source + "HBEVBrandBApi";
    var chsm = CryptoJS.MD5(chsmtoGetHolidayList).toString().toLowerCase();

    if ($.fn.DataTable.isDataTable('#brandList')) {
        $('#brandList').DataTable().clear().destroy();
    }
    table = $("#brandList").DataTable({
        columns: [
            {
                render: function (data, type, row) {
                    var modifyButtonHtml = `<a href="brandDetail_update.html" style="display:none" class="btn btn-primary text-white modify-button" data-button-type="update" data-id="${row.id}">修改</a>`;
                    var readButtonHtml = `<a href="brandDetail_read.html" style="display:none" class="btn btn-warning text-white read-button" data-button-type="read" data-id="${row.id}">查看詳請</a>`;
                    // var deleteButtonHtml = `<button class="btn btn-danger delete-button" style="display:none" data-button-type="delete"  data-id="${row.id}">刪除</button>`;
                    var buttonsHtml = readButtonHtml + "&nbsp;" + modifyButtonHtml ;

					return buttonsHtml;
                },
            },
            { data: "name" },
            { data: "statusName" },
            { data: "brandOrder" },
        ],
        drawCallback: function () {
            handlePagePermissions(currentUser, currentUrl);
        },
        columnDefs: [{ orderable: false, targets: [0] }],
        order: [],
    });

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
            if (responseData.returnCode === "1") {
                console.log("AJAX response data:", responseData.returnData); // Log response data
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
        sessionStorage.setItem("updateBrandId", id);
    });

    $(document).on("click", ".read-button", function () {
        var id = $(this).data("id");
        sessionStorage.setItem("readBrandId", id);
    });
});