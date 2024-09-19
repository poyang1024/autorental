$(document).ready(function () {
	handlePageCreatePermissions(currentUser, currentUrl);
});

$(document).ready(function () {
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

			//取值
			var getholidayName = $("#H-holiday_name").val();
			var getholidayDate = $("#H-holiday_date").val();

			var updateData = {
				name: getholidayName,
				specifyDate:getholidayDate
			};

			// 解析JSON字符串为JavaScript对象
			const jsonStringFromLocalStorage = localStorage.getItem("userData");
			const gertuserData = JSON.parse(jsonStringFromLocalStorage);
			const user_token = gertuserData.token;

			// 组装所需数据
			var action = "insertHolidayDetail";
			var source = "HBEVBACKEND";
			var chsmtoGetManualList = action + source + "HBEVHolidayBApi";
			var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

			// 设置其他formData字段
			formData.set("action", action);
			formData.set("source", source);
			formData.set("chsm", chsm);
			formData.set("data", JSON.stringify(updateData));


			// 发送文件上传请求
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
					console.log(error);
					showErrorNotification();
				},
			});
		}
		uploadForm.classList.add("was-validated");
	});
});
