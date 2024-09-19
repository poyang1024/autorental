// 取得公司資料、存取ID
$(document).ready(function () {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    var action = "getCompanyList";
    var source = "HBEVBACKEND";
    var chsmtoGetManualList = action + source + "HBEVCompanyBApi";
    var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

    // 發送API請求以獲取數據
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
                const companyList = document.getElementById("companySelect");

                const defaultOption = document.createElement("option");
                defaultOption.text = "請選擇公司";
                defaultOption.value = "";
                companyList.appendChild(defaultOption);

                for (let i = 0; i < responseData.returnData.length; i++) {
                    const company = responseData.returnData[i];
                    const companyName = company.name;
                    const companyId = company.id;

                    const option = document.createElement("option");
                    option.text = companyName;
                    option.value = companyId;

                    companyList.appendChild(option);
                }
            } else {
                handleApiResponse(responseData);
            }
        },
        error: function (error) {
            showErrorNotification();
        },
    });
});

var table;
$(document).ready(function () {
    if ($.fn.DataTable.isDataTable('#rentalsiteList')) {
        $('#rentalsiteList').DataTable().clear().destroy();
    }
    table = $("#rentalsiteList").DataTable({
        columns: [
            {
                render: function (data, type, row) {
                    var modifyButtonHtml = `<a href="siteDetail_update.html" style="display:none" class="btn btn-primary text-white modify-button" data-button-type="update" data-id="${row.id}">修改</a>`;
                    var readButtonHtml = `<a href="siteDetail_read.html" style="display:none" class="btn btn-warning text-white read-button" data-button-type="read" data-id="${row.id}">查看詳請</a>`;
                    var buttonsHtml = readButtonHtml + "&nbsp;" + modifyButtonHtml;
                    return buttonsHtml;
                },
            },
            { data: "companyName" },
            { data: "name" },
            { data: "parkingAmount" },
            { data: "address" },
            { data: "coordinateY" },
            { data: "coordinateX" },
            { data: "tel" },
            { data: "businessHour" },
            { data: "statusName" },
            { data: "siteOrder" },
        ],
        drawCallback: function () {
            handlePagePermissions(currentUser, currentUrl);
        },
        columnDefs: [{ orderable: false, targets: [0] }],
        order: [],
    });

    // 初始加載所有站點
    fetchSiteList();

    $(document).on("click", ".modify-button", function () {
        var id = $(this).data("id");
        sessionStorage.setItem("updateSiteId", id);
    });

    $(document).on("click", ".read-button", function () {
        var id = $(this).data("id");
        sessionStorage.setItem("readSiteId", id);
    });
});

// 監聽欄位變動
$(document).ready(function () {
    var selectedCompanyId, selectedStatus;

    // 監聽選擇租車公司的變化
    $("#companySelect").on("change", function () {
        selectedCompanyId = $("#companySelect").val();
    });

    $("#site-status").on("change", function () {
        selectedStatus = $(this).val();
    });

    // 點擊搜索按鈕時觸發API請求
    $("#searchButton").on("click", function () {
        var filterData = {};
        if (selectedCompanyId) filterData.companyId = selectedCompanyId;
        if (selectedStatus) filterData.status = selectedStatus;

        if (Object.keys(filterData).length > 0) {
            sendApiRequest(filterData);
        } else {
            // 如果沒有選擇公司，則獲取所有站點
            fetchSiteList();
        }
    });

    function sendApiRequest(filterData) {
        const jsonStringFromLocalStorage = localStorage.getItem("userData");
        const gertuserData = JSON.parse(jsonStringFromLocalStorage);
        const user_token = gertuserData.token;
        
        var action = "getSiteList";
        var source = "HBEVBACKEND";
        var chsmtoGetSiteList = action + source + "HBEVSiteBApi";
        var chsm = CryptoJS.MD5(chsmtoGetSiteList).toString().toLowerCase();
    
        var filterDataJSON = JSON.stringify(filterData);
    
        // console.log("Sending API request with filter:", filterDataJSON);  // 調試日誌
    
        $.ajax({
            type: "POST",
            url: `${apiURL}/site`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
                data: filterDataJSON
            },
            success: function (responseData) {
                // console.log("API response:", responseData);  // 調試日誌
                if (responseData.returnCode === "1") {
                    updatePageWithData(responseData);
                } else {
                    handleApiResponse(responseData);
                }
            },
            error: function (error) {
                // console.error("API request error:", error);  // 調試日誌
                showErrorNotification();
            },
        });
    }
});

function fetchSiteList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;
    
    var action = "getSiteList";
    var source = "HBEVBACKEND";
    var chsmtoGetSiteList = action + source + "HBEVSiteBApi";
    var chsm = CryptoJS.MD5(chsmtoGetSiteList).toString().toLowerCase();

    $.ajax({
        type: "POST",
        url: `${apiURL}/site`,
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
}

function updatePageWithData(responseData) {
    // console.log("Updating page with data:", responseData);  // 調試日誌

    if ($.fn.DataTable.isDataTable('#rentalsiteList')) {
        $('#rentalsiteList').DataTable().destroy();
    }

    var data = responseData.returnData;
    
    table = $("#rentalsiteList").DataTable({
        data: data,
        columns: [
            {
                render: function (data, type, row) {
                    var modifyButtonHtml = `<a href="siteDetail_update.html" style="display:none" class="btn btn-primary text-white modify-button" data-button-type="update" data-id="${row.id}">修改</a>`;
                    var readButtonHtml = `<a href="siteDetail_read.html" style="display:none" class="btn btn-warning text-white read-button" data-button-type="read" data-id="${row.id}">查看詳請</a>`;
                    var buttonsHtml = readButtonHtml + "&nbsp;" + modifyButtonHtml;
                    return buttonsHtml;
                },
            },
            { data: "companyName" },
            { data: "name" },
            { data: "parkingAmount" },
            { data: "address" },
            { data: "coordinateY" },
            { data: "coordinateX" },
            { data: "tel" },
            { data: "businessHour" },
            { data: "statusName" },
            { data: "siteOrder" },
        ],
        drawCallback: function () {
            handlePagePermissions(currentUser, currentUrl);
        },
        columnDefs: [{ orderable: false, targets: [0] }],
        order: [],
    });

    // console.log("DataTable updated with rows:", table.rows().count());  // 調試日誌
}