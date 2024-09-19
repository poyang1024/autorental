// 權限設定
var currentUser = JSON.parse(localStorage.getItem("currentUser"));
var currentUrl = window.location.href;

function handlePagePermissions(currentUser, currentUrl) {
	if (currentUser.userretrunData) {
		for (var i = 0; i < currentUser.userretrunData.length; i++) {
			var page = currentUser.userretrunData[i];
			if (currentUrl.includes(page.url) && Array.isArray(page.auth)) {
				if (!page.auth.includes("read")) {
					document.body.style.display = "none";
					window.location.href = "../index.html";
				}

				if (page.auth.includes("read")) {
					var readButtons = document.querySelectorAll("[data-button-type='read']");
					for (var j = 0; j < readButtons.length; j++) {
						readButtons[j].style.display = "inline-block";
						readButtons[j].style.marginBottom = "5px";
					}
				}

				if (page.auth.includes("insert")) {
					showButton(document.getElementById("addButton"));
				}

				if (page.auth.includes("update")) {
					var updateButtons = document.querySelectorAll("[data-button-type='update']");
					for (var k = 0; k < updateButtons.length; k++) {
						updateButtons[k].style.display = "inline-block";
						updateButtons[k].style.marginBottom = "5px";
					}
				}

				if (page.auth.includes("delete")) {
					var deleteButtons = document.querySelectorAll("[data-button-type='delete']");
					for (var m = 0; m < deleteButtons.length; m++) {
						deleteButtons[m].style.display = "inline-block";
						deleteButtons[m].style.marginBottom = "5px";
					}
				}

				if (page.auth.includes("download")) {
					var downloadButtons = document.querySelectorAll("[data-button-type='download']");
					for (var n = 0; n < downloadButtons.length; n++) {
						downloadButtons[n].style.display = "inline-block";
					}
				}
			}
		}
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
