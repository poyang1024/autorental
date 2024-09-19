$(document).ready(function () {
	var currentDate = new Date();

	var year = currentDate.getFullYear();
	var month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
	var day = currentDate.getDate().toString().padStart(2, "0");
	var hours = currentDate.getHours().toString().padStart(2, "0");
	var minutes = currentDate.getMinutes().toString().padStart(2, "0");

	var formattedDateTime = year + "-" + month + "-" + day + " " + hours + ":" + minutes;

	$("#BuildTime").val(formattedDateTime);

	var userData = localStorage.getItem("currentUser");

	var user = JSON.parse(userData);

	const userName = user["userName"];

	if (userName) {
		$("#EditAccount").val(userName);
	}
});
