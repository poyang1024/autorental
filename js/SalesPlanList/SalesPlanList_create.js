// AccountList create Detail
$(document).ready(function () {
    handlePageCreatePermissions(currentUser, currentUrl);
    initializeCreateSalesPlanForm();
});

function initializeCreateSalesPlanForm() {
    fetchCompanyList();
    fetchModelList();
    createSalesPlan()
}

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
    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇公司";
    defaultOption.value = "";
    companyList.appendChild(defaultOption);

    companies.forEach(company => {
        const option = document.createElement("option");
        option.text = company.name;
        option.value = company.id;
        companyList.appendChild(option);
    });
}

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

function createSalesPlan() {
	var formData = new FormData();
	var uploadForm = document.getElementById("uploadForm");

	// 添加表单提交事件监听器
	uploadForm.addEventListener("submit", function (event) {
		if (uploadForm.checkValidity() === false) {
			event.preventDefault();
			event.stopPropagation();
			showWarningfillFormNotification();
		} else {
			// 处理表单提交
			event.preventDefault();
			const jsonStringFromLocalStorage = localStorage.getItem("userData");
			const getUserData = JSON.parse(jsonStringFromLocalStorage);
			const user_token = getUserData.token;

			var action = "insertSalesPlanDetail";
			var source = "HBEVBACKEND";
			var chsmtoCreateSalesPlan = action + source + "HBEVSalesPlanBApi";
			var chsm = CryptoJS.MD5(chsmtoCreateSalesPlan).toString().toLowerCase();

			const salesPlanData = {
				name: $("#S-name").val(),
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

			$.ajax({
				type: "POST",
				url: `${apiURL}/salesPlan`,
				headers: { Authorization: "Bearer " + user_token },
				data: formData,
				processData: false,
				contentType: false,
				success: function (response) {
					if (response.returnCode === "1") {
						showSuccessFileNotification();
						setTimeout(function () {
							var newPageUrl = "salesPlanList.html";
							window.location.href = newPageUrl;
						}, 1000);
					} else {
						handleApiResponse(response);
						console.log("Api response: " + response);
					}
				},
				error: function (error) {
					console.error(error);
					showErrorNotification();
				}
			});
		}
		uploadForm.classList.add("was-validated");
	});
}