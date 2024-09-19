$(document).ready(function () {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    var table;

    function initializeDataTable(data) {
        if ($.fn.DataTable.isDataTable('#memberVerifyList')) {
            $('#memberVerifyList').DataTable().clear().destroy();
        }
        table = $("#memberVerifyList").DataTable({
            data: data,
            columns: [
                {
                    render: function (data, type, row) {
                        var modifyButtonHtml = `<a href="memberVerifyDetail_update.html" style="display:none" class="btn btn-primary text-white modify-button" data-button-type="update" data-id="${row.id}">修改</a>`;
                        var readButtonHtml = `<a href="memberVerifyDetail_read.html" style="display:none" class="btn btn-warning text-white read-button" data-button-type="read" data-id="${row.id}">查看詳請</a>`;
                        var buttonsHtml = readButtonHtml + "&nbsp;" + modifyButtonHtml;
                        return buttonsHtml;
                    },
                },
                { data: "account" },
                { data: "name" },
                { data: "birthDay" },
                { data: "email" },
                { data: "phone" },
                { data: "verifyStatusName" },
                { data: "createTime" },
            ],
            drawCallback: function () {
                handlePagePermissions(currentUser, currentUrl);
            },
            columnDefs: [{ orderable: false, targets: [0] }],
            order: [],
        });
    }

    function fetchMemberVerifyList(filterData = { verifyStatus: "3" }) {
        var action = "getMemberVerifyList";
        var source = "HBEVBACKEND";
        var chsmtogetModelList = action + source + "HBEVMemberBApi";
        var chsm = CryptoJS.MD5(chsmtogetModelList).toString().toLowerCase();

        var ajaxData = {
            action: action,
            source: source,
            chsm: chsm
        };

        if (Object.keys(filterData).length > 0) {
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

    // Fetch initial data with default status 3
    fetchMemberVerifyList();

    // Search button click event
    $("#searchBtn").on("click", function() {
        var filterData = {};
        var verifyStatus = $("#verifystatus").val();

        if (verifyStatus) {
            filterData.verifyStatus = verifyStatus;
        } else {
            filterData.verifyStatus = "3"; // 如果沒有選擇狀態，默認使用狀態 3
        }

        fetchMemberVerifyList(filterData);
    });

    $(document).on("click", ".modify-button", function () {
        var id = $(this).data("id");
        sessionStorage.setItem("updateMemberVerifyId", id);
    });

    $(document).on("click", ".read-button", function () {
        var id = $(this).data("id");
        sessionStorage.setItem("readMemberVerifyId", id);
    });
});