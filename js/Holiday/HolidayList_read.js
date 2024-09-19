$(document).ready(function () {
	handlePageReadPermissions(currentUser, currentUrl);
});

// 取得詳細資料
$(document).ready(function () {
	var readholidayId = sessionStorage.getItem("readHolidayId");
	const dataId = { id: readholidayId};
	const IdPost = JSON.stringify(dataId);

	// 解析JSON字符串为JavaScript对象
	const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

	// 组装所需数据
	var action = "getHolidayDetail";
    var source = "HBEVBACKEND";
    var chsmtoGetHolidayList = action + source + "HBEVHolidayBApi";
    var chsm = CryptoJS.MD5(chsmtoGetHolidayList).toString().toLowerCase();

	// 发送POST请求  
	$.ajax({
		type: "POST",
		url: `${apiURL}/holiday`,
		headers: { Authorization: "Bearer " + user_token },
		data: {
            action: action,
            source: source,
            chsm: chsm,
			data: IdPost
        },
		success: function (responseData) {
			//console.log(responseData);
			if (responseData.returnCode === "1" && responseData.returnData.length > 0) {
				const holidayData = responseData.returnData[0];
				$("#H-holiday_name").val(holidayData.name);
				$("#H-holiday_date").val(holidayData.specifyDate);

				$("#H-status").val(holidayData.status);

				$("#BuildTime").val(holidayData.createTime);
				$("#EditTime").val(holidayData.updateTime);
				$("#EditAccount").val(holidayData.updateOperatorName);

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
});

