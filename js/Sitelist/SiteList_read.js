$(document).ready(async function () {
    handlePageReadPermissions(currentUser, currentUrl);

    // 取得詳細資料
    var readcsiteId = sessionStorage.getItem("readSiteId");
    const dataId = { id: readcsiteId, };
    const IdPost = JSON.stringify(dataId);

    // 解析JSON字符串为JavaScript对象
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    // 组装所需数据
    var action = "getSiteDetail";
    var source = "HBEVBACKEND";
    var chsmtoGetSiteList = action + source + "HBEVSiteBApi";
    var chsm = CryptoJS.MD5(chsmtoGetSiteList).toString().toLowerCase();

    // 发送POST请求  
    $.ajax({
        type: "POST",
        url: `${apiURL}/site`,
        headers: { Authorization: "Bearer " + user_token },
        data: {
            action: action,
            source: source,
            chsm: chsm,
            data: IdPost
        },
        success: function (responseData) {
            if (responseData.returnCode === "1" && responseData.returnData.length > 0) {
                console.log("AJAX response data:", responseData.returnData); // Log response data
                const siteData = responseData.returnData[0];

                // Store the original company ID for later use
                $("#R-company_name").val(siteData.companyId);
                $("#R-company_name").data("originalCompanyId", siteData.companyId);
                
                $("#R-rentalsite").val(siteData.name);
                $("#R-parkingnum").val(siteData.parkingAmount);
                $("#R-address").val(siteData.address);
                
                // Handle phone number
                handleNullableField("#phoneNumberContainer", "#R-phoneNumber", siteData.tel);
                
                // Handle business hours
                handleNullableField("#openingTimeContainer", "#R-openingtime", siteData.businessHour);
                
                $("#R-sitenum-X").val(siteData.coordinateX);
                $("#R-sitenum-Y").val(siteData.coordinateY);
                $("#R-sitenum1-X").val(siteData.coordinateULX);
                $("#R-sitenum1-Y").val(siteData.coordinateULY);
                $("#R-sitenum2-X").val(siteData.coordinateURX);
                $("#R-sitenum2-Y").val(siteData.coordinateURY);
                $("#R-sitenum3-X").val(siteData.coordinateLLX);
                $("#R-sitenum3-Y").val(siteData.coordinateLLY);
                $("#R-sitenum4-X").val(siteData.coordinateLRX);
                $("#R-sitenum4-Y").val(siteData.coordinateLRY);

                $("#R-status").val(siteData.status);
                $("#R-siteOrder").val(siteData.siteOrder);

                $("#BuildTime").val(siteData.createTime);
                $("#EditTime").val(siteData.updateTime);
                $("#EditAccount").val(siteData.updateOperatorName);

                // Handle photo
                handlePhoto(siteData.photo);

                // 填充完毕后隐藏加载中的spinner
                $("#spinner").hide();
            } else {
                handleApiResponse(responseData);
            }
        },
        error: function (error) {
            showErrorNotification();
        },
    });

    try {
        const companyList = await fetchCompanyList();
        populateCompanyDropdown(companyList);
    } catch (error) {
        console.error("Error fetching company list:", error);
        showErrorNotification();
    }
});

// Handle nullable fields
function handleNullableField(containerId, fieldId, value) {
    if (value === null || value === "") {
        $(containerId).hide();
    } else {
        $(containerId).show();
        $(fieldId).val(value);
    }
}

// Handle photo
function handlePhoto(photoUrl) {
    if (photoUrl === null || photoUrl === "") {
        $("#sitePhotoContainer").hide();
    } else {
        $("#sitePhotoContainer").show();
        $("#sitePhoto").attr("src", photoUrl);
    }
}

// 獲取公司列表
async function fetchCompanyList() {
    const userData = JSON.parse(localStorage.getItem("userData"));

    const action = "getCompanyList";
    const source = "HBEVBACKEND";
    const chsm = CryptoJS.MD5(action + source + "HBEVCompanyBApi").toString().toLowerCase();

    try {
        const response = await $.ajax({
            type: "POST",
            url: `${apiURL}/company`,
            headers: { Authorization: "Bearer " + userData.token },
            data: {
                action: action,
                source: source,
                chsm: chsm
            }
        });

        if (response.returnCode === "1" && Array.isArray(response.returnData) && response.returnData.length > 0) {
            return response.returnData;
        } else {
            handleApiResponse(response);
            return [];
        }
    } catch (error) {
        console.error("Error fetching company list:", error);
        showErrorNotification();
        return [];
    }
}

function populateCompanyDropdown(companies) {
    const companyList = document.getElementById("R-company_name");
    companyList.innerHTML = '';
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

    // Set the selected company to the original company
    const originalCompanyId = $("#R-company_name").data("originalCompanyId");
    if (originalCompanyId) {
        $("#R-company_name").val(originalCompanyId);
    }
}