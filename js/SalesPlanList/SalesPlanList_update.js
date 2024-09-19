$(document).ready(async function () {
    handlePageUpdatePermissions(currentUser, currentUrl);
    await initializeUpdateSalesPlanForm();
});

async function initializeUpdateSalesPlanForm() {
    try {
        await fetchSalesPlanDetails();
        await fetchCompanyList();
        await fetchModelList();
        setupUpdateSalesPlan();
    } catch (error) {
        console.error("Error during initialization:", error);
        showErrorNotification();
    }
}

async function fetchSalesPlanDetails() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var updatesalesPlanId = sessionStorage.getItem("updatesalesPlanId");
    const updatesalesPlanIddataId = { id: parseInt(updatesalesPlanId) };

    var action = "getSalesPlanDetail";
    var source = "HBEVBACKEND";
    var chsmtoGetsalesPlanDetail = action + source + "HBEVSalesPlanBApi";
    var chsm = CryptoJS.MD5(chsmtoGetsalesPlanDetail).toString().toLowerCase();

    try {
        const response = await $.ajax({
            type: "POST",
            url: `${apiURL}/salesPlan`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
                data: JSON.stringify(updatesalesPlanIddataId)
            }
        });

        if (response.returnCode === "1" && response.returnData.length > 0) {
            const salesPlanData = response.returnData[0];
            populateSalesPlanDataDetails(salesPlanData);
        } else {
            showErrorNotification();
            throw new Error("Invalid response");
        }
    } catch (error) {
        console.error("Error fetching sales plan details:", error);
        showErrorNotification();
        throw error;
    }
}

async function fetchCompanyList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getCompanyList";
    var source = "HBEVBACKEND";
    var chsmtoGetCompanyList = action + source + "HBEVCompanyBApi";
    var chsm = CryptoJS.MD5(chsmtoGetCompanyList).toString().toLowerCase();

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

        if (responseData.returnCode === "1" && responseData.returnData.length > 0) {
            populateCompanyDropdown(responseData.returnData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error fetching company list:", error);
        showErrorNotification();
    }
}

async function fetchModelList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getModelList";
    var source = "HBEVBACKEND";
    var chsmtoGetCarList = action + source + "HBEVModelBApi";
    var chsm = CryptoJS.MD5(chsmtoGetCarList).toString().toLowerCase();

    try {
        const response = await $.ajax({
            type: "POST",
            url: `${apiURL}/model`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm
            }
        });

        if (response.returnCode === "1" && response.returnData.length > 0) {
            populateModelDropdown(response.returnData);
        } else {
            handleApiResponse(response);
        }
    } catch (error) {
        console.error("Error fetching model list:", error);
        showErrorNotification();
    }
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
    
    $("#A-status").val(salesPlanData.status);

    $("#BuildTime").val(salesPlanData.createTime);
    $("#EditTime").val(salesPlanData.updateTime);
    $("#EditAccount").val(salesPlanData.updateOperatorName);

    if (salesPlanData.fileName == "") {
        showWarningNotification();
    }
    $("#spinner").hide();
}

function populateCompanyDropdown(companies) {
    const companyList = document.getElementById("S-companyName");
    companyList.innerHTML = ''; // Clear existing options
    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇公司";
    defaultOption.value = "";
    companyList.appendChild(defaultOption);

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

function populateModelDropdown(cars) {
    const carList = document.getElementById("S-modelName");
    carList.innerHTML = ''; // Clear existing options
    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇車型";
    defaultOption.value = "";
    carList.appendChild(defaultOption);

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

function setupUpdateSalesPlan() {
    var uploadForm = document.getElementById("uploadForm");

    uploadForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        if (uploadForm.checkValidity() === false) {
            event.stopPropagation();
            showWarningfillFormNotification();
        } else {
            try {
                const jsonStringFromLocalStorage = localStorage.getItem("userData");
                const getUserData = JSON.parse(jsonStringFromLocalStorage);
                const user_token = getUserData.token;

                var action = "updateSalesPlanDetail";
                var source = "HBEVBACKEND";
                var chsmtoUpdateSalesPlan = action + source + "HBEVSalesPlanBApi";
                var chsm = CryptoJS.MD5(chsmtoUpdateSalesPlan).toString().toLowerCase();

                var updatesalesPlanId = sessionStorage.getItem("updatesalesPlanId");
                const salesPlanData = {
                    id: parseInt(updatesalesPlanId),
                    companyId: $("#S-companyName").val(),
                    modelId: $("#S-modelName").val(),
                    pickFee: $("#S-pickFee").val(),
                    holidayIncreaseFee: $("#S-holidayIncreaseFee").val(),
                    freeTime: $("#S-freeTime").val(),
                    exceedTimeFee: $("#S-exceedTimeFee").val(),
                    freeMileage: $("#S-freeMileage").val(),
                    exceedMileageFee: $("#S-exceedMileageFee").val(),
                    status: $("#S-status").val()
                };

                const formData = new FormData();
                formData.append("action", action);
                formData.append("source", source);
                formData.append("chsm", chsm);
                formData.append("data", JSON.stringify(salesPlanData));

                console.log("Sending updateSalesPlanDetail request with data:", salesPlanData);

                const response = await $.ajax({
                    type: "POST",
                    url: `${apiURL}/salesPlan`,
                    headers: { Authorization: "Bearer " + user_token },
                    data: formData,
                    processData: false,
                    contentType: false
                });

                console.log("Received response from updateSalesPlanDetail:", response);

                if (response.returnCode === "1") {
                    console.log("updateSalesPlanDetail API call successful");
                    showSuccessFileNotification();
                    setTimeout(function () {
                        var newPageUrl = "salesPlanList.html";
                        window.location.href = newPageUrl;
                    }, 1000);
                } else {
                    console.log("updateSalesPlanDetail API call failed with return code:", response.returnCode);
                    handleApiResponse(response);
                    console.log("Full API response: ", response);
                }
            } catch (error) {
                console.error("Error updating sales plan:", error);
                showErrorNotification();
            }
        }
        uploadForm.classList.add("was-validated");
    });
}