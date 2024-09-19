const fileInput = document.getElementById("fileInput");
const selectedFile = document.getElementById("selectedFile");

fileInput.addEventListener("change", function () {
	selectedFile.textContent = this.files[0] ? this.files[0].name : "未選擇任何文件";
});
