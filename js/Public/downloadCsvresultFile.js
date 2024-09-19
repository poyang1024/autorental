function downloadCsvresulteFile(apiName, fileName) {
	const formData = new FormData();
	const jsonStringFromLocalStorage = localStorage.getItem("userData");
	const gertuserData = JSON.parse(jsonStringFromLocalStorage);
	const user_session_id = gertuserData.sessionId;

	const chsmtoDeleteFile = user_session_id + apiName + fileName + "HBAdminGetFileApi";
	const chsm = CryptoJS.MD5(chsmtoDeleteFile).toString().toLowerCase();

	formData.set("apiName", apiName);
	formData.set("session_id", user_session_id);
	formData.set("chsm", chsm);
	formData.set("fileName", fileName);

	$.ajax({
		type: "POST",
		url: `${apiURL}/getFile`,
		data: formData,
		processData: false,
		contentType: false,
		xhrFields: {
			responseType: "blob",
		},
		success: function (response) {
			console.log(response);
			downloadFile(response, fileName);
		},
		error: function (error) {
			showErrorFileNotification();
		},
	});
}

function downloadFile(blob, fileName) {
	const allowedExtensions = ["csv"];
	const fileExtension = getFileExtension(fileName).toLowerCase();

	if (allowedExtensions.includes(fileExtension) && !isImageFile(fileExtension)) {
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = fileName;
		link.style.display = "none";
		document.body.appendChild(link);

		link.click();

		document.body.removeChild(link);
	} else {
		showErrorTypeNotification();
	}
}

function getFileExtension(fileName) {
	return fileName.split(".").pop();
}

function isImageFile(fileExtension) {
	const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp"];
	return imageExtensions.includes(fileExtension);
}
