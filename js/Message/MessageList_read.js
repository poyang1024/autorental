$(document).ready(function () {
    handlePageReadPermissions(currentUser, currentUrl);

    var readMessageId = sessionStorage.getItem("readMessageId");
    const dataId = { id: readMessageId };
    const IdPost = JSON.stringify(dataId);

    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    var action = "getMessageDetail";
    var source = "HBEVBACKEND";
    var chsmtoGetManualList = action + source + "HBEVMessageBApi";
    var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

    $.ajax({
        type: "POST",
        url: `${apiURL}/message`,
        headers: { Authorization: "Bearer " + user_token },
        data: {
            action: action,
            source: source,
            chsm: chsm,
            data: IdPost
        },
        success: function (responseData) {
            console.log(responseData);
            if (responseData.returnCode === "1" && responseData.returnData.length > 0) {
                const messageData = responseData.returnData[0];
                $("#M-title").val(messageData.title);
                $("#M-description").val(messageData.description);
                $("#M-tag").val(messageData.tag);
                
                // 處理日期時間
                setDateTimeValue("M-pushtime", messageData.pushTime);
                setDateTimeValue("M-starttime", messageData.startTime);
                setDateTimeValue("M-endtime", messageData.endTime);
                
                $("#M-content").val(messageData.content);
                $("#BuildTime").val(messageData.createTime);
                $("#EditTime").val(messageData.updateTime);
                $("#EditAccount").val(messageData.updateOperatorName);

                // 處理照片列表
                handlePhotoList(messageData.photo);

                $("#spinner").hide();
            } else {
                handleApiResponse(responseData);
            }
        },
        error: function (error) {
            showErrorNotification();
        },
    });
});

function setDateTimeValue(elementId, dateTimeString) {
    const element = document.getElementById(elementId);
    if(dateTimeString === null){
        element.type = 'text';
        element.value = "No Data Available";
    }
    else if (dateTimeString === "0000-00-00 00:00:00") {
        // 對於特殊日期，使用 text input 顯示原始值
        element.type = 'text';
        element.value = dateTimeString;
    } else {
        // 對於其他日期，使用 datetime-local
        element.type = 'datetime-local';
        element.value = formatDateTimeAdjusted(dateTimeString);
    }
}

function formatDateTimeAdjusted(dateTimeString) {
    // 創建一個新的 Date 對象
    const date = new Date(dateTimeString);
    
    // 檢查日期是否有效
    if (isNaN(date.getTime())) {
        console.error('無效的日期時間字符串:', dateTimeString);
        return '';
    }
    
    // 格式化日期時間為 YYYY-MM-DDTHH:mm 格式
    const adjustedDateTime = date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0') + 'T' +
        String(date.getHours()).padStart(2, '0') + ':' +
        String(date.getMinutes()).padStart(2, '0');
    
    return adjustedDateTime;
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString || dateTimeString === "0000-00-00 00:00:00") {
        return dateTimeString; // 返回原始字符串
    }
    
    // 将日期时间字符串转换为Date对象
    const date = new Date(dateTimeString);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
        return dateTimeString; // 如果日期无效，返回原始字符串
    }
    
    // 格式化为yyyy-MM-ddThh:mm格式
    return date.toISOString().slice(0, 16);
}

async function getThumbnailUrl(filename) {

    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;
    const fileParameter = "messagePhoto"
    var action = "getCompressionPhoto";
    var source = "HBEVBACKEND";
    var chsmtoGetphoto = action + source + "HBEVGetFileBApi";
    var chsm = CryptoJS.MD5(chsmtoGetphoto).toString().toLowerCase();
    try {
        const response = await $.ajax({
            type: "POST",
            url: `${apiURL}/getFile`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
                fileParameter: fileParameter,
                fileName: filename
            },
        });
        
        if (response.returnCode === "1" && response.returnData) {
            return response.returnData;
        } else {
            console.error("獲取縮略圖失敗:", response);
            return null;
        }
    } catch (error) {
        console.error("獲取縮略圖時發生錯誤:", error);
        return null;
    }
}

async function handlePhotoList(messagePhoto) {
    const photoSection = $("#photoSection");
    const photoGallery = $("#photoGallery");

    console.log("messagePhoto:", messagePhoto);

    if (messagePhoto && typeof messagePhoto === 'string') {
        try {
            const photoArray = JSON.parse(messagePhoto);
            console.log("解析後的 photoArray:", photoArray);

            if (Array.isArray(photoArray) && photoArray.length > 0) {
                // 創建圖片庫
                photoGallery.empty();
                for (let index = 0; index < photoArray.length; index++) {
                    const filename = photoArray[index];
                    const thumbnailUrl = await getThumbnailUrl(filename);
                    
                    if (thumbnailUrl) {
                        console.log(`縮圖 ${index + 1} URL:`, thumbnailUrl[0].photo);
                        
                        const img = $("<img>")
                            .attr("src", thumbnailUrl[0].photo)
                            .attr("alt", `照片 ${index + 1}`);
                        photoGallery.append(img);
                        photoGallery.append("&nbsp;&nbsp;&nbsp;");
                    } else {
                        console.error(`無法獲取縮圖 ${index + 1}`);
                    }
                }

                photoSection.show();
            } else {
                console.log("沒有找到照片");
                photoSection.hide();
            }
        } catch (e) {
            console.error("解析 messagePhoto 字符串時出錯:", e);
            photoSection.hide();
        }
    } else {
        console.log("messagePhoto 不是有效的字符串");
        photoSection.hide();
    }
}