// 使用 async/await 重構主要的初始化函數
async function initializeModelList() {
    try {
        await fetchModelList();
        await initializeBrandList();
        setupEventListeners();
    } catch (error) {
        console.error("Error during initialization:", error);
        showErrorNotification();
    }
}

// 初始化品牌列表
async function initializeBrandList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getBrandList";
    var source = "HBEVBACKEND";
    var chsmtoGetManualList = action + source + "HBEVBrandBApi";
    var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/brand`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm
            }
        });

        if (responseData.returnCode === "1") {
            populateBrandDropdown(responseData.returnData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error fetching brand list:", error);
        showErrorNotification();
    }
}

// 填充品牌下拉列表
function populateBrandDropdown(brands) {
    const brandList = document.getElementById("brandSelect");
    brandList.innerHTML = ''; // 清空現有選項

    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇品牌";
    defaultOption.value = "";
    brandList.appendChild(defaultOption);

    brands.forEach(brand => {
        const option = document.createElement("option");
        option.text = brand.name;
        option.value = brand.id;
        brandList.appendChild(option);
    });
}

// 設置事件監聽器
function setupEventListeners() {
    var brandSelect, selectedlevelId, selectedStatus;

    $("#brandSelect").on("change", function () {
        brandSelect = $(this).val();
    });

    $("#levelId").on("change", function () {
        selectedlevelId = $(this).val();
    });

    $("#sales-status").on("change", function () {
        selectedStatus = $(this).val();
    });

    $("#searchBtn").on("click", async function () {
        var filterData = {};

        if (brandSelect) filterData.brandId = brandSelect;
        if (selectedlevelId) filterData.levelId = selectedlevelId;
        if (selectedStatus) filterData.status = selectedStatus;

        if (Object.keys(filterData).length > 0) {
            await sendApiRequest(filterData);
        } else {
            await fetchModelList();
        }
    });
}

// 發送 API 請求
async function sendApiRequest(filterData) {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getModelList";
    var source = "HBEVBACKEND";
    var chsmtoGetManualList = action + source + "HBEVModelBApi";
    var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

    var filterDataJSON = JSON.stringify(filterData);

    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/model`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
                data: filterDataJSON
            }
        });

        if (responseData.returnCode === "1") {
            console.log("Response data after search:", responseData.returnData);
            updatePageWithData(responseData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error sending API request:", error);
        showErrorNotification();
    }
}

// 獲取模型列表
async function fetchModelList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getModelList";
    var source = "HBEVBACKEND";
    var chsmtoGetManualList = action + source + "HBEVModelBApi";
    var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/model`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm
            }
        });

        if (responseData.returnCode === "1") {
            updatePageWithData(responseData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error fetching model list:", error);
        showErrorNotification();
    }
}

// 更新頁面數據
function updatePageWithData(responseData) {
    var dataTable = $("#modelList").DataTable();
    dataTable.clear().destroy();
    var data = responseData.returnData;

    table = $("#modelList").DataTable({
        columns: [
            {
                render: function (data, type, row) {
                    var modifyButtonHtml = `<a href="modelDetail_update.html" style="display:none" class="btn btn-primary text-white modify-button" data-button-type="update" data-id="${row.id}">修改</a>`;
                    var readButtonHtml = `<a href="modelDetail_read.html" style="display:none" class="btn btn-warning text-white read-button" data-button-type="read" data-id="${row.id}">查看詳請</a>`;
                    var buttonsHtml = readButtonHtml + "&nbsp;" + modifyButtonHtml;
                    return buttonsHtml;
                },
            },
            { data: "brandName" },
            { data: "name" },
            { data: "seatHeight" },
            { data: "weight" },
            { data: "horsepower" },
            { data: "levelName" },
            { data: "statusName" },
            { data: "modelOrder" }
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
    sessionStorage.setItem("updateModelId", id);
});

$(document).on("click", ".read-button", function () {
    var id = $(this).data("id");
    sessionStorage.setItem("readModelId", id);
});

// 頁面加載時初始化
$(document).ready(function () {
    initializeModelList();
});