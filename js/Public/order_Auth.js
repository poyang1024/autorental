$(document).ready(function () {
	var Data = JSON.parse(localStorage.getItem("currentUser")) || [];
	var userData = Data.userretrunData;
	var userAuth = getUserAuth(["訂單資料"]);

	// console.log(Data);
	// console.log(userData);
	// console.log(userAuth);

	if (!userAuth.includes("update")) {
		$("#orderAppealModalBtn").remove();
	}

	if (!userAuth.includes("orderCancel")) {
		$("#cancelOrderModalBtn").remove();
	}

	if (!userAuth.includes("powerOff")) {
		$("#interruptPowerModalBtn").remove();
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
		console.log(userAuth);
		return userAuth;
	}
});
