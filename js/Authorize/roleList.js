// 取得列表
$(document).ready(function () {
	const jsonStringFromLocalStorage = localStorage.getItem("userData");
	const gertuserData = JSON.parse(jsonStringFromLocalStorage);
	const user_token = gertuserData.token;

	var action = "getAuthorizeList";
    var source = "HBEVBACKEND";
    var chsmtoGetAuthorizeList = action + source + "HBEVAuthorizeBApi";
    var chsm = CryptoJS.MD5(chsmtoGetAuthorizeList).toString().toLowerCase();

	$("#roleList").DataTable();
	// 发送API请求以获取数据
	$.ajax({
		type: "POST",
		url: `${apiURL}/authorize`,
		headers: { Authorization: "Bearer " + user_token },
        data: {
            action: action,
            source: source,
            chsm: chsm
        },
		success: function (responseData) {
			if (responseData.returnCode === "1") {
				console.log("AJAX response data:", responseData.returnData); // Log response data
				updatePageWithData(responseData, table);
			} else {
				handleApiResponse(responseData);
			}
		},
		error: function (error) {
			showErrorNotification();
		},
	});
});

// 更新頁面按鈕
var table;
function updatePageWithData(responseData, table) {
	var dataTable = $("#roleList").DataTable();
	dataTable.clear().destroy();

	var data = responseData.returnData;

	table = $("#roleList").DataTable({
		autoWidth: false,
		columns: [
			{
				// Buttons column
				render: function (data, type, row) {
					var modifyButtonHtml = `<a href="roleAuthorize_update.html" style="display:none" class="btn btn-primary text-white modify-button" data-button-type="update" data-id="${row.id}">修改</a>`;

					var readButtonHtml = `<a href="roleAuthorize_read.html" style="display:none; margin-bottom:5px" class="btn btn-warning text-white read-button" data-button-type="read" data-id="${row.id}">查看詳請</a>`;

					var buttonsHtml = readButtonHtml + "&nbsp;" + modifyButtonHtml;

					return buttonsHtml;
				},
			},
			{ data: "name" },
			{ data: "companyTypeName" },
			{ data: "remark" },
			{ data: "authorizeOrder" },
		],
		drawCallback: function () {
			handlePagePermissions(currentUser, currentUrl);
		},
		columnDefs: [{ orderable: false, targets: [0] }],
		order: [],
	});

	table.rows.add(data).draw();
}

// 监听修改按钮的点击事件
$(document).on("click", ".modify-button", function () {
	var id = $(this).data("id");
	sessionStorage.setItem("roleUId", id);
});

//詳請

$(document).on("click", ".read-button", function () {
	var id = $(this).data("id");
	sessionStorage.setItem("roleRId", id);
});

// 更新數據
// function refreshDataList() {
// 	var dataTable = $("#roleList").DataTable();
// 	dataTable.clear().draw();

// 	// 从localStorage中获取session_id和chsm
// 	// 解析JSON字符串为JavaScript对象
// 	const jsonStringFromLocalStorage = localStorage.getItem("userData");
// 	const gertuserData = JSON.parse(jsonStringFromLocalStorage);
// 	const user_session_id = gertuserData.sessionId;

// 	// chsm = session_id+action+'HBAdminManualApi'
// 	// 組裝菜單所需資料
// 	var action = "getManualList";
// 	var chsmtoGetManualList = user_session_id + action + "HBAdminManualApi";
// 	var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

// 	$("#roleList").DataTable();
// 	// 发送API请求以获取数据
// 	$.ajax({
// 		type: "POST",
// 		url: `${apiURL}/manual`,
// 		data: { session_id: user_session_id, action: action, chsm: chsm },
// 		success: function (responseData) {
// 			if (responseData.returnCode === "1") {
// 				updatePageWithData(responseData, table);
// 			} else {
// 				handleApiResponse(responseData);
// 			}
// 		},
// 		error: function (error) {
// 			showErrorNotification();
// 		},
// 	});
// }
