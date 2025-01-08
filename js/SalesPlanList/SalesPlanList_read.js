$(document).ready(async function () {
    handlePageReadPermissions(currentUser, currentUrl);
    await fetchSalesPlanDetails(); // 等待 fetchSalesPlanDetails 執行完成
    fetchCompanyList();
    fetchModelList();
});

function fetchSalesPlanDetails() {
    return new Promise((resolve, reject) => {
        const jsonStringFromLocalStorage = localStorage.getItem("userData");
        const gertuserData = JSON.parse(jsonStringFromLocalStorage);
        const user_token = gertuserData.token;

        var readsalesPlanId = sessionStorage.getItem("readsalesPlanId");
        const readsalesPlanIddataId = { id: parseInt(readsalesPlanId) };

        var action = "getSalesPlanDetail";
        var source = "HBEVBACKEND";
        var chsmtoGetsalesPlanDetail = action + source + "HBEVSalesPlanBApi";
        var chsm = CryptoJS.MD5(chsmtoGetsalesPlanDetail).toString().toLowerCase();

        $.ajax({
            type: "POST",
            url: `${apiURL}/salesPlan`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
                data: JSON.stringify(readsalesPlanIddataId)
            },
            success: function (response) {
                if (response.returnCode === "1" && response.returnData.length > 0) {
                    const salesPlanData = response.returnData[0];
                    populateSalesPlanDataDetails(salesPlanData);
                    console.log(salesPlanData)
                    resolve(); // 操作成功，返回 resolve
                } else {
                    showErrorNotification();
                    reject(); // 操作失败，返回 reject
                }
            },
            error: function (error) {
                showErrorNotification();
                reject(error); // 操作失败，返回 reject
            }
        });
    });
}

function populateSalesPlanDataDetails(salesPlanData) {
    $("#S-name").val(salesPlanData.name);
    sessionStorage.setItem("selectedCompanyId", salesPlanData.companyId);
    sessionStorage.setItem("selectedModelId", salesPlanData.modelId);
    $("#S-pickFee").val(salesPlanData.pickFee);
    $("#S-holidayIncreaseFee").val(salesPlanData.holidayIncreaseFee);
    $("#S-freeTime").val(salesPlanData.freeTime);
    $("#S-exceedTimeFee").val(salesPlanData.exceedTimeFee);
    $("#S-freeMileage").val(salesPlanData.freeMileage);
    $("#S-exceedMileageFee").val(salesPlanData.exceedMileageFee);
    
    $("#S-status").val(salesPlanData.status);
    $("#S-salesplanOrder").val(salesPlanData.salesplanOrder);

    $("#BuildTime").val(salesPlanData.createTime);
    $("#EditTime").val(salesPlanData.updateTime);
    $("#EditAccount").val(salesPlanData.updateOperatorName);

    if (salesPlanData.fileName == "") {
        showWarningNotification();
    }
    $("#spinner").hide();
}

// 獲取公司列表
function fetchCompanyList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    var action = "getCompanyList";
    var source = "HBEVBACKEND";
    var chsmtoGetCompanyList = action + source + "HBEVCompanyBApi";
    var chsm = CryptoJS.MD5(chsmtoGetCompanyList).toString().toLowerCase();

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
            if (responseData.returnCode === "1" && responseData.returnData.length > 0) {
                //console.log("AJAX company response data:", responseData.returnData); // Log response data
                populateCompanyDropdown(responseData.returnData);
            } else {
                handleApiResponse(responseData);
            }
        },
        error: function (error) {
            showErrorNotification();
        },
    });
}

function populateCompanyDropdown(companies) {
    const companyList = document.getElementById("S-companyName");
    companyList.innerHTML = ''; // Clear existing options

    const selectedCompanyId = sessionStorage.getItem("selectedCompanyId");

    companies.forEach(company => {
        const option = document.createElement("option");
        option.text = company.name;
        option.value = company.id;
        if (company.id.toString() === selectedCompanyId) {
            option.selected = true;
        }
        companyList.appendChild(option);
    });
}

// 獲取車型列表
function fetchModelList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    var action = "getModelList";
    var source = "HBEVBACKEND";
    var chsmtoGetCarList = action + source + "HBEVModelBApi";
    var chsm = CryptoJS.MD5(chsmtoGetCarList).toString().toLowerCase();

    $.ajax({
        type: "POST",
        url: `${apiURL}/model`,
        headers: { Authorization: "Bearer " + user_token },
        data: {
            action: action,
            source: source,
            chsm: chsm
        },
        success: function (responseData) {
            if (responseData.returnCode === "1" && responseData.returnData.length > 0) {
                populateModelDropdown(responseData.returnData);
            } else {
                handleApiResponse(responseData);
            }
        },
        error: function (error) {
            showErrorNotification();
        },
    });
}

function populateModelDropdown(cars) {
    const carList = document.getElementById("S-modelName");
    carList.innerHTML = ''; // Clear existing options

    const selectedModelId = sessionStorage.getItem("selectedModelId");

    cars.forEach(car => {
        const option = document.createElement("option");
        option.text = car.name;
        option.value = car.id;
        if (car.id.toString() === selectedModelId) {
            option.selected = true;
        }
        carList.appendChild(option);
    });
}