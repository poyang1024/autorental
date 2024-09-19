var table;
$(document).ready(function () {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    var action = "getCompanyList";
    var source = "HBEVBACKEND";
    var chsmtoGetManualList = action + source + "HBEVCompanyBApi";
    var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

    if ($.fn.DataTable.isDataTable('#companyList')) {
        $('#companyList').DataTable().clear().destroy();
    }
    table = $("#companyList").DataTable({
        columns: [
            {
                render: function (data, type, row) {
                    var modifyButtonHtml = `<a href="companyDetail_update.html" style="display:none" class="btn btn-primary text-white modify-button" data-button-type="update" data-id="${row.id}">修改</a>`;
                    var readButtonHtml = `<a href="companyDetail_read.html" style="display:none" class="btn btn-warning text-white read-button" data-button-type="read" data-id="${row.id}">查看詳請</a>`;
                    // var deleteButtonHtml = `<button class="btn btn-danger delete-button" style="display:none" data-button-type="delete"  data-id="${row.id}">刪除</button>`;
                    var buttonsHtml = readButtonHtml + "&nbsp;" + modifyButtonHtml ;

					return buttonsHtml;
                },
            },
            { data: "name" },
            { data: "fontColor" },
            { data: "companyTitle" },
            { data: "taxId" },
            { data: "statusName" },
            { data: "companyOrder" },
        ],
        drawCallback: function () {
            handlePagePermissions(currentUser, currentUrl);
        },
        columnDefs: [{ orderable: false, targets: [0] }],
        order: [],
    });

    $.ajax({
        type: "POST",
        url: `${apiURL}/company`,
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
        sessionStorage.setItem("updateCompanyId", id);
    });

    $(document).on("click", ".read-button", function () {
        var id = $(this).data("id");
        sessionStorage.setItem("readCompanyId", id);
    });

    // $(document).on("click", ".delete-button", function () {
    //     var itemId = $(this).data("id");
    //     var data = JSON.stringify({ id: itemId });

    //     toastr.warning(
    //         "確定要刪除所選文件嗎？<br/><br><button class='btn btn-danger confirm-delete'>删除</button>",
    //         "確定刪除",
    //         {
    //             allowHtml: true,
    //         }
    //     );

    //     $(document).off("click", ".confirm-delete").on("click", ".confirm-delete", function () {
    //         deleteCompanyDetail(apiURL, user_token, itemId, data);
    //     });
    // });

    // function deleteCompanyDetail(apiURL, token, itemId, data) {
    //     var action = "deleteCompanyDetail";
    //     var chsm = CryptoJS.MD5(token + action + "HBEVCompanyBApi").toString().toLowerCase();
    //     var formData = new FormData();
    //     formData.append("action", action);
    //     formData.append("token", token);
    //     formData.append("chsm", chsm);
    //     formData.append("data", data);

    //     $.ajax({
    //         type: "POST",
    //         url: `${apiURL}/company`,
    //         data: formData,
    //         processData: false,
    //         contentType: false,
    //         success: function (response) {
    //             if (response.returnCode === "1") {
    //                 toastr.success("刪除成功");
    //                 location.reload();
    //             } else {
    //                 handleApiResponse(response);
    //             }
    //         },
    //         error: function (error) {
    //             showErrorNotification();
    //         },
    //     });
    // }
});
