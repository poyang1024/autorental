// 登入相關提示
function showSuccessLoginNotification() {
	toastr.success("", "成功登入！");
}

function showErrorReLoginNotification() {
	toastr.error("Error", "登入過期，請重新登入");
}

function showErrorLoginNotification() {
	toastr.error("請檢查帳號、密碼是否輸入錯誤", "登入失敗，請重新登入！");
}

// 新增、修改、刪除功能提示

function showSuccessFileDeleteNotification() {
	toastr.success("", "刪除成功");
}

function showWarningContentNotification() {
	toastr.warning("請新增內容！", "提醒");
}

//上傳、下載功能
// 重新整理一次

function showSuccessFileNotification() {
	toastr.success("儲存成功，畫面將重新整理後更新！", "成功");
}

function showErrorFileNotification() {
	toastr.error("上傳失敗，請再重新操作一次", "失敗");
}

function showWarningNotification() {
	toastr.warning("請上傳檔案！", "提醒");
}

function showSuccessFileDownloadNotification() {
	toastr.success("文件已下載", "下載成功");
}
function showWarningFileNotification() {
	toastr.warning("請重新選擇檔案！", "提醒");
}

function showWarningFileNotification() {
	toastr.warning("找不到文件！", "提醒");
}

function showInfoNotification() {
	toastr.info("", "已選擇檔案");
}

function showErrorSubmitNotification() {
	toastr.error("儲存失敗", "錯誤");
}

function showWarningfillFormNotification() {
	toastr.warning("請確定填寫完整！", "提醒");
}

//購物車
function showSuccessAddToCarNotification() {
	toastr.success("請至購物車查看添加內容！", "加入成功");
}

function showSuccessAddToOrderNotification() {
	toastr.success("訂單已成立", "加入成功");
}

// 警告

function showErrorNotification() {
	toastr.error("Error", "錯誤");
}

function showErrorAuthNotification() {
	toastr.error("你沒有權限觀看此頁面", "提醒");
}

function showErrorTypeNotification() {
	toastr.error("檔案類型非Pdf副檔名", "錯誤");
}

// 訂單

function showgoPurchaseNotification() {
	toastr.success('是否前往，<a href="purchaseList.html">零件採購單</a>查看更多。', "提醒！", {
		onclick: function () {
			// 点击链接时触发的操作
			window.location.href = "purchaseList.html";
		},
	});
}

function showgoshipDetailNotification() {
	toastr.success('是否前往，<a href="shipDetail.html">出庫申請單</a>查看更多。', "提醒！", {
		onclick: function () {
			// 点击链接时触发的操作
			window.location.href = "shipDetail.html";
		},
	});
}

function showSuccessshipdetail() {
	toastr.success("已成功執行出庫", "成功");
}

function showSuccessAddToOrderNotification() {
	toastr.success("訂單已成立！", "成功");
}

function showSuccessorderCompleteNotification() {
	toastr.success("已完成訂單！", "成功");
}

function showSuccessorderCancelNotification() {
	toastr.success("已取消訂單！", "成功");
}
function showSuccessorderunSubscribeNotification() {
	toastr.success("已完成退貨，即將導轉至退貨單！", "成功");
}

function shownoDataNotification() {
	toastr.info("", "無可顯示資料");
}

// 出貨單
function showSuccessshipCancelNotification() {
	toastr.success("已取消出庫！", "成功");
}

function showSuccessshipRequisitionNotification() {
	toastr.success("已領取零件！", "成功");
}

function showSuccessshipApproveNotification() {
	toastr.success("已同意出庫！", "成功");
}

//通知
function showConfirmNotification() {
	toastr.success("已標記處理狀態！", "成功");
}

//退貨

function showSuccessunsubCompleteNotification() {
	toastr.success("已完成退貨！", "成功");
}

function showSuccessunsubCancelNotification() {
	toastr.success("已取消退貨！", "成功");
}

//盤點
function showSuccessuInsertNotification() {
	toastr.success("已新增盤點項目！", "成功");
}

function showSuccessuInsertCsvNotification() {
	toastr.success("已成功上傳文件", "成功");
}

function showSuccessuInventoryStockInNotification() {
	toastr.success("已新增盤點入庫！", "成功");
}

function showSuccessuInventoryLossNotification() {
	toastr.success("已列入盤點損失！", "成功");
}

function showSuccessucompleteInventoryNotification() {
	toastr.success("已結束盤點！", "成功");
}

function showSuccesupdateInventoryDetailNotification() {
	toastr.success("已成功暫存內容！", "成功");
}

function showErrorWHNotification() {
	toastr.error("參數有誤", "警告");
}

function showErrorFileNotification() {
	toastr.warning("文件下载出錯，請重新嘗試！", "提醒");
}

function showErrorTypeNotification() {
	toastr.error("不支持的文件類型，請下載CSV檔案", "警告");
}
