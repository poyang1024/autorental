// 列表取得
$(document).ready(function () {
	// 从localStorage中获取session_id和chsm
	// 解析JSON字符串为JavaScript对象
	const jsonStringFromLocalStorage = localStorage.getItem("userData");
	const gertuserData = JSON.parse(jsonStringFromLocalStorage);
	const user_session_id = gertuserData.sessionId;

	// console.log(user_session_id);
	// chsm = session_id+action+'HBAdminNotificationApi'
	// 組裝菜單所需資料
	var action = "getNotificationList";
	var chsmtoGetNotificationList = user_session_id + action + "HBAdminNotificationApi";
	var chsm = CryptoJS.MD5(chsmtoGetNotificationList).toString().toLowerCase();

	$("#notify").DataTable();
	// 发送API请求以获取数据
	$.ajax({
		type: "POST",
		url: `${apiURL}/notification`,
		data: { session_id: user_session_id, action: action, chsm: chsm },
		success: function (responseData) {
			if (responseData.returnCode === "1") {
				console.log("成功响应：", responseData);

				var confirmButton = document.getElementById("confirmButton");

				if (confirmButton) {
					if (responseData.unReadAmount == 0) {
						confirmButton.disabled = true;
					} else {
						confirmButton.disabled = false;
					}
				}
				updatePageWithData(responseData);
			} else {
				handleApiResponse(responseData);
			}
		},
		error: function (error) {
			console.error("错误:", error);
		},
	});
});

// 表格填充
function updatePageWithData(responseData) {
	// 清空表格数据
	var dataTable = $("#notify").DataTable();
	dataTable.clear().draw();
	dataTable.order([]).draw(false); //取消所有排列

	// 填充API数据到表格，包括下载链接
	for (var i = 0; i < responseData.returnData.length; i++) {
		var data = responseData.returnData[i];

		var checkboxHtml = "";

		if (data.status == 1) {
			checkboxHtml += "<span>" + data.statusName + "</span>";
		} else {
			checkboxHtml +=
				'<div class="form-check text-center">' +
				'<input type="checkbox" class="confirmItem-button" data-id="' +
				data.id +
				'">' +
				"</div>";
		}

		//新增入庫單
		var wareHouseButtonHtml = "";
		if (Boolean(data.if_newStockIn) === true) {
			wareHouseButtonHtml +=
				'<button type="button" class="btn btn-primary text-white wareHouse-button" data-id="' +
				data.id +
				'" data-componentid="' +
				data.componentId +
				'" >新增入庫單</button>';
		}

		//前往入庫單
		var gowareHouseButtonHtml = "";
		if (Boolean(data.if_stockInDetail) === true && data.notificationType == "1") {
			gowareHouseButtonHtml +=
				'<button type="button" class="btn btn-primary text-white gowareHouse-button"  data-id="' +
				data.id +
				'"data-stockid="' +
				data.stockInId +
				'">前往入庫單</button>';
		}

		//訂單
		var orderButtonHtml = "";
		if (Boolean(data.if_orderDetail) === true) {
			orderButtonHtml +=
				'<button type="button"  class="btn btn-success text-white order-button"  data-id="' +
				data.id +
				'" data-orderno="' +
				data.orderNo +
				'">查看訂單</button>';
		}

		//零件採購詳請
		var purchaseDetailButtonHtml = "";
		if (Boolean(data.if_purchaseDetail) === true) {
			purchaseDetailButtonHtml +=
				'<button type="button"  class="btn btn-info text-white purchase-button"  data-id="' +
				data.id +
				'" data-purchaseid="' +
				data.purchaseId +
				'">查看採購單</button>';
		}

		//出庫單
		var shipDetailButtonHtml = "";
		if (Boolean(data.if_shipDetail) === true) {
			shipDetailButtonHtml +=
				'<button type="button"  class="btn btn-warning text-white ship-button"  data-id="' +
				data.id +
				'" data-shipno="' +
				data.shipNo +
				'">查看出庫單</button>';
		}

		var buttonsHtml =
			wareHouseButtonHtml +
			"&nbsp;" +
			orderButtonHtml +
			"&nbsp;" +
			purchaseDetailButtonHtml +
			"&nbsp;" +
			shipDetailButtonHtml +
			"&nbsp;" +
			gowareHouseButtonHtml;
		// 在这里添加点击事件处理程序来处理复选框的点击事件
		checkboxHtml += '<input type="hidden" data-id="' + data.id + '">';

		dataTable.row
			.add([buttonsHtml, checkboxHtml, data.notificationDescription, data.notificationComment, data.createTime])
			.draw(false);
	}
}

// 新增入庫單
$(document).on("click", ".wareHouse-button", function () {
	var componentId = $(this).data("componentid");
	var notificationId = $(this).data("id");
	var notificationType = $(this).data("type");

	localStorage.setItem("componentValue", componentId);
	localStorage.setItem("notificationId", notificationId);
	localStorage.setItem("notificationType", notificationType);
	var newPageUrl = "wareHouseDetail.html";
	window.location.href = newPageUrl;
});

// 前往入庫單
$(document).on("click", ".gowareHouse-button", function () {
	var wareHouseId = $(this).data("stockid");
	localStorage.setItem("wareHouseId", wareHouseId);
	var newPageUrl = "wareHouseDetail_update.html";
	window.location.href = newPageUrl;
});

// 查看零件採購單
$(document).on("click", ".purchase-button", function () {
	var purchaseId = $(this).data("purchaseid");
	window.location.href = "purchaseDetail.html?purchaseId=" + purchaseId;
});

// 查看出庫單
$(document).on("click", ".ship-button", function () {
	var shipNo = $(this).data("shipno");
	window.location.href = "shipDetail.html?shipNo=" + shipNo;
});

// 查看訂單
$(document).on("click", ".order-button", function () {
	var orderNo = $(this).data("orderno");
	window.location.href = "orderDetail.html?orderNo=" + orderNo;
});

// 確認處理按鈕
$(document).on("click", "#confirmButton", function (e) {
	e.stopPropagation();
	var formData = new FormData();
	var checkboxes = document.querySelectorAll(".confirmItem-button:checked");

	var selectedIds = [];
	checkboxes.forEach(function (checkbox) {
		selectedIds.push(checkbox.getAttribute("data-id"));
	});

	var formattedData = JSON.stringify(selectedIds);

	$(document).off("click", ".confirm-execute");

	toastr.options = {
		closeButton: true,
		timeOut: 0,
		extendedTimeOut: 0,
		positionClass: "toast-top-center",
	};

	toastr.warning(
		"確定勾選項目為已處理狀態嗎？<br/><br><button class='btn btn-danger confirm-execute'>確定</button>",
		"已處理更改",
		{
			allowHtml: true,
		}
	);

	// 绑定新的点击事件处理程序
	$(document).on("click", ".confirm-execute", function () {
		const jsonStringFromLocalStorage = localStorage.getItem("userData");
		const gertuserData = JSON.parse(jsonStringFromLocalStorage);
		const user_session_id = gertuserData.sessionId;

		// chsm = session_id+action+'HBAdminNotificationApi'
		var action = "readNotification";
		var chsmtoDeleteFile = user_session_id + action + "HBAdminNotificationApi";
		var chsm = CryptoJS.MD5(chsmtoDeleteFile).toString().toLowerCase();

		formData.set("action", action);
		formData.set("session_id", user_session_id);
		formData.set("chsm", chsm);
		formData.set("idList", formattedData);

		$.ajax({
			type: "POST",
			url: `${apiURL}/notification`,
			data: formData,
			processData: false,
			contentType: false,
			success: function (response) {
				if (response.returnCode === "1") {
					showConfirmNotification();
					setTimeout(function () {
						refreshDataList();
					}, 1000);
				} else {
					handleApiResponse(response);
				}
			},
			error: function (error) {
				handleApiResponse(response);
			},
		});
	});
});

function refreshDataList() {
	// 从localStorage中获取session_id和chsm
	// 解析JSON字符串为JavaScript对象
	const jsonStringFromLocalStorage = localStorage.getItem("userData");
	const gertuserData = JSON.parse(jsonStringFromLocalStorage);
	const user_session_id = gertuserData.sessionId;

	// console.log(user_session_id);
	// chsm = session_id+action+'HBAdminNotificationApi'
	// 組裝菜單所需資料
	var action = "getNotificationList";
	var chsmtoGetNotificationList = user_session_id + action + "HBAdminNotificationApi";
	var chsm = CryptoJS.MD5(chsmtoGetNotificationList).toString().toLowerCase();

	$("#notify").DataTable();
	// 发送API请求以获取数据
	$.ajax({
		type: "POST",
		url: `${apiURL}/notification`,
		data: { session_id: user_session_id, action: action, chsm: chsm },
		success: function (responseData) {
			updatePageWithData(responseData);
		},
		error: function (error) {
			console.error("错误:", error);
		},
	});
}
