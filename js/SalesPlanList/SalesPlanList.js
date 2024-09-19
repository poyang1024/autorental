// 使用 async/await 重構主要的初始化函數
async function initializeSalesPlanList() {
    try {
        await fetchSalesPlanList();
        await Promise.all([
            initializeCompanyList(),
            initializeCarList()
        ]);
        setupEventListeners();
    } catch (error) {
        console.error("Error during initialization:", error);
        showErrorNotification();
    }
}

// 初始化公司列表
async function initializeCompanyList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getCompanyList";
    var source = "HBEVBACKEND";
    var chsmtoGetManualList = action + source + "HBEVCompanyBApi";
    var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/company`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm
            }
        });

        if (responseData.returnCode === "1") {
            populateCompanyDropdown(responseData.returnData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error fetching company list:", error);
        showErrorNotification();
    }
}

// 初始化權限列表
async function initializeCarList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getModelList";
    var source = "HBEVBACKEND";
    var chsmtoGetAuthorizeList = action + source + "HBEVModelBApi";
    var chsm = CryptoJS.MD5(chsmtoGetAuthorizeList).toString().toLowerCase();

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
            // console.log("AJAX response data:", responseData.returnData); // Log response data
            populateCarDropdown(responseData.returnData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error fetching car list:", error);
        showErrorNotification();
    }
}

// 填充公司下拉列表
function populateCompanyDropdown(companies) {
    const storeList = document.getElementById("S-company");
    storeList.innerHTML = ''; // 清空現有選項

    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇公司";
    defaultOption.value = "";
    storeList.appendChild(defaultOption);

    companies.forEach(company => {
        const option = document.createElement("option");
        option.text = company.name;
        option.value = company.id;
        storeList.appendChild(option);
    });
}

// 填充權限下拉列表
function populateCarDropdown(cars) {
    const carList = document.getElementById("S-car");
    carList.innerHTML = ''; // 清空現有選項

    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇車型";
    defaultOption.value = "";
    carList.appendChild(defaultOption);

    cars.forEach(car => {
        const option = document.createElement("option");
        option.text = car.name;
        option.value = car.id;
        carList.appendChild(option);
    });
}

// 設置事件監聽器
function setupEventListeners() {
    var selectedCompanyId, selectedCarId, selectedStatus;

    $("#S-company").on("change", function () {
        selectedCompanyId = $(this).val();
    });

    $("#S-car").on("change", function () {
        selectedCarId = $(this).val();
    });

    $("#S-status").on("change", function () {
        selectedStatus = $(this).val();
    });

    $("#searchBtn").on("click", async function () {
        var filterData = {};

        if (selectedCompanyId) filterData.companyId = selectedCompanyId;
        if (selectedCarId) filterData.modelId = selectedCarId;
        if (selectedStatus) filterData.status = selectedStatus;

        if (Object.keys(filterData).length > 0) {
            await sendApiRequest(filterData);
        } else {
            await fetchSalesPlanList();
        }
    });
}

// 發送 API 請求
async function sendApiRequest(filterData) {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getSalesPlanList";
    var source = "HBEVBACKEND";
    var chsmtoGetManualList = action + source + "HBEVSalesPlanBApi";
    var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

    var filterDataJSON = JSON.stringify(filterData);

    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/salesPlan`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
                data: filterDataJSON
            }
        });

        if (responseData.returnCode === "1") {
            updatePageWithData(responseData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error sending API request:", error);
        showErrorNotification();
    }
}

// 獲取帳號列表
async function fetchSalesPlanList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getSalesPlanList";
    var source = "HBEVBACKEND";
    var chsmtoGetManualList = action + source + "HBEVSalesPlanBApi";
    var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/salesPlan`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm
            }
        });

        if (responseData.returnCode === "1") {
            console.log(responseData.returnData);
            updatePageWithData(responseData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error fetching account list:", error);
        showErrorNotification();
    }
}

// 更新頁面數據
function updatePageWithData(responseData) {
    var dataTable = $("#salesPlanList").DataTable();
    dataTable.clear().destroy();
    var data = responseData.returnData;

    table = $("#salesPlanList").DataTable({
        columns: [
            {
                render: function (data, type, row) {
                    var modifyButtonHtml = `<a href="salesPlanDetail_update.html" style="display:none" class="btn btn-primary text-white modify-button" data-button-type="update" data-id="${row.id}">修改</a>`;
                    var readButtonHtml = `<a href="salesPlanDetail_read.html" style="display:none; margin-bottom:5px" class="btn btn-warning text-white read-button" data-button-type="read" data-id="${row.id}">查看詳情</a>`;
                    return readButtonHtml + "&nbsp;" + modifyButtonHtml;
                },
            },
            { data: "name" },
            { data: "companyName" },
            { data: "modelName" },
            { data: "pickFee" },
            { data: "holidayIncreaseFee" },
            { data: "freeTime" },
            { data: "exceedTimeFee" },
            { data: "freeMileage" },
            { data: "exceedMileageFee" },
            { data: "statusName" }
        ],
        drawCallback: function () {
            handlePagePermissions(currentUser, currentUrl);
        },
        columnDefs: [{ orderable: false, targets: [0] }],
        order: [],
    });
    table.rows.add(data).draw();
}

// 設置按鈕點擊事件
$(document).on("click", ".modify-button", function () {
    var id = $(this).data("id");
    sessionStorage.setItem("updatesalesPlanId", id);
});

$(document).on("click", ".read-button", function () {
    var id = $(this).data("id");
    sessionStorage.setItem("readsalesPlanId", id);
});

// 頁面加載時初始化
$(document).ready(function () {
    initializeSalesPlanList();
});