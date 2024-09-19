// 取得詳細資料
$(document).ready(function () {
	handlePageUpdatePermissions(currentUser, currentUrl);
	var updatebrandId = sessionStorage.getItem("updateBrandId");
	const dataId = { id: updatebrandId };
	const IdPost = JSON.stringify(dataId);

	// 解析JSON字符串为JavaScript对象
	const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

	// 组装所需数据
	var action = "getBrandDetail";
    var source = "HBEVBACKEND";
    var chsmtoGetManualList = action + source + "HBEVBrandBApi";
    var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();
	// 发送POST请求
	$.ajax({
		type: "POST",
		url: `${apiURL}/brand`,
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
				const brandData = responseData.returnData[0];
				$("#B-brand_name").val(brandData.name);

				$("#B-status").val(brandData.status);

				$("#B-brandOrder").val(brandData.brandOrder);	

				$("#BuildTime").val(brandData.createTime);
				$("#EditTime").val(brandData.updateTime);
				$("#EditAccount").val(brandData.updateOperatorName);


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
	var updateBrandId = sessionStorage.getItem("updateBrandId");

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
				id: updateBrandId,
				name: getbrandName,
				status:getbrandstatus,
				brandOrder: getbrandorder,
			};

			// 解析JSON字符串为JavaScript对象
			const jsonStringFromLocalStorage = localStorage.getItem("userData");
			const gertuserData = JSON.parse(jsonStringFromLocalStorage);
			const user_token = gertuserData.token;

			// 组装所需数据
			var action = "updateBrandDetail";
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
