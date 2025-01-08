$(document).ready(function () {
    handlePageReadPermissions(currentUser, currentUrl);

    var readMemberId = sessionStorage.getItem("readMemberId");
    const dataId = { id: readMemberId };
    const IdPost = JSON.stringify(dataId);

    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    var action = "getMemberDetail";
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
                const memberData = responseData.returnData[0];
                
                $("#Mem-account").val(memberData.account);
                $("#Mem-name").val(memberData.name);
                $("#Mem-password").val(memberData.password);
                $("#Mem-birthDay").val(formatDateForInput(memberData.birthDay));
                $("#Mem-email").val(memberData.email);
                $("#Mem-phone").val(memberData.phone);
                $("#Mem-remark").val(memberData.remark);
                $("#Mem-invoiceType").val(memberData.invoiceType);
                $("#Mem-donationUnit").val(memberData.donationUnit);
                $("#Mem-invoiceEmail").val(memberData.invoiceEmail);
                $("#Mem-mobileCarrier").val(memberData.mobileCarrier);
                $("#Mem-invoiceTitle").val(memberData.invoiceTitle);
                $("#Mem-taxID").val(memberData.taxID);
                $("#Mem-address").val(memberData.address);
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

                // Trigger invoice type change to show/hide relevant fields
                $("#Mem-invoiceType").trigger('change');

                $("#spinner").hide();
            } else {
                handleApiResponse(responseData);
            }
        },
        error: function (error) {
            showErrorNotification();
        },
    });

    // Invoice type change event handler
    $("#Mem-invoiceType").on('change', function() {
        const invoiceType = $(this).val();
        
        // Hide all related fields
        $("#Mem-donationUnit, #Mem-invoiceEmail, #Mem-mobileCarrier, #Mem-invoiceTitle, #Mem-taxID").closest('.col-sm-6').hide();

        // Show relevant fields based on invoice type
        switch(invoiceType) {
            case "3": // 愛心捐贈
                $("#Mem-donationUnit").closest('.col-sm-6').show();
                break;
            case "1": // 個人電子發票（無統編）
                $("#Mem-invoiceEmail, #Mem-mobileCarrier").closest('.col-sm-6').show();
                break;
            case "2": // 公司電子發票（有統編）
                $("#Mem-invoiceTitle, #Mem-taxID").closest('.col-sm-6').show();
                break;
        }
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
    const readMemberId = sessionStorage.getItem("readMemberId");
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