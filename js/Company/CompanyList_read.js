$(document).ready(function () {
	handlePageReadPermissions(currentUser, currentUrl);
});

// 取得詳細資料
$(document).ready(function () {
	var readcompanyId = sessionStorage.getItem("readCompanyId");
	const dataId = { id: readcompanyId, };
	const IdPost = JSON.stringify(dataId);

	// 解析JSON字符串为JavaScript对象
	const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

	// 组装所需数据
	var action = "getCompanyDetail";
    var source = "HBEVBACKEND";
    var chsmtoGetManualList = action + source + "HBEVCompanyBApi";
    var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

	// 发送POST请求  
	$.ajax({
		type: "POST",
		url: `${apiURL}/company`,
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
				const companyData = responseData.returnData[0];
				$("#C-company_name").val(companyData.name);
				$("#C-company_color").val(companyData.fontColor);
				$("#C-company_heading").val(companyData.companyTitle);
				$("#C-tax_ID_number").val(companyData.taxId);
				$("#C-email").val(companyData.email);

				$("#C-status").val(companyData.status);
				$("#C-companyOrder").val(companyData.companyOrder);

				$("#BuildTime").val(companyData.createTime);
				$("#EditTime").val(companyData.updateTime);
				$("#EditAccount").val(companyData.updateOperatorName);

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

