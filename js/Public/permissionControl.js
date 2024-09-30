$(document).ready(function () {
	var currentUser = JSON.parse(localStorage.getItem("currentUser"))

	function handlePermissionControl() {
		if (currentUser.userretrunData) {
			for (var i = 0; i < currentUser.userretrunData.length; i++) {
				var page = currentUser.userretrunData[i];
				var menuOrderValue = parseInt(page.menuOrder);
				// console.log(`Checking page ${i}:`, {
				// 	menuOrder: menuOrderValue,
				// 	mainCategoryId: page.mainCategoryId,
				// 	auth: page.auth
				// });
				
				if (
					menuOrderValue >= 1 &&
					menuOrderValue <= 9 &&
					page.mainCategoryId === null &&
					Array.isArray(page.auth) &&
					!page.auth.includes("read")
				) {
					console.log("Condition met, showing error and redirecting");
					showErrorAuthNotification();
					window.location.href = "index.html";
					break;
				}
			}
		}
	}

	handlePermissionControl();
});

