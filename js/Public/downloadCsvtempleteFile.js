function downloadCsvFile() {
	const fileName = "template.csv";
	const customDownloadURL = downloadURL + fileName;

	const downloadLink = document.getElementById("downloadLink");
	downloadLink.href = customDownloadURL;
	downloadLink.download = fileName;

	// 觸發點擊事件
	downloadLink.click();
}
