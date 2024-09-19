$(document).ready(function () {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    var table;

    function initializeDataTable(data) {
        if ($.fn.DataTable.isDataTable('#memberList')) {
            $('#memberList').DataTable().clear().destroy();
        }
        table = $("#memberList").DataTable({
            data: data,
            columns: [
                {
                    render: function (data, type, row) {
                        var modifyButtonHtml = `<a href="memberDetail_update.html" style="display:none" class="btn btn-primary text-white modify-button" data-button-type="update" data-id="${row.id}">修改</a>`;
                        var readButtonHtml = `<a href="memberDetail_read.html" style="display:none" class="btn btn-warning text-white read-button" data-button-type="read" data-id="${row.id}">查看詳請</a>`;
                        var buttonsHtml = readButtonHtml + "&nbsp;" + modifyButtonHtml;
                        return buttonsHtml;
                    },
                },
                { data: "account" },
                { data: "name" },
                { data: "birthDay" },
                { data: "email" },
                { data: "phone" },
                { data: "remark" },
                { data: "levelName" },
                { data: "totalMileage" },
                { data: "verifyStatusName" },
                { data: "statusName" },
                { data: "createTime" },
                { data: "updateTime" },
            ],
            drawCallback: function () {
                handlePagePermissions(currentUser, currentUrl);
            },
            columnDefs: [{ orderable: false, targets: [0] }],
            order: [],
        });
    }

    function fetchMemberList(filterData = null) {
        var action = "getMemberList";
        var source = "HBEVBACKEND";
        var chsmtogetModelList = action + source + "HBEVMemberBApi";
        var chsm = CryptoJS.MD5(chsmtogetModelList).toString().toLowerCase();

        var ajaxData = {
            action: action,
            source: source,
            chsm: chsm
        };

        if (filterData && Object.keys(filterData).length > 0) {
            ajaxData.data = JSON.stringify(filterData);
        }

        $.ajax({
            type: "POST",
            url: `${apiURL}/member`,
            headers: { Authorization: "Bearer " + user_token },
            data: ajaxData,
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

    // Fetch initial data
    fetchMemberList();

    // Search button click event
    $("#searchBtn").on("click", function() {
        var filterData = {};
        var levelId = $("#levelId").val();
        var verifyStatus = $("#verifystatus").val();
        var status = $("#Mem-status").val();

        if (levelId) filterData.levelId = levelId;
        if (verifyStatus) filterData.verifyStatus = verifyStatus;
        if (status) filterData.status = status;

        // 只在有查詢條件時傳遞 filterData
        if (Object.keys(filterData).length > 0) {
            fetchMemberList(filterData);
        } else {
            fetchMemberList(); // 沒有查詢條件時獲取所有數據
        }
    });

    $(document).on("click", ".modify-button", function () {
        var id = $(this).data("id");
        sessionStorage.setItem("updateMemberId", id);
    });

    $(document).on("click", ".read-button", function () {
        var id = $(this).data("id");
        sessionStorage.setItem("readMemberId", id);
    });
});