// 初始化計數器
let memberFileCounter = 0;

$(document).ready(async function () {
    handlePageUpdatePermissions(currentUser, currentUrl);
    try {
        await initializeUpdateMemberVerifyForm();
    } catch (error) {
        console.error("初始化錯誤:", error);
        showErrorNotification();
    }
    const reasonTemplate = document.getElementById('MemV-failReasonTemplate');
    const reasonInput = document.getElementById('MemV-failReason');

    reasonTemplate.addEventListener('change', function() {
        if (this.selectedIndex > 0) {
            reasonInput.value = this.options[this.selectedIndex].text;
        } else {
            reasonInput.value = '';
        }
    });

    // Add click event listener to the order button
    $("#orderButton").on("click", function(e) {
        e.preventDefault(); // Prevent the default anchor behavior
        getOrderList();
    });

    $("#addMemberFileBtn").on("click", addMemberFileField);
    $("#uploadAllFilesBtn").on("click", uploadAllMemberFiles);
});

// Format date for date input
function formatDateForInput(dateString) {
    if (!dateString || dateString === "0000-00-00" || dateString === "0000-00-00 00:00:00") {
        return "";
    }
    // Assuming dateString is in format "YYYY-MM-DD" or "YYYY-MM-DD HH:mm:ss"
    return dateString.split(' ')[0]; // This will return just the date part
}

// Format date and time for display
function formatDateTime(dateTimeString) {
    if (!dateTimeString || dateTimeString === "0000-00-00" || dateTimeString === "0000-00-00 00:00:00") {
        return "";
    }
    // Assuming dateTimeString is in format "YYYY-MM-DD HH:mm:ss"
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function addMemberFileField() {
    const fieldId = `memberFile_${memberFileCounter}`;
    const html = `
        <div class="col-12 member-file-group" id="${fieldId}_container">
            <div class="card p-3 mb-3">
                <div class="row">
                    <div class="col-md-3">
                        <label for="${fieldId}" class="form-label">會員檔案</label>
                        <input type="file" 
                               class="form-control member-file-input" 
                               id="${fieldId}" 
                               name="memberFile"
                               accept=".jpg,.jpeg,.png">
                        <small class="text-muted">僅支援 JPG、JPEG、PNG 格式</small>
                    </div>
                    <div class="col-md-3">
                        <label for="${fieldId}_remark" class="form-label">檔案備註</label>
                        <input type="text" class="form-control member-file-remark" id="${fieldId}_remark" placeholder="請輸入檔案備註">
                    </div>
                    <div class="col-md-3">
                        <div class="preview-container" style="max-width: 200px; max-height: 200px; overflow: hidden;">
                            <img id="${fieldId}_preview" class="img-fluid" style="display: none;">
                        </div>
                    </div>
                    <div class="col-md-3 d-flex align-items-center">
                        <button type="button" class="btn btn-danger w-100" onclick="removeMemberFileField('${fieldId}_container')">
                            刪除
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    $("#memberFileContainer").append(html);
    
    // 檔案預覽
    $(`#${fieldId}`).on('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.match('image.*')) {
                toastr.warning('請上傳圖片檔案');
                this.value = '';
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                toastr.warning('檔案大小不能超過 5MB');
                this.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                $(`#${fieldId}_preview`).attr('src', e.target.result).show();
            };
            reader.readAsDataURL(file);
        }
    });
    
    memberFileCounter++;
}

// 移除會員檔案欄位
function removeMemberFileField(containerId) {
    $(`#${containerId}`).remove();
}

// 批量上傳所有檔案
async function uploadAllMemberFiles() {
    const fileGroups = $('.member-file-group');
    let hasError = false;

    // 檢查是否有檔案要上傳
    if (fileGroups.length === 0) {
        toastr.warning('請先新增檔案欄位');
        return;
    }

    // 檢查所有欄位是否都已填寫
    for (let group of fileGroups) {
        const fileInput = $(group).find('.member-file-input')[0];
        const remark = $(group).find('.member-file-remark').val();
        
        if (!fileInput.files[0]) {
            toastr.warning('請確認所有檔案都已選擇');
            return;
        }
        if (!remark) {
            toastr.warning('請確認所有備註都已填寫');
            return;
        }
    }

    // 開始上傳
    $("#uploadAllFilesBtn").prop('disabled', true);
    toastr.info('檔案上傳中，請稍候...');

    try {
        for (let group of fileGroups) {
            const fileInput = $(group).find('.member-file-input')[0];
            const fileremark = $(group).find('.member-file-remark').val();
            
            await uploadMemberFile(fileInput.files[0], fileremark);
            $(group).find('input, button').prop('disabled', true);
        }
        toastr.success('所有檔案上傳成功');
        setTimeout(() => {
            window.location.href = "memberVerifyList.html";
        }, 1000);
    } catch (error) {
        toastr.error(error);
        hasError = true;
    } finally {
        $("#uploadAllFilesBtn").prop('disabled', false);
    }
}

async function uploadMemberFile(file, fileremark) {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (!userData || !userData.token) {
        throw new Error("用戶數據或令牌缺失");
    }

    const memberVerifyId = sessionStorage.getItem("updateMemberVerifyId");
        if (!memberVerifyId) {
            throw new Error("sessionStorage 中缺少 updateMemberId");
        }

    const formData = new FormData();
    formData.append("action", "uploadFile");
    formData.append("source", "HBEVBACKEND");
    formData.append("chsm", CryptoJS.MD5("uploadFile" + "HBEVBACKEND" + "HBEVMemberBApi").toString().toLowerCase());
    formData.append("memberFile", file);
    
    const data = {
        id: memberVerifyId,
        memberFileRemark: fileremark
    };
    formData.append("data", JSON.stringify(data));

    try {
        const response = await $.ajax({
            type: "POST",
            url: `${apiURL}/member`,
            headers: { 
                Authorization: "Bearer " + userData.token
            },
            data: formData,
            processData: false,
            contentType: false
        });

        if (response.returnCode === "1") {
            return response.returnData;
        }
        else {
            handleApiResponse(response);
        }
    }catch (error) {
            showErrorNotification();
    }
}

async function initializeUpdateMemberVerifyForm() {
    try {
        const memberVerifyId = sessionStorage.getItem("updateMemberVerifyId");
        if (!memberVerifyId) {
            throw new Error("sessionStorage 中缺少 updateMemberId");
        }

        const memberVerifyDetails = await fetchMemberVerifyDetails(memberVerifyId);

        populateMemberVerifyDetails(memberVerifyDetails[0], memberVerifyDetails[1]);

        setupUpdateMemberVerify(memberVerifyId);
    } catch (error) {
        console.error("表單初始化錯誤:", error);
        showErrorNotification();
    }
}

async function fetchMemberVerifyDetails(siteId) {
    const userData = JSON.parse(localStorage.getItem("userData"));
    var action = "getMemberVerifyDetail";
    var source = "HBEVBACKEND";
    var chsmtoGetMemberList = action + source + "HBEVMemberBApi";
    var chsm = CryptoJS.MD5(chsmtoGetMemberList).toString().toLowerCase();
    try {
        const response = await $.ajax({
            type: "POST",
            url: `${apiURL}/member`,
            headers: { Authorization: "Bearer " + userData.token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
                data: JSON.stringify({ id: siteId })
            }
        });

        if (response.returnCode === "1" && response.returnData.length > 0) {
            console.log(response.returnData[0]);
            console.log(response);
            const verifyRecordData = response.verifyRecord;

            const returnData = [response.returnData[0], verifyRecordData];
            return returnData
        } else {
            handleApiResponse(response);
        }
    } catch (error) {
        showErrorNotification();
    }
}

function populateMemberVerifyDetails(memberVerifyData,verifyRecordData) {
    // 填充所有其他字段
    $("#MemV-account").val(memberVerifyData.account);
    $("#MemV-levelId").val(memberVerifyData.levelId);
    $("#MemV-password").val(memberVerifyData.password);
    $("#MemV-name").val(memberVerifyData.name);
    $("#MemV-birthDay").val(formatDateForInput(memberVerifyData.birthDay));
    $("#MemV-email").val(memberVerifyData.email);
    $("#MemV-phone").val(memberVerifyData.phone);
    $("#MemV-remark").val(memberVerifyData.remark);
    $("#Mem-verifyStatus").val(memberVerifyData.verifyStatus);
    $("#MemV-address").val(memberVerifyData.address);

    // 處理 verifyRecord
    let verifyRecordText = "";
    verifyRecordData.forEach((record, index) => {
        verifyRecordText += `${index + 1}. [${formatDateTime(record.createTime)}] ${record.createOperatorName} ${record.verifyStatusDescription} ${record.verifyFailureReason}\n`;
    });
    $("#verifyRecord").val(verifyRecordText.trim());
    

    $("#BuildTime").val(formatDateTime(memberVerifyData.createTime));
    $("#EditTime").val(formatDateTime(memberVerifyData.updateTime));
    $("#EditAccount").val(memberVerifyData.updateOperatorName);

    // Handle photos
    handlePhoto("#identificationCardFront", memberVerifyData.identificationCardFront);
    handlePhoto("#identificationCardBack", memberVerifyData.identificationCardBack);
    handlePhoto("#drivingLicenseFront", memberVerifyData.drivingLicenseFront);
    handlePhoto("#drivingLicenseBack", memberVerifyData.drivingLicenseBack);
    handlePhoto("#selfie", memberVerifyData.selfie);

    // 處理其他照片
    if (memberVerifyData.otherPhotoData != 'null') {
        const otherPhotos = JSON.parse(memberVerifyData.otherPhotoData);
        const container = $("#memberVerifyPhotoContainer");
        
        // 新增展開/收合按鈕
        const toggleButton = `
            <div class="col-12 mb-3">
                <button type="button" class="btn btn-secondary" id="toggleOtherPhotos">
                    <i class="fas fa-chevron-down"></i> 顯示其他照片
                </button>
            </div>
            <div id="otherPhotosContainer" class="row" style="display: none;">
            </div>
        `;
        container.append(toggleButton);
        
        // 新增照片到容器中
        const photosContainer = $("#otherPhotosContainer");
        otherPhotos.forEach((photo, index) => {
            const photoHtml = `
                <div class="col-sm-6 mb-3">
                    <label class="form-label">${photo.memberFileRemark}</label>
                    <div class="card" style="max-width: 300px; margin: auto;">
                        <img id="otherPhoto_${index}" class="card-img-top" alt="${photo.memberFileRemark}" style="max-width: 100%; height: auto;">
                    </div>
                </div>
            `;
            photosContainer.append(photoHtml);
            
            getThumbnailUrl(photo.memberFile, `userPhoto`).then(photoData => {
                if (photoData) {
                    $(`#otherPhoto_${index}`).attr("src", photoData);
                } else {
                    setDefaultImage($(`#otherPhoto_${index}`));
                }
            });
        });

        // 綁定切換按鈕事件
        $("#toggleOtherPhotos").on("click", function() {
            const container = $("#otherPhotosContainer");
            const icon = $(this).find("i");
            if (container.is(":visible")) {
                container.slideUp();
                icon.removeClass("fa-chevron-up").addClass("fa-chevron-down");
                $(this).html('<i class="fas fa-chevron-down"></i> 顯示其他照片');
            } else {
                container.slideDown();
                icon.removeClass("fa-chevron-down").addClass("fa-chevron-up");
                $(this).html('<i class="fas fa-chevron-up"></i> 隱藏其他照片');
            }
        });
    }
}

async function getThumbnailUrl(filename, photoId) {

    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;
    var action = "getCompressionPhoto";
    var source = "HBEVBACKEND";
    var chsmtoGetphoto = action + source + "HBEVGetFileBApi";
    var chsm = CryptoJS.MD5(chsmtoGetphoto).toString().toLowerCase();
    try {
        const response = await $.ajax({
            type: "POST",
            url: `${apiURL}/getFile`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
                fileParameter: photoId,
                fileName: filename
            },
        });
        
        if (response.returnCode === "1" && response.returnData) {
            return response.returnData[0].photo;
        } else {
            console.error("獲取縮略圖失敗:", response);
            return null;
        }
    } catch (error) {
        console.error("獲取縮略圖時發生錯誤:", error);
        return null;
    }
}

// Handle photo
async function handlePhoto(photoId, photoUrl) {
    const imgElement = $(photoId);
    const inputId = photoId + 'Input';

    if (photoUrl) {
        try {
            const photo = await getThumbnailUrl(photoUrl, photoId.replace(/^#/, ''));
            if (photo) {
                imgElement.attr("src", photo)
                    .on('error', function() {
                        setDefaultImage(this);
                    });
            } else {
                setDefaultImage(imgElement);
            }
        } catch (error) {
            console.error(`Error loading photo for ${photoId}:`, error);
            setDefaultImage(imgElement);
        }
    } else {
        setDefaultImage(imgElement);
    }

    // Add change event listener to the corresponding file input
    $(inputId).off('change').on('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imgElement.attr("src", e.target.result);
            };
            reader.readAsDataURL(this.files[0]);
        }
    });
}

// Set default image
function setDefaultImage(imgElement) {
    const defaultSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#f0f0f0"/>
            <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#999" text-anchor="middle" dy=".3em">No Image</text>
        </svg>
    `;
    
    $(imgElement).attr("src", "data:image/svg+xml;charset=utf-8," + encodeURIComponent(defaultSvg))
        .css({
            'max-width': '100%',
            'height': 'auto'
        });
}

function setupUpdateMemberVerify(memberVerifyId) {
    const uploadForm = document.getElementById("uploadForm");
    const photoFields = ["identificationCardFront", "identificationCardBack", "drivingLicenseFront", "drivingLicenseBack", "selfie"];
    const passButton = document.getElementById("passButton");
    const failButton = document.getElementById("failButton");

    if (!uploadForm) {
        console.error("上傳表單不存在。");
        return;
    }

    function handleSubmit(verifyStatus) {
        return async function(event) {
            event.preventDefault();

            if (!uploadForm.checkValidity()) {
                event.stopPropagation();
                showWarningfillFormNotification();
                uploadForm.classList.add("was-validated");
                return;
            }

            // 額外的驗證邏輯
            if (verifyStatus === 1) { // 通過
                const levelId = $("#MemV-levelId").val();
                if (!levelId) {
                    toastr.warning("通過時必須選擇擁有駕照", "提醒");
                    return;
                }
            } else if (verifyStatus === 2) { // 不通過
                const failReason = $("#MemV-failReason").val();
                if (!failReason) {
                    toastr.warning("不通過時必須填寫不通過原因", "提醒");
                    return;
                }
            }

            try {
                const userData = JSON.parse(localStorage.getItem("userData"));
                if (!userData || !userData.token) {
                    throw new Error("用戶數據或令牌缺失");
                }

                const action = "updateMemberVerifyDetail";
                const source = "HBEVBACKEND";
                const chsm = CryptoJS.MD5(action + source + "HBEVMemberBApi").toString().toLowerCase();

                const memberVerifyData = {
                    id: memberVerifyId,
                    account: $("#MemV-account").val(),
                    name: $("#MemV-name").val(),
                    birthDay: $("#MemV-birthDay").val(),
                    email: $("#MemV-email").val(),
                    phone: $("#MemV-phone").val(),
                    remark: $("#MemV-remark").val(),
                    levelId: $("#MemV-levelId").val(),
                    address: $("#Memv-address").val(),
                    verifyStatus: verifyStatus,
                    verifyFailureReason: verifyStatus === 2 ? $("#MemV-failReason").val() : ""
                };

                console.log("會員數據:", memberVerifyData);

                const formData = new FormData();
                formData.append("action", action);
                formData.append("source", source);
                formData.append("chsm", chsm);
                formData.append("data", JSON.stringify(memberVerifyData));

                // Handle photo uploads
                photoFields.forEach(fieldId => {
                    const photoInput = document.getElementById(fieldId + "Input");
                    if (photoInput && photoInput.files && photoInput.files.length > 0) {
                        formData.append(fieldId, photoInput.files[0]);
                        console.log(`已添加 ${fieldId} 照片: ${photoInput.files[0].name}`);
                    } else {
                        console.log(`未找到 ${fieldId} 照片或未選擇文件`);
                    }
                });

                console.log("正在發送請求...");
                const response = await $.ajax({
                    type: "POST",
                    url: `${apiURL}/member`,
                    headers: { 
                        Authorization: "Bearer " + userData.token
                    },
                    data: formData,
                    processData: false,
                    contentType: false,
                    xhr: function() {
                        var xhr = new window.XMLHttpRequest();
                        xhr.upload.addEventListener("progress", function(evt) {
                            if (evt.lengthComputable) {
                                var percentComplete = evt.loaded / evt.total;
                                console.log('上傳進度：', percentComplete * 100 + '%');
                            }
                        }, false);
                        return xhr;
                    }
                });

                console.log("收到響應:", response);

                if (response.returnCode === "1") {
                    showSuccessFileNotification();
                    console.log("更新成功，準備跳轉...");
                    setTimeout(() => {
                        window.location.href = "memberVerifyList.html";
                    }, 1000);
                } else {
                    console.error("API 響應錯誤:", response);
                    handleApiResponse(response);
                }
            } catch (error) {
                console.error("發生錯誤:", error);
                showErrorNotification();
            } finally {
                uploadForm.classList.add("was-validated");
            }
        }
    }

    passButton.addEventListener("click", handleSubmit(1));
    failButton.addEventListener("click", handleSubmit(2));
}

function getOrderList() {
    const updateMemberVerifyId = sessionStorage.getItem("updateMemberVerifyId");
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const userData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = userData.token;

    const action = "getOrderList";
    const source = "HBEVBACKEND";
    const chsmString = action + source + "HBEVOrderBApi";
    const chsm = CryptoJS.MD5(chsmString).toString().toLowerCase();

    const data = JSON.stringify({ memberId: updateMemberVerifyId });

    $.ajax({
        type: "POST",
        url: `${apiURL}/order`,
        headers: { Authorization: "Bearer " + user_token },
        data: {
            action: action,
            source: source,
            chsm: chsm,
            data: data
        },
        success: function(response) {
            console.log("Order List Response:", response);
            if (response.returnCode === "1") {
                // Handle successful response
                displayOrderList(response.returnData);
            } else {
                // Handle error response
                console.error("Error fetching order list:", response.returnMsg);
                showErrorNotification("Failed to fetch order list: " + response.returnMsg);
            }
        },
        error: function(xhr, status, error) {
            console.error("AJAX error:", status, error);
            showErrorNotification("An error occurred while fetching the order list.");
        }
    });
}

function displayOrderList(data) {
    $(document).ready(function() {
        try {
            // If the DataTable already exists, destroy it
            if ($.fn.DataTable.isDataTable('#orderList')) {
                $('#orderList').DataTable().destroy();
            }

            // Initialize or reinitialize the DataTable
            $('#orderList').DataTable({
                data: data,
                columns: [
                    {
                        // New column for the button
                        data: null,
                        render: function(data, type, row) {
                            return `<a href="../orderList/orderDetail_read.html" data-id = "${row.orderNo}" class="btn btn-primary btn-sm check-button">前往訂單</a>`;
                        }
                    },
                    { data: "orderNo" },
                    { data: "createTime" },
                    { data: "orderStime" },
                    { data: "orderEtime" },
                    { data: "modelName" },
                    { data: "deposit" },
                    { data: "returnFee" },
                    { data: "totalAmount" }
                ],
                drawCallback: function () {
                    // handlePagePermissions(currentUser, currentUrl);
                },
                columnDefs: [{ orderable: false, targets: [0] }],
                order: [],
            });

            // Show the modal
            $("#orderListModal").modal("show");
        } catch (error) {
            console.error("Error initializing DataTable:", error);
            // Handle the error (e.g., show an error message to the user)
        }
    });
}

// 設置按鈕點擊事件
$(document).on("click", ".check-button", function () {
    var id = $(this).data("id");
    sessionStorage.setItem("readOrderId", id);
});