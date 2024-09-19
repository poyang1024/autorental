$(document).ready(function () {
	var Data = JSON.parse(localStorage.getItem("currentUser")) || [];
	var userData = Data.userretrunData;
	var userAuth = getUserAuth(["零件定義資料", "零件資料", "零件採購單資料", "入庫單", "退貨單資料"]);

	// console.log(Data);
	// console.log(userData);
	// console.log(userAuth);

	if (!userAuth.includes("price")) {
		$("#Price").closest(".col-sm-3").remove();
	}

	if (!userAuth.includes("cost")) {
		$("#Cost").closest(".col-sm-3").remove();
	}

	if (!userAuth.includes("wholesalePrice")) {
		$("#WholesalePrice").closest(".col-sm-3").remove();
	}

	if (!userAuth.includes("lowestWholesalePrice")) {
		$("#lowestWholesalePrice").closest(".col-sm-3").remove();
	}

	function getUserAuth(itemNames) {
		var userAuth = [];

		itemNames.forEach(function (itemName) {
			var item = userData.find(function (data) {
				return data.name === itemName;
			});

			if (item) {
				userAuth = userAuth.concat(item.auth);
			}
		});

		return userAuth;
	}
});
