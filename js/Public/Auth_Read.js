var currentUser = JSON.parse(localStorage.getItem("currentUser"));
var currentUrl = window.location.href;
function handlePageReadPermissions(currentUser, currentUrl) {
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
				(currentUrl.includes("carDetail") && page.name === "車籍定義資料") ||
				(currentUrl.includes("orderDetail") && page.name === "訂單資料")
			) {
				currentPageAuth = page.auth;
				console.log(page);
				if (!currentPageAuth.includes("read")) {
					document.body.style.display = "none";
					window.history.back();
				}

				if (currentPageAuth.includes("read")) {
					hideButton(document.getElementById("saveButton"));
					hideButton(document.getElementById("updateButton"));
					// hideButton(document.getElementById("downloadBtn"));
					const elementsWithClass = document.getElementsByClassName("form-control");
					for (let i = 0; i < elementsWithClass.length; i++) {
						elementsWithClass[i].disabled = true;
					}
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

// 创建一个函数，根据元素隐藏
function hideButton(element) {
	if (element) {
		element.style.display = "none";
	}
}

// 创建一个函数，根据按钮ID来显示按钮
function showButton(element) {
	if (element) {
		element.style.display = "block";
	}
}
