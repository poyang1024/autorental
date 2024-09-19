$(document).ready(async function () {
    handlePageReadPermissions(currentUser, currentUrl);
    await fetchAccountDetails(); // 等待 fetchAccountDetails 執行完成
    fetchCompanyList();
    fetchAuthorizeList();
});

function fetchAccountDetails() {
    return new Promise((resolve, reject) => {
        const jsonStringFromLocalStorage = localStorage.getItem("userData");
        const gertuserData = JSON.parse(jsonStringFromLocalStorage);
        const user_token = gertuserData.token;

        var readAccountId = sessionStorage.getItem("readAccountId");
        const readAccountIddataId = { id: parseInt(readAccountId) };

        var action = "getAccountDetail";
        var source = "HBEVBACKEND";
        var chsmtoGetAccountDetail = action + source + "HBEVAccountBApi";
        var chsm = CryptoJS.MD5(chsmtoGetAccountDetail).toString().toLowerCase();

        $.ajax({
            type: "POST",
            url: `${apiURL}/account`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
                data: JSON.stringify(readAccountIddataId)
            },
            success: function (response) {
                if (response.returnCode === "1" && response.returnData.length > 0) {
                    const accountData = response.returnData[0];
                    populateAccountDetails(accountData);
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

function populateAccountDetails(accountData) {
    $("#A-account").val(accountData.account);
    $("#A-password").val(accountData.password);
    $("#A-userName").val(accountData.userName);
    sessionStorage.setItem("selectedCompanyId", accountData.companyId);
    $("#A-email").val(accountData.email);
    $("#A-phoneNumber").val(accountData.phoneNumber);
    sessionStorage.setItem("selectedAuthorizeId", accountData.authorizeId);
    $("#A-status").val(accountData.status);

    $("#BuildTime").val(accountData.createTime);
    $("#EditTime").val(accountData.updateTime);
    $("#EditAccount").val(accountData.updateOperatorName);

    if (accountData.fileName == "") {
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
                console.log("AJAX company response data:", responseData.returnData); // Log response data
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
    const companyList = document.getElementById("A-companyName");
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

// 獲取權限列表
function fetchAuthorizeList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

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
        success: function (responseData) {
            if (responseData.returnCode === "1" && responseData.returnData.length > 0) {
                populateAuthorizeDropdown(responseData.returnData);
            } else {
                handleApiResponse(responseData);
            }
        },
        error: function (error) {
            showErrorNotification();
        },
    });
}

function populateAuthorizeDropdown(authorizes) {
    const authorizeList = document.getElementById("A-authorizeName");
    authorizeList.innerHTML = ''; // Clear existing options

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