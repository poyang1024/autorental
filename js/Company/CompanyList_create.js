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
			var getcompanyName = $("#C-company_name").val();
			var getcompanyColor = $("#C-company_color").val();
			var getcompanyTitle = $("#C-company_heading").val();
			var getcompanytax_ID = $("#C-tax_ID_number").val();
			var getcompanyEmail = $("#C-email").val();
			var getcompanyOrder = $("#C-companyOrder").val();
			var getcompanyStatus = $("#C-status").val();

			var updateData = {
				name: getcompanyName,
				fontColor: getcompanyColor,
				companyTitle:getcompanyTitle,
				taxId: getcompanytax_ID,
                email: getcompanyEmail,
				companyOrder: getcompanyOrder,
                status: getcompanyStatus,
			};

			// 解析JSON字符串为JavaScript对象
			const jsonStringFromLocalStorage = localStorage.getItem("userData");
			const gertuserData = JSON.parse(jsonStringFromLocalStorage);
			const user_token = gertuserData.token;

			// 组装所需数据
			var action = "insertCompanyDetail";
			var source = "HBEVBACKEND";
			var chsmtoGetManualList = action + source + "HBEVCompanyBApi";
			var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

			// 设置其他formData字段
			formData.set("action", action);
			formData.set("source", source);
			formData.set("chsm", chsm);
			formData.set("data", JSON.stringify(updateData));


			// 发送文件上传请求
			$.ajax({
				type: "POST",
				url: `${apiURL}/company`,
				headers: { Authorization: "Bearer " + user_token },
				data: formData,
				processData: false,
				contentType: false,
				success: function (response) {
					if (response.returnCode === "1") {
						showSuccessFileNotification();

						setTimeout(function () {
							var newPageUrl = "companyList.html";
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
