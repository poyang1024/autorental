$(document).ready(function () {
	handlePageReadPermissions(currentUser, currentUrl);
});

// 取得詳細資料
$(document).ready(function () {
	var readbrandId = sessionStorage.getItem("readBrandId");
	const dataId = { id: readbrandId };
	const IdPost = JSON.stringify(dataId);

	// 解析JSON字符串为JavaScript对象
	const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

	// 组装所需数据
	var action = "getBrandDetail";
    var source = "HBEVBACKEND";
    var chsmtoGetBrandList = action + source + "HBEVBrandBApi";
    var chsm = CryptoJS.MD5(chsmtoGetBrandList).toString().toLowerCase();

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
			console.log(responseData);
			if (responseData.returnCode === "1" && responseData.returnData.length > 0) {
				console.log("AJAX response data:", responseData.returnData); // Log response data
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

