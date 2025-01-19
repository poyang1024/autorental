$(document).ready(function () {
    handlePageReadPermissions(currentUser, currentUrl);

    var readMemberVerifyId = sessionStorage.getItem("readMemberVerifyId");
    const dataId = { id: readMemberVerifyId };
    const IdPost = JSON.stringify(dataId);

    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    var action = "getMemberVerifyDetail";
    var source = "HBEVBACKEND";
    var chsmtoGetMemberList = action + source + "HBEVMemberBApi";
    var chsm = CryptoJS.MD5(chsmtoGetMemberList).toString().toLowerCase();

    $.ajax({
        type: "POST",
        url: `${apiURL}/member`,
        headers: { Authorization: "Bearer " + user_token },
        data: {
            action: action,
            source: source,
            chsm: chsm,
            data: IdPost
        },
        success: function (responseData) {
            console.log(responseData);
            if (responseData.returnCode === "1" && responseData.returnData.length > 0) {
                const memberVerifyData = responseData.returnData[0];
                const verifyRecordData = responseData.verifyRecord;
                
                $("#MemV-levelId").val(memberVerifyData.levelId);
                $("#MemV-account").val(memberVerifyData.account);
                $("#MemV-password").val(memberVerifyData.password);
                $("#MemV-name").val(memberVerifyData.name);
                $("#MemV-birthDay").val(formatDateForInput(memberVerifyData.birthDay));
                $("#MemV-email").val(memberVerifyData.email);
                $("#MemV-phone").val(memberVerifyData.phone);
                $("#MemV-remark").val(memberVerifyData.remark);
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

                if (memberVerifyData.otherPhotoData != 'null') {
                    const otherPhotos = JSON.parse(memberVerifyData.otherPhotoData);
                    const container = $("#memberVerifyPhotoContainer");
                    
                    // 新增展開/收合按鈕
                    const toggleButton = `
                    <hr class="my-4">
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
                                <label class="form-label" ${!photo.memberFileRemark ? 'style="color: red; font-weight: bold;"' : ''}>${photo.memberFileRemark || '此照片無備註'}</label>
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

                $("#spinner").hide();
            } else {
                handleApiResponse(responseData);
            }
        },
        error: function (error) {
            showErrorNotification();
        },
    });

    // Add click event listener to the order button
    $("#orderButton").on("click", function(e) {
        e.preventDefault(); // Prevent the default anchor behavior
        getOrderList();
    });

});

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
function handlePhoto(photoId, photoUrl) {
    var cleanedPhotoId = photoId.replace(/^#/, '');
    const $photo = $(photoId);
    
    if (photoUrl) {
        getThumbnailUrl(photoUrl, cleanedPhotoId)
            .then(photo => {
                if (photo) {
                    $photo.attr("src", photo)
                        .on('error', function() {
                            setDefaultImage(this);
                        });
                } else {
                    setDefaultImage($photo);
                }
            })
            .catch(error => {
                console.error(`Error loading photo for ${cleanedPhotoId}:`, error);
                setDefaultImage($photo);
            });
    } else {
        setDefaultImage($photo);
    }
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

function getOrderList() {
    const readMemberVerifyId = sessionStorage.getItem("readMemberVerifyId");
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const userData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = userData.token;

    const action = "getOrderList";
    const source = "HBEVBACKEND";
    const chsmString = action + source + "HBEVOrderBApi";
    const chsm = CryptoJS.MD5(chsmString).toString().toLowerCase();

    const data = JSON.stringify({ memberId: readMemberVerifyId });

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