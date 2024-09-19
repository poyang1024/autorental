var table;
$(document).ready(function () {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    var action = "getSalesPlanRecord";
    var source = "HBEVBACKEND";
    var chsmtoGetHolidayList = action + source + "HBEVSalesPlanBApi";
    var chsm = CryptoJS.MD5(chsmtoGetHolidayList).toString().toLowerCase();

    if ($.fn.DataTable.isDataTable('#salesPlanRecordList')) {
        $('#salesPlanRecordList').DataTable().clear().destroy();
    }
    table = $("#salesPlanRecordList").DataTable({
        columns: [
            { data: "name" },
            { data: "companyName" },
            { data: "modelName" },
            { data: "pickFee" },
            { data: "holidayIncreaseFee" },
            { data: "freeTime" },
            { data: "exceedTimeFee" },
            { data: "freeMileage" },
            { data: "exceedMileageFee" },
            { data: "status" },
            { data: "updateOperatorName" },
            { data: "action" },
            { data: "updateTime" },
        ],
        drawCallback: function () {
            handlePagePermissions(currentUser, currentUrl);
        },
        // Remove the columnDefs option to make all columns sortable
        order: [[0, 'asc']], // Optional: Set initial sort on the first column
    });

    $.ajax({
        type: "POST",
        url: `${apiURL}/salesPlan`,
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

    // $(document).on("click", ".modify-button", function () {
    //     var id = $(this).data("id");
    //     sessionStorage.setItem("updateHolidayId", id);
    // });

    // $(document).on("click", ".read-button", function () {
    //     var id = $(this).data("id");
    //     sessionStorage.setItem("readHolidayId", id);
    // });
});