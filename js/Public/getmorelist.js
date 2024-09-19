var config = {
	api_url: "https://88bakery.tw/HBAdmin/index.php?/api/authorize",
	items_per_page: 10,
};

// 引入配置文件
$.getScript("config.js", function () {
	$(document).ready(function () {
		// 從localStorage中獲取session_id和chsm
		// 解析JSON字串為JavaScript對象
		const jsonStringFromLocalStorage = localStorage.getItem("userData");
		const gertuserData = JSON.parse(jsonStringFromLocalStorage);
		const user_session_id = gertuserData.sessionId;

		// 初始化頁面和DataTable
		var currentPage = 1;
		var pageCount = config.items_per_page;

		function loadData() {
			// 更新chsmtoGetManualList
			var action = "getAuthorizeList";
			var chsmtoGetManualList = user_session_id + action + "HBAdminAuthorizeApi";
			var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

			// 發送API請求以獲取數據
			$.ajax({
				type: "POST",
				url: config.api_url,
				data: {
					session_id: user_session_id,
					action: action,
					chsm: chsm,
					pageCount: pageCount,
					pageOffset: (currentPage - 1) * pageCount,
				},
				success: function (responseData) {
					console.log(responseData);
					updatePageWithData(responseData);
				},
				error: function (error) {
					showErrorNotification();
				},
			});
		}

		// 填充表格數據
		function updatePageWithData(responseData) {
			// 清空表格數據
			var dataTable = $("#brand-management").DataTable();
			dataTable.clear().draw();

			// 填充API數據到表格，包括下載鏈接
			for (var i = 0; i < responseData.returnData.length; i++) {
				var data = responseData.returnData[i];

				var modifyButtonHtml =
					'<a href="brandDetail_update.html?id=' + data.id + '" class="btn btn-primary text-white">修改</a>';
				var deleteButtonHtml = '<button class="btn btn-danger delete-button" data-id="' + data.id + '">刪除</button>';
				var buttonsHtml = modifyButtonHtml + "&nbsp;" + deleteButtonHtml;

				dataTable.row
					.add([
						buttonsHtml,
						data.brandOrder,
						data.brandName,
						data.remark,
						data.updateTime,
						data.updateOperator,
						data.createTime,
						data.createOperator,
					])
					.draw(false);
			}
		}

		// 加載第一頁數據
		loadData();

		// 加載更多數據
		$("#load-more").click(function () {
			currentPage++;
			loadData();
		});
	});
});
