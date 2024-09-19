// CarList create Detail
$(document).ready(function () {
    handlePageCreatePermissions(currentUser, currentUrl);
    initializeCreateCarForm();
});

function initializeCreateCarForm() {
    fetchCompanyList();
    fetchSiteList();
    fetchBrandList();
    fetchModelList();
    createCar()
}

function fetchCompanyList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

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
        success: function (response) {
            if (response.returnCode === "1" && response.returnData.length > 0) {
                populateCompanyDropdown(response.returnData);
            } else {
                handleApiResponse(response);
            }
        },
        error: function (error) {
            showErrorNotification();
        }
    });
}

function populateCompanyDropdown(companies) {
    const companyList = document.getElementById("Car-companyName");
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

// 獲取站點列表
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
            if (responseData.returnCode === "1" && responseData.returnData.length > 0) {
                populateSiteDropdown(responseData.returnData);
                populatepositionSiteDropdown(responseData.returnData);
            } else {
                handleApiResponse(responseData);
            }
        },
        error: function (error) {
            showErrorNotification();
        },
    });
}

function populateSiteDropdown(sites) {
    const siteList = document.getElementById("Car-siteName");
    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇站點";
    defaultOption.value = "";
    siteList.appendChild(defaultOption);

    sites.forEach(site => {
        const option = document.createElement("option");
        option.text = site.name;
        option.value = site.id;
        siteList.appendChild(option);
    });
}

function populatepositionSiteDropdown(positionSites) {
    const positionSiteList = document.getElementById("Car-positionSiteName");
    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇實際站點";
    defaultOption.value = "";
    positionSiteList.appendChild(defaultOption);

    positionSites.forEach(positionSite => {
        const option = document.createElement("option");
        option.text = positionSite.name;
        option.value = positionSite.id;
        positionSiteList.appendChild(option);
    });
}

// 獲取品牌列表
function fetchBrandList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    var action = "getBrandList";
    var source = "HBEVBACKEND";
    var chsmtoGetBrandList = action + source + "HBEVBrandBApi";
    var chsm = CryptoJS.MD5(chsmtoGetBrandList).toString().toLowerCase();

    $.ajax({
        type: "POST",
        url: `${apiURL}/brand`,
        headers: { Authorization: "Bearer " + user_token },
        data: {
            action: action,
            source: source,
            chsm: chsm
        },
        success: function (responseData) {
            if (responseData.returnCode === "1" && responseData.returnData.length > 0) {
                // populateBrandDropdown(responseData.returnData);
            } else {
                handleApiResponse(responseData);
            }
        },
        error: function (error) {
            showErrorNotification();
        },
    });

}

// function populateBrandDropdown(Brands) {
//     const brandList = document.getElementById("Car-brandName");
//     const defaultOption = document.createElement("option");
//     defaultOption.text = "請選擇品牌";
//     defaultOption.value = "";
//     brandList.appendChild(defaultOption);

//     Brands.forEach(Brand => {
//         const option = document.createElement("option");
//         option.text = Brand.name;
//         option.value = Brand.id;
//         brandList.appendChild(option);
//     });
// }

// 獲取車型列表
function fetchModelList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    var action = "getModelList";
    var source = "HBEVBACKEND";
    var chsmtoGetModelList = action + source + "HBEVModelBApi";
    var chsm = CryptoJS.MD5(chsmtoGetModelList).toString().toLowerCase();

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

function populateModelDropdown(Models) {
    const modelList = document.getElementById("Car-modelName");
    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇車型";
    defaultOption.value = "";
    modelList.appendChild(defaultOption);

    Models.forEach(Model => {
        const option = document.createElement("option");
        option.text = Model.name;
        option.value = Model.id;
        modelList.appendChild(option);
    });
}

function createCar() {
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

			var action = "insertCarDetail";
			var source = "HBEVBACKEND";
			var chsmtoCreateCar = action + source + "HBEVCarBApi";
			var chsm = CryptoJS.MD5(chsmtoCreateCar).toString().toLowerCase();

			const carData = {
				companyId: $("#Car-companyName").val(),
				siteId: $("#Car-siteName").val(),
				positionSiteId: $("#Car-positionSiteName").val(),
				manufactureYear: $("#Car-manufactureYear").val(),
				licensePlateNumber: $("#Car-licensePlateNumber").val(),
				IMEI: $("#Car-IMEI").val(),
				ICCID: $("#Car-ICCID").val(),
				monthlyMileage: $("#Car-monthlyMileage").val(),
                totalMileage: $("#Car-totalMileage").val(),
                // levelId: $("#Car-levelId").val(),
				// brandId: $("#Car-brandName").val(),
				modelId: $("#Car-modelName").val(),
				status: $("#carStatus").val()
			};

			const formData = new FormData();
			formData.append("action", action);
			formData.append("source", source);
			formData.append("chsm", chsm);
			formData.append("data", JSON.stringify(carData));

			$.ajax({
				type: "POST",
				url: `${apiURL}/car`,
				headers: { Authorization: "Bearer " + user_token },
				data: formData,
				processData: false,
				contentType: false,
				success: function (response) {
					if (response.returnCode === "1") {
						showSuccessFileNotification();
						setTimeout(function () {
							var newPageUrl = "carList.html";
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