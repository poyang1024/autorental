$(document).ready(async function () {
    handlePageReadPermissions(currentUser, currentUrl);

    // 取得詳細資料
    var readModelId = sessionStorage.getItem("readModelId");
    const dataId = { id: readModelId, };
    const IdPost = JSON.stringify(dataId);

    // 解析JSON字符串为JavaScript对象
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    // 组装所需数据
    var action = "getModelDetail";
    var source = "HBEVBACKEND";
    var chsmtoGetSiteList = action + source + "HBEVModelBApi";
    var chsm = CryptoJS.MD5(chsmtoGetSiteList).toString().toLowerCase();

    // 发送POST请求  
    $.ajax({
        type: "POST",
        url: `${apiURL}/model`,
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
                const modelData = responseData.returnData[0];

                // Store the original company ID for later use
                $("#M-brand_name").val(modelData.brandId);
                $("#M-brand_name").data("originalBrandId", modelData.brandId);
                
                $("#M-modelname").val(modelData.name);
                $("#M-levelId").val(modelData.levelId);

                $("#M-length").val(modelData.length);
                $("#M-width").val(modelData.width);
                $("#M-height").val(modelData.height);

                $("#M-wheelBase").val(modelData.wheelBase);
                $("#M-seatHeight").val(modelData.seatHeight);
                $("#M-weight").val(modelData.weight);
                $("#M-horsepower").val(modelData.horsepower);
                $("#M-torque").val(modelData.torque);
                $("#M-transmissionType").val(modelData.transmissionType);
                $("#M-powerMode").val(modelData.powerMode);
                $("#M-backShockAbsorberSpec").val(modelData.backShockAbsorberSpec);
                $("#M-frontTireSpec").val(modelData.frontTireSpec);
                $("#M-backTireSpec").val(modelData.backTireSpec);
                $("#M-frontDiscSpec").val(modelData.frontDiscSpec);
                $("#M-backDiscSpec").val(modelData.backDiscSpec);
                $("#M-backGloveBoxSpace").val(modelData.backGloveBoxSpace);

                // // Handle phone number
                // handleNullableField("#phoneNumberContainer", "#R-phoneNumber", siteData.tel);

                $("#M-status").val(modelData.status);
                $("#M-modelOrder").val(modelData.modelOrder);

                $("#BuildTime").val(modelData.createTime);
                $("#EditTime").val(modelData.updateTime);
                $("#EditAccount").val(modelData.updateOperatorName);

                // Handle photo
                handlePhoto(modelData.photo);

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
        const brandList = await fetchBrandList();
        populateBrandDropdown(brandList);
    } catch (error) {
        console.error("Error fetching brand list:", error);
        showErrorNotification();
    }
});

// Handle nullable fields
// function handleNullableField(containerId, fieldId, value) {
//     if (value === null || value === "") {
//         $(containerId).hide();
//     } else {
//         $(containerId).show();
//         $(fieldId).val(value);
//     }
// }

// Handle photo
function handlePhoto(photoUrl) {
    if (photoUrl === null || photoUrl === "") {
        setDefaultImage("#modelPhoto");
    } else {
        $("#modelPhotoContainer").show();
        $("#modelPhoto").attr("src", photoUrl);
    }
}

// Set default image
function setDefaultImage(imgElement) {
    const defaultSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#f0f0f0"/>
            <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#999" text-anchor="middle" dy=".3em">No Image</text>
        </svg>
    `;
    
    $(imgElement).attr("src", "data:image/svg+xml;charset=utf-8," + encodeURIComponent(defaultSvg))
        .css({
            'max-width': '100%',
            'height': 'auto'
        });
}

// 獲取品牌列表
async function fetchBrandList() {
    const userData = JSON.parse(localStorage.getItem("userData"));

    const action = "getBrandList";
    const source = "HBEVBACKEND";
    const chsm = CryptoJS.MD5(action + source + "HBEVBrandBApi").toString().toLowerCase();

    try {
        const response = await $.ajax({
            type: "POST",
            url: `${apiURL}/brand`,
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
        console.error("Error fetching brand list:", error);
        showErrorNotification();
        return [];
    }
}

function populateBrandDropdown(brands) {
    const brandList = document.getElementById("M-brand_name");
    brandList.innerHTML = '';
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

    // Set the selected company to the original brand
    const originalBrandId = $("#M-brand_name").data("originalBrandId");
    if (originalBrandId) {
        $("#M-brand_name").val(originalBrandId);
    }
}