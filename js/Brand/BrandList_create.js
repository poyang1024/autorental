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
			var getbrandName = $("#B-brand_name").val();
			var getbrandstatus = $("#B-status").val();
			var getbrandorder = $("#B-brandOrder").val();

			var updateData = {
				name: getbrandName,
				status:getbrandstatus,
				brandOrder: getbrandorder,
			};

			// 解析JSON字符串为JavaScript对象
			const jsonStringFromLocalStorage = localStorage.getItem("userData");
			const gertuserData = JSON.parse(jsonStringFromLocalStorage);
			const user_token = gertuserData.token;

			// 组装所需数据
			var action = "insertBrandDetail";
			var source = "HBEVBACKEND";
			var chsmtoGetBrandList = action + source + "HBEVBrandBApi";
			var chsm = CryptoJS.MD5(chsmtoGetBrandList).toString().toLowerCase();

			// 设置其他formData字段
			formData.set("action", action);
			formData.set("source", source);
			formData.set("chsm", chsm);
			formData.set("data", JSON.stringify(updateData));

			$.ajax({
				type: "POST",
				url: `${apiURL}/brand`,
				headers: { Authorization: "Bearer " + user_token },
				data: formData,
				processData: false,
				contentType: false,
				success: function (response) {
					if (response.returnCode === "1") {
						showSuccessFileNotification();
						setTimeout(function () {
							var newPageUrl = "brandList.html";
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
