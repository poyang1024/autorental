// 取得詳細資料
$(document).ready(function () {
	handlePageUpdatePermissions(currentUser, currentUrl);
	var updateHolidayId = sessionStorage.getItem("updateHolidayId");
	const dataId = { id: updateHolidayId };
	const IdPost = JSON.stringify(dataId);

	// 解析JSON字符串为JavaScript对象
	const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

	// 组装所需数据
	var action = "getHolidayDetail";
    var source = "HBEVBACKEND";
    var chsmtoGetManualList = action + source + "HBEVHolidayBApi";
    var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();
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

// 上傳POST
$(document).ready(function () {
	var formData = new FormData();
	var uploadForm = document.getElementById("uploadForm");
	var updateHolidayId = sessionStorage.getItem("updateHolidayId");

	// 添加表单提交事件监听器
	uploadForm.addEventListener("submit", function (event) {
		if (uploadForm.checkValidity() === false) {
			event.preventDefault();
			event.stopPropagation();
			showWarningfillFormNotification();
		} else {
			// 处理表单提交
			event.preventDefault();

			//取值
			var getholidayName = $("#H-holiday_name").val();
			var getholidayDate = $("#H-holiday_date").val();

			var updateData = {
				id: updateHolidayId,
				name: getholidayName,
				specifyDate:getholidayDate
			};

			// 解析JSON字符串为JavaScript对象
			const jsonStringFromLocalStorage = localStorage.getItem("userData");
			const gertuserData = JSON.parse(jsonStringFromLocalStorage);
			const user_token = gertuserData.token;

			// 组装所需数据
			var action = "updateHolidayDetail";
			var source = "HBEVBACKEND";
			var chsmtoGetHolidayList = action + source + "HBEVHolidayBApi";
			var chsm = CryptoJS.MD5(chsmtoGetHolidayList).toString().toLowerCase();

			// 设置其他formData字段
			formData.set("action", action);
			formData.set("source", source);
			formData.set("chsm", chsm);
			formData.set("data", JSON.stringify(updateData));

			$.ajax({
				type: "POST",
				url: `${apiURL}/holiday`,
				headers: { Authorization: "Bearer " + user_token },
				data: formData,
				processData: false,
				contentType: false,
				success: function (response) {
					if (response.returnCode === "1") {
						showSuccessFileNotification();
						setTimeout(function () {
							var newPageUrl = "holidayList.html";
							window.location.href = newPageUrl;
						}, 1000);
					} else {
						handleApiResponse(response);
					}
				},
				error: function (error) {
					showErrorFileNotification();
				},
			});
		}
		uploadForm.classList.add("was-validated");
	});
});
