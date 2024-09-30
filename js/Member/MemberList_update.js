$(document).ready(async function () {
    handlePageUpdatePermissions(currentUser, currentUrl);
    try {
        await initializeUpdateMemberForm();
    } catch (error) {
        console.error("初始化錯誤:", error);
        showErrorNotification();
    }

    // Add click event listener to the order button
    $("#orderButton").on("click", function(e) {
        e.preventDefault(); // Prevent the default anchor behavior
        getOrderList();
    });
});

async function initializeUpdateMemberForm() {
    try {
        const memberId = sessionStorage.getItem("updateMemberId");
        if (!memberId) {
            throw new Error("sessionStorage 中缺少 updateMemberId");
        }

        const memberDetails = await fetchMemberDetails(memberId);

        populateMemberDetails(memberDetails);

        setupUpdateMember(memberId);
    } catch (error) {
        console.error("表單初始化錯誤:", error);
        showErrorNotification();
    }
}

async function fetchMemberDetails(siteId) {
    const userData = JSON.parse(localStorage.getItem("userData"));
    var action = "getMemberDetail";
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
            return response.returnData[0];
        } else {
            handleApiResponse(response);
        }
    } catch (error) {
        showErrorNotification();
    }
}

function populateMemberDetails(memberData) {
    // 填充所有其他字段
    $("#Mem-account").val(memberData.account);
    $("#Mem-name").val(memberData.name);
    $("#Mem-password").val(memberData.password);
    $("#Mem-birthDay").val(formatDateForInput(memberData.birthDay));
    $("#Mem-email").val(memberData.email);
    $("#Mem-phone").val(memberData.phone);
    $("#Mem-remark").val(memberData.remark);
    $("#Mem-donationUnit").val(memberData.donationUnit);
    $("#Mem-invoiceEmail").val(memberData.invoiceEmail);
    $("#Mem-mobileCarrier").val(memberData.mobileCarrier);
    $("#Mem-invoiceTitle").val(memberData.invoiceTitle);
    $("#Mem-taxID").val(memberData.taxID);
    $("#Mem-levelId").val(memberData.levelId);
    $("#Mem-totalMileage").val(memberData.totalMileage);
    $("#Mem-verifyStatus").val(memberData.verifyStatus);
    $("#Mem-status").val(memberData.status);

    $("#BuildTime").val(formatDateTime(memberData.createTime));
    $("#EditTime").val(formatDateTime(memberData.updateTime));
    $("#EditAccount").val(memberData.updateOperatorName);

    // Handle photos
    handlePhoto("#identificationCardFront", memberData.identificationCardFront);
    handlePhoto("#identificationCardBack", memberData.identificationCardBack);
    handlePhoto("#drivingLicenseFront", memberData.drivingLicenseFront);
    handlePhoto("#drivingLicenseBack", memberData.drivingLicenseBack);
    handlePhoto("#selfie", memberData.selfie);

    // 設置發票類型並觸發 change 事件
    $("#Mem-invoiceType").val(memberData.invoiceType).trigger('change');

    $("#spinner").hide();

    // Invoice type change event handler
    $("#Mem-invoiceType").off('change').on('change', function() {
        const invoiceType = $(this).val();
        
        // Hide all related fields
        $("#Mem-donationUnit, #Mem-invoiceEmail, #Mem-mobileCarrier, #Mem-invoiceTitle, #Mem-taxID").closest('.col-sm-6').hide();
        
        // Remove required attribute from all fields
        $("#Mem-donationUnit, #Mem-invoiceEmail, #Mem-mobileCarrier, #Mem-invoiceTitle, #Mem-taxID").prop('required', false);
        
        // Show relevant fields based on invoice type and set them as required
        switch(invoiceType) {
            case "3": // 愛心捐贈
                $("#Mem-donationUnit").closest('.col-sm-6').show();
                $("#Mem-donationUnit").prop('required', true);
                break;
            case "1": // 個人電子發票（無統編）
            $("#Mem-invoiceEmail, #Mem-mobileCarrier").closest('.col-sm-6').show();
            $("#Mem-invoiceEmail, #Mem-mobileCarrier").prop('required', true);
            // Check if memberData.email has a value, if not use #Mem-email value
            if (memberData.email) {
                $("#Mem-invoiceEmail").val(memberData.email);
            } else {
                $("#Mem-invoiceEmail").val($("#Mem-email").val());
            }
            break;
            case "2": // 公司電子發票（有統編）
                $("#Mem-invoiceTitle, #Mem-taxID").closest('.col-sm-6').show();
                $("#Mem-invoiceTitle, #Mem-taxID").prop('required', true);
                break;
        }
    });

    // 再次觸發 change 事件，以確保字段正確顯示/隱藏
    $("#Mem-invoiceType").trigger('change');
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

function setupUpdateMember(memberId) {
    const uploadForm = document.getElementById("uploadForm");
    const photoFields = ["identificationCardFront", "identificationCardBack", "drivingLicenseFront", "drivingLicenseBack", "selfie"];

    if (!uploadForm) {
        console.error("上傳表單不存在。");
        return;
    }

    uploadForm.addEventListener("submit", async function (event) {   
        event.preventDefault();
        
        if (!uploadForm.checkValidity()) {
            event.stopPropagation();
            showWarningfillFormNotification();
            uploadForm.classList.add("was-validated");
            return;
        }

        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.token) {
                throw new Error("用戶數據或令牌缺失");
            }

            const action = "updateMemberDetail";
            const source = "HBEVBACKEND";
            const chsm = CryptoJS.MD5(action + source + "HBEVMemberBApi").toString().toLowerCase();

            const memberData = {
                id: memberId,
                account: $("#Mem-account").val(),
                name: $("#Mem-name").val(),
                password:$("#Mem-password").val(),
                birthDay: $("#Mem-birthDay").val(),
                email: $("#Mem-email").val(),
                phone: $("#Mem-phone").val(),
                remark: $("#Mem-remark").val(),
                invoiceType: $("#Mem-invoiceType").val(),
                donationUnit: $("#Mem-donationUnit").val(),
                invoiceEmail: $("#Mem-invoiceEmail").val(),
                mobileCarrier: $("#Mem-mobileCarrier").val(),
                invoiceTitle: $("#Mem-invoiceTitle").val(),
                taxID: $("#Mem-taxID").val(),
                levelId: $("#Mem-levelId").val(),
                totalMileage: $("#Mem-totalMileage").val(),
                verifyStatus: $("#Mem-verifyStatus").val(),
                status: $("#Mem-status").val()
            };

            console.log("會員數據:", memberData);

            const formData = new FormData();
            formData.append("action", action);
            formData.append("source", source);
            formData.append("chsm", chsm);
            formData.append("data", JSON.stringify(memberData));

            // Handle photo uploads
            photoFields.forEach(fieldId => {
                const photoInput = document.getElementById(fieldId + "Input");
                if (photoInput && photoInput.files && photoInput.files.length > 0) {
                    formData.append(fieldId, photoInput.files[0]);
                    console.log(`已添加 ${fieldId} 照片: ${photoInput.files[0].name}`);
                } else {
                    console.error(`未找到 ${fieldId} 照片或未選擇文件`);
                }
            });
            for (var pair of formData.entries()) {
                console.log(pair[0]+ ', ' + pair[1]); 
            }

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
                // console.log("更新成功，準備跳轉...");
                setTimeout(() => {
                    window.location.href = "memberList.html";
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
    });
}

function getOrderList() {
    const readMemberId = sessionStorage.getItem("updateMemberId");
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const userData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = userData.token;

    const action = "getOrderList";
    const source = "HBEVBACKEND";
    const chsmString = action + source + "HBEVOrderBApi";
    const chsm = CryptoJS.MD5(chsmString).toString().toLowerCase();

    const data = JSON.stringify({ memberId: readMemberId });

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