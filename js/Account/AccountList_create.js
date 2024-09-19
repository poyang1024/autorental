// AccountList create Detail
$(document).ready(function () {
    handlePageCreatePermissions(currentUser, currentUrl);
    initializeCreateAccountForm();
});

function initializeCreateAccountForm() {
    fetchCompanyList();
    fetchAuthorizeList();
    createAccount()
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
    const companyList = document.getElementById("A-companyName");
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

function fetchAuthorizeList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getAuthorizeList";
    var source = "HBEVBACKEND";
    var chsmtoGetAuthorizeList = action + source + "HBEVAuthorizeBApi";
    var chsm = CryptoJS.MD5(chsmtoGetAuthorizeList).toString().toLowerCase();

    $.ajax({
        type: "POST",
        url: `${apiURL}/authorize`,
        headers: { Authorization: "Bearer " + user_token },
        data: {
            action: action,
            source: source,
            chsm: chsm
        },
        success: function (response) {
            if (response.returnCode === "1" && response.returnData.length > 0) {
                populateAuthorizeDropdown(response.returnData);
            } else {
                handleApiResponse(response);
            }
        },
        error: function (error) {
            showErrorNotification();
        }
    });
}

function populateAuthorizeDropdown(authorizes) {
    const authorizeList = document.getElementById("A-authorizeName");
    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇角色";
    defaultOption.value = "";
    authorizeList.appendChild(defaultOption);

    authorizes.forEach(authorize => {
        const option = document.createElement("option");
        option.text = authorize.name;
        option.value = authorize.id;
        authorizeList.appendChild(option);
    });
}

function createAccount() {
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

			var action = "insertAccountDetail";
			var source = "HBEVBACKEND";
			var chsmtoCreateAccount = action + source + "HBEVAccountBApi";
			var chsm = CryptoJS.MD5(chsmtoCreateAccount).toString().toLowerCase();

			const accountData = {
				account: $("#A-account").val(),
				password: $("#A-password").val(),
				userName: $("#A-userName").val(),
				companyId: $("#A-companyName").val(),
				email: $("#A-email").val(),
				phoneNumber: $("#A-phoneNumber").val(),
				authorizeId: $("#A-authorizeName").val(),
				status: $("#A-status").val()
			};

			const formData = new FormData();
			formData.append("action", action);
			formData.append("source", source);
			formData.append("chsm", chsm);
			formData.append("data", JSON.stringify(accountData));

			$.ajax({
				type: "POST",
				url: `${apiURL}/account`,
				headers: { Authorization: "Bearer " + user_token },
				data: formData,
				processData: false,
				contentType: false,
				success: function (response) {
					if (response.returnCode === "1") {
						showSuccessFileNotification();
						setTimeout(function () {
							var newPageUrl = "accountList.html";
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