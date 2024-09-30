var currentUser = JSON.parse(localStorage.getItem("currentUser"));
var currentUrl = window.location.href;

function handlePageUpdatePermissions(currentUser, currentUrl) {
	let currentPageAuth = null;
	let pageFound = false;

	if (currentUser.userretrunData) {
		for (var i = 0; i < currentUser.userretrunData.length; i++) {
			var page = currentUser.userretrunData[i];

			if (
				(currentUrl.includes("companyDetail") && page.name === "公司資料")||
				(currentUrl.includes("accountDetail") && page.name === "帳號資料") ||
				(currentUrl.includes("roleAuthorize") && page.name === "角色權限") ||
				(currentUrl.includes("siteDetail") && page.name === "站點資料") ||
				(currentUrl.includes("holidayDetail") && page.name === "假日資料")||
				(currentUrl.includes("brandDetail") && page.name === "品牌定義資料") ||
				(currentUrl.includes("messageDetail") && page.name === "訊息資料") ||
				(currentUrl.includes("salesPlanDetail") && page.name === "費率設定資料") ||
				(currentUrl.includes("modelDetail") && page.name === "車型定義資料") ||
				(currentUrl.includes("memberDetail") && page.name === "會員列表") ||
				(currentUrl.includes("memberVerifyDetail") && page.name === "會員審核資料") ||
				(currentUrl.includes("carDetail") && page.name === "車籍定義資料")
			) {
				currentPageAuth = page.auth;
				// console.log(page);
				if (!currentPageAuth.includes("update")) {
					document.body.style.display = "none";
					window.history.back();
					break;
				}

				if (currentPageAuth.includes("read")) {
					if((currentUrl.includes("memberVerifyDetail") && page.name === "會員審核資料")){
						const passButton = document.getElementById("passButton");
						passButton.disabled = false;
						const failButton = document.getElementById("failButton");
						failButton.disabled = false;
					}
					else{
						const updateButton = document.getElementById("updateButton");
						updateButton.disabled = false;
					}
				}

				if (currentPageAuth.includes("update")) {
					if((currentUrl.includes("memberVerifyDetail") && page.name === "會員審核資料")){
						const passButton = document.getElementById("passButton");
						passButton.disabled = false;
						const failButton = document.getElementById("failButton");
						failButton.disabled = false;
					}
					else{
						const updateButton = document.getElementById("updateButton");
						updateButton.disabled = false;
					}
				}

				if (currentPageAuth.includes("download")) {
					showButton(document.getElementById("downloadBtn"));
				}

				pageFound = true;
				break;
			}
		}
	}

	if (!pageFound) {
		document.body.style.display = "none";
		window.history.back();
	}
}

function hideButton(element) {
	if (element) {
		element.style.display = "none";
	}
}

function showButton(element) {
	if (element) {
		element.style.display = "block";
	}
}
