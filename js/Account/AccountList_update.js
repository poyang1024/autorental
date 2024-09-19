$(document).ready(async function () {
    handlePageUpdatePermissions(currentUser, currentUrl);
    await initializeUpdateAccountForm();
});

async function initializeUpdateAccountForm() {
    try {
        await fetchAccountDetails();
        await fetchCompanyList();
        await fetchAuthorizeList();
        setupUpdateAccount();
    } catch (error) {
        console.error("Error during initialization:", error);
        showErrorNotification();
    }
}

async function fetchAccountDetails() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var updateAccountId = sessionStorage.getItem("updateAccountId");
    const updateAccountIddataId = { id: parseInt(updateAccountId) };

    var action = "getAccountDetail";
    var source = "HBEVBACKEND";
    var chsmtoGetAccountDetail = action + source + "HBEVAccountBApi";
    var chsm = CryptoJS.MD5(chsmtoGetAccountDetail).toString().toLowerCase();

    try {
        const response = await $.ajax({
            type: "POST",
            url: `${apiURL}/account`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
                data: JSON.stringify(updateAccountIddataId)
            }
        });

        if (response.returnCode === "1" && response.returnData.length > 0) {
            const accountData = response.returnData[0];
            populateAccountDetails(accountData);
        } else {
            showErrorNotification();
            throw new Error("Invalid response");
        }
    } catch (error) {
        console.error("Error fetching account details:", error);
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
        const response = await $.ajax({
            type: "POST",
            url: `${apiURL}/company`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm
            }
        });

        if (response.returnCode === "1" && response.returnData.length > 0) {
            populateCompanyDropdown(response.returnData);
        } else {
            handleApiResponse(response);
            throw new Error("Invalid response");
        }
    } catch (error) {
        console.error("Error fetching company list:", error);
        showErrorNotification();
        throw error;
    }
}

async function fetchAuthorizeList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getAuthorizeList";
    var source = "HBEVBACKEND";
    var chsmtoGetAuthorizeList = action + source + "HBEVAuthorizeBApi";
    var chsm = CryptoJS.MD5(chsmtoGetAuthorizeList).toString().toLowerCase();

    try {
        const response = await $.ajax({
            type: "POST",
            url: `${apiURL}/authorize`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm
            }
        });

        if (response.returnCode === "1" && response.returnData.length > 0) {
            populateAuthorizeDropdown(response.returnData);
        } else {
            handleApiResponse(response);
            throw new Error("Invalid response");
        }
    } catch (error) {
        console.error("Error fetching authorize list:", error);
        showErrorNotification();
        throw error;
    }
}

function populateAccountDetails(accountData) {
    $("#A-account").val(accountData.account);
    $("#A-password").val(accountData.password);
    $("#A-userName").val(accountData.userName);
    $("#A-email").val(accountData.email);
    $("#A-phoneNumber").val(accountData.phoneNumber);
    $("#A-status").val(accountData.status);

    $("#BuildTime").val(accountData.createTime);
    $("#EditTime").val(accountData.updateTime);
    $("#EditAccount").val(accountData.updateOperatorName);

    // Store the company and authorize IDs for later use
    sessionStorage.setItem("selectedCompanyId", accountData.companyId);
    sessionStorage.setItem("selectedAuthorizeId", accountData.authorizeId);

    if (accountData.fileName == "") {
        showWarningNotification();
    }
    $("#spinner").hide();
}

function populateCompanyDropdown(companies) {
    const companyList = document.getElementById("A-companyName");
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

function populateAuthorizeDropdown(authorizes) {
    const authorizeList = document.getElementById("A-authorizeName");
    authorizeList.innerHTML = ''; // Clear existing options
    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇角色";
    defaultOption.value = "";
    authorizeList.appendChild(defaultOption);

    const selectedAuthorizeId = sessionStorage.getItem("selectedAuthorizeId");

    authorizes.forEach(authorize => {
        const option = document.createElement("option");
        option.text = authorize.name;
        option.value = authorize.id;
        if (authorize.id.toString() === selectedAuthorizeId) {
            option.selected = true;
        }
        authorizeList.appendChild(option);
    });
}

function setupUpdateAccount() {
    var formData = new FormData();
    var uploadForm = document.getElementById("uploadForm");

    uploadForm.addEventListener("submit", function (event) {
        if (uploadForm.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            showWarningfillFormNotification();
        } else {
            event.preventDefault();
            const jsonStringFromLocalStorage = localStorage.getItem("userData");
            const getUserData = JSON.parse(jsonStringFromLocalStorage);
            const user_token = getUserData.token;

            var action = "updateAccountDetail";
            var source = "HBEVBACKEND";
            var chsmtoUpdateAccount = action + source + "HBEVAccountBApi";
            var chsm = CryptoJS.MD5(chsmtoUpdateAccount).toString().toLowerCase();

            var updateAccountId = sessionStorage.getItem("updateAccountId");
            const accountData = {
                id: parseInt(updateAccountId),
                account: $("#A-account").val(),
                userName: $("#A-userName").val(),
                companyId: $("#A-companyName").val(),
                email: $("#A-email").val(),
                phoneNumber: $("#A-phoneNumber").val(),
                authorizeId: $("#A-authorizeName").val(),
                status: $("#A-status").val()
            };

            // Only include password if it's been changed
            if ($("#A-password").val()) {
                accountData.password = $("#A-password").val();
            }

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