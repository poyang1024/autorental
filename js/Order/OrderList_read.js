// 照片位置對應
// '左前照片','右前照片','左後照片','右後照片' 因需求關係暫時不使用
const photoMappings = {
    '車頭照片': { pick: 'pickFront', return: 'returnFront' },
    '左邊照片': { pick: 'pickLeft', return: 'returnLeft' },
    '右邊照片': { pick: 'pickRight', return: 'returnRight' },
    // '左前照片': { pick: 'pickLeftFront', return: 'returnLeftFront' },
    // '右前照片': { pick: 'pickRightFront', return: 'returnRightFront' },
    // '左後照片': { pick: 'pickLeftBack', return: 'returnLeftBack' },
    // '右後照片': { pick: 'pickRightBack', return: 'returnRightBack' },
    '車尾照片': { pick: 'pickBack', return: 'returnBack' },
    '上面照片': { pick: 'pickTop', return: 'returnTop' },
};

// 額外照片對應
const otherPhotoMappings = {
    pick: ['pickOther1', 'pickOther2', 'pickOther3', 'pickOther4', 'pickOther5', 
           'pickOther6', 'pickOther7', 'pickOther8', 'pickOther9'],
    return: ['returnOther1', 'returnOther2', 'returnOther3', 'returnOther4', 'returnOther5',
             'returnOther6', 'returnOther7', 'returnOther8', 'returnOther9']
};

// 基本照片位置陣列
const photoPositions = [
    '車頭照片',
    '左邊照片',
    '右邊照片',
    // '左前照片',
    // '右前照片',
    // '左後照片',
    // '右後照片',
    '車尾照片',
    '上面照片',
];

// 建立單個照片欄位
function createPhotoColumn(label, elementId, type) {
    const col = document.createElement('div');
    col.className = 'col-md-4 col-sm-6 mb-3';
    
    // 為其他照片添加額外的 class，用於控制顯示/隱藏
    if (label.includes('其他照片')) {
        col.classList.add('other-photo');
        col.style.display = 'none'; // 預設隱藏
    }

    const card = document.createElement('div');
    card.className = 'card';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body p-2';

    const imgContainer = document.createElement('div');
    imgContainer.className = 'position-relative';

    const img = document.createElement('img');
    img.id = elementId;
    img.alt = label;
    img.className = 'img-fluid';
    img.style.width = '100%';
    img.style.height = '400px';
    img.style.objectFit = 'cover';

    setDefaultImage(img);

    const labelDiv = document.createElement('div');
    labelDiv.className = 'position-absolute bottom-0 start-0 w-100 bg-dark bg-opacity-50 text-white p-2';
    labelDiv.style.textAlign = 'center';
    labelDiv.textContent = label;

    imgContainer.appendChild(img);
    imgContainer.appendChild(labelDiv);
    cardBody.appendChild(imgContainer);
    card.appendChild(cardBody);
    col.appendChild(card);

    return col;
}

// 建立照片網格
function createPhotoGrid(containerId, type) {
    if (!type) {
        console.error('未提供照片類型(type)參數');
        return;
    }

    const containerElement = document.getElementById(containerId);
    if (!containerElement) {
        console.error(`找不到容器: ${containerId}`);
        return;
    }

    let rowElement = containerElement.querySelector('.row');
    if (!rowElement) {
        rowElement = document.createElement('div');
        rowElement.className = 'row';
        containerElement.appendChild(rowElement);
    }

    rowElement.innerHTML = '';

    try {
        // 建立基本照片網格
        photoPositions.forEach((position, index) => {
            const col = createPhotoColumn(position, `${type}Photo${index}`, type);
            rowElement.appendChild(col);
        });

        // 建立展開/收合按鈕
        const buttonCol = document.createElement('div');
        buttonCol.className = 'col-12 mb-3 text-center';
        
        const toggleButton = document.createElement('button');
        toggleButton.className = 'btn btn-outline-primary';
        toggleButton.textContent = '顯示其他照片';
        toggleButton.onclick = function() {
            const otherPhotos = containerElement.querySelectorAll('.other-photo');
            const isHidden = otherPhotos[0].style.display === 'none';
            
            otherPhotos.forEach(photo => {
                photo.style.display = isHidden ? '' : 'none';
            });
            
            this.textContent = isHidden ? '收起其他照片' : '顯示其他照片';
        };
        
        buttonCol.appendChild(toggleButton);
        rowElement.appendChild(buttonCol);

        // 建立其他照片網格
        otherPhotoMappings[type].forEach((_, index) => {
            const col = createPhotoColumn(`其他照片 ${index + 1}`, `${type}OtherPhoto${index}`, type);
            rowElement.appendChild(col);
        });
    } catch (error) {
        console.error('建立照片網格時發生錯誤:', error);
    }
}

// 從 API 取得縮圖 URL
async function getThumbnailUrl(filename, photoId) {
    if (!filename) return null;
    
    try {
        const jsonStringFromLocalStorage = localStorage.getItem("userData");
        if (!jsonStringFromLocalStorage) {
            console.error('找不到使用者資料');
            return null;
        }

        const gertuserData = JSON.parse(jsonStringFromLocalStorage);
        const user_token = gertuserData.token;
        
        const action = "getCompressionPhoto";
        const source = "HBEVBACKEND";
        const chsmtoGetphoto = action + source + "HBEVGetFileBApi";
        const chsm = CryptoJS.MD5(chsmtoGetphoto).toString().toLowerCase();

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
        }
        
        console.error("獲取縮略圖失敗:", response);
        return null;
    } catch (error) {
        console.error("獲取縮略圖時發生錯誤:", error);
        return null;
    }
}

// 處理單張照片
function handlePhoto(photoId, photoUrl) {
    const element = document.getElementById(photoId);
    if (!element) {
        console.error(`找不到照片元素: ${photoId}`);
        return;
    }

    // 從 photoId 提取 'pickPhoto' 或 'returnPhoto'
    const type = photoId.startsWith('pick') ? 'pickPhoto' : 'returnPhoto';
    
    if (photoUrl) {
        console.log('處理照片:', {
            photoId,
            type,
            photoUrl
        });
        
        getThumbnailUrl(photoUrl, type)  // 傳入 'pickPhoto' 或 'returnPhoto'
            .then(photo => {
                if (photo) {
                    element.src = photo;
                    element.onerror = () => setDefaultImage(element);
                } else {
                    setDefaultImage(element);
                }
            })
            .catch(error => {
                console.error(`載入照片失敗: ${photoId}`, error);
                setDefaultImage(element);
            });
    } else {
        setDefaultImage(element);
    }
}

// 載入所有照片
function loadPhotos(photoData, type) {
    if (!photoData || !photoData[0]) {
        console.warn('沒有照片資料可載入');
        return;
    }
    
    try {
        console.log(`載入 ${type} 照片`);
        
        // 載入基本照片
        photoPositions.forEach((position, index) => {
            const photoKey = photoMappings[position][type];
            const photoUrl = photoData[0][photoKey];
            const elementId = `${type}Photo${index}`;
            
            handlePhoto(elementId, photoUrl);
        });

        // 載入其他照片
        otherPhotoMappings[type].forEach((photoKey, index) => {
            const photoUrl = photoData[0][photoKey];
            const elementId = `${type}OtherPhoto${index}`;
            
            handlePhoto(elementId, photoUrl);
        });
    } catch (error) {
        console.error('載入照片時發生錯誤:', error);
    }
}

// 設定預設圖片
function setDefaultImage(imgElement) {
    const defaultSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#f0f0f0"/>
            <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#999" text-anchor="middle" dy=".3em">No Image</text>
        </svg>
    `;
    
    imgElement.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(defaultSvg);
}

// 初始化所有照片
function initializePhotos(returnPhotoData) {
    try {
        // 建立照片網格
        createPhotoGrid('pickupPhotoGrid', 'pick');
        createPhotoGrid('returnPhotoGrid', 'return');

        // 載入照片
        if (returnPhotoData && returnPhotoData.length > 0) {
            loadPhotos(returnPhotoData, 'pick');
            loadPhotos(returnPhotoData, 'return');
        }
    } catch (error) {
        console.error('初始化照片時發生錯誤:', error);
    }
}

$(document).ready(function () {
    handlePageReadPermissions(currentUser, currentUrl);

    // 確保訂單備註可編輯
    $("#orderRemark").prop("disabled", false);

    var readOrderId = sessionStorage.getItem("readOrderId");
    const dataId = { orderNo: readOrderId };
    const IdPost = JSON.stringify(dataId);
    console.log(IdPost);

    // Parse JSON string from localStorage
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const gertuserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = gertuserData.token;

    // Prepare data for API calls
    var action = "getOrderDetail";
    var source = "HBEVBACKEND";
    var chsmtoGetHolidayList = action + source + "HBEVOrderBApi";
    var chsm = CryptoJS.MD5(chsmtoGetHolidayList).toString().toLowerCase();

    // Order details table
    if ($.fn.DataTable.isDataTable('#orderDetailList')) {
        $('#orderDetailList').DataTable().clear().destroy();
    }
    var orderDetailTable = $("#orderDetailList").DataTable({
        columns: [
            { data: "feeName" },
            { data: "fee" },
            { data: "remark" },
            { data: "payTypeName" },
            { data: "TappayRecTradeId" },
            { data: "statusName" },
            { data: "updateOperatorName" },
            { data: "updateTime" },
        ],
        drawCallback: function () {
        },
        order: [],
    });

    // Invoice details table
    if ($.fn.DataTable.isDataTable('#invoiceList')) {
        $('#invoiceList').DataTable().clear().destroy();
    }
    var invoiceTable = $("#invoiceList").DataTable({
        columns: [
            { data: "invoiceNo" },
            { data: "createTime" },
            { data: "invoiceValue" },
            { data: "statusName" },
            { data: "updateTime" }
        ],
        drawCallback: function () {
        },
        order: [],
    });

    // POST call api method  
    $.ajax({
        type: "POST",
        url: `${apiURL}/order`,
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
                // Order information
                const orderData = responseData.returnData[0];
                $("#orderId").val(orderData.orderNo);
                sessionStorage.setItem("orderNo", orderData.orderNo);
                
                $("#orderTime").val(orderData.createTime);
                $("#planName").val(orderData.salesPlanName);
                $("#planQuantity").val(orderData.amount);
                $("#usageHours").val(orderData.rentHour);
                $("#orderAmount").val(orderData.deposit);
                $("#returnFee").val(orderData.returnFee);
                $("#totalAmount").val(orderData.totalAmount);
                $("#orderStatus").val(orderData.statusName);
                $("#orderRemark").val(orderData.remark);

                // Car & Member data
                const CarAndMemberData = responseData.returnCarAndMemberData[0];
                $("#brand").val(CarAndMemberData.brandName);
                $("#model").val(CarAndMemberData.modelName);
                $("#plate").val(CarAndMemberData.licensePlateNumber);
                $("#licenseType").val(CarAndMemberData.carlevelName);
                $("#pickupDistance").val(CarAndMemberData.pickTotalMileage);
                $("#returnDistance").val(CarAndMemberData.returnTotalMileage);
                $("#name").val(CarAndMemberData.userName);
                $("#birthdate").val(CarAndMemberData.userBirthDay);
                $("#phone").val(CarAndMemberData.userPhone);
                $("#licenseHeld").val(CarAndMemberData.userLevelName);
                $("#totalDistance").val(CarAndMemberData.userTotalMileage);

                // Pickup information
                const PickData = responseData.returnPickData[0];
                $("#pickupTime").val(PickData.orderStime);
                $("#returnTime").val(PickData.orderEtime);
                $("#actualPickupTime").val(PickData.pickTime);
                $("#actualReturnTime").val(PickData.returnTime);
                $("#rentalCompany").val(PickData.companyName);
                $("#pickupLocation").val(PickData.pickSiteName);
                $("#realPickSiteName").val(PickData.realPickSiteName);
                $("#realReturnSiteName").val(PickData.realReturnSiteName);
                $("#returnSiteName").val(PickData.returnSiteName);

                if (responseData.returnPhotoData) {
                    console.log('發現照片資料:', responseData.returnPhotoData); // 新增
                    initializePhotos(responseData.returnPhotoData);
                } else {
                    console.log('沒有照片資料'); // 新增
                    initializePhotos(responseData.returnPhotoData);
                }        

                updatePageWithData(responseData.returnFeeData, orderDetailTable);
                updatePageWithData(responseData.returnInvoiceData, invoiceTable);

                // Hide loading spinner
                $("#spinner").hide();
            } else {
                handleApiResponse(responseData);
            }
        },
        error: function (error) {
            showErrorNotification();
        },
    });

    $("#ordereditButton").on("click", function() {
        updateOrderRemark();
    });

    function updateOrderRemark() {
        // Get the order number and remark
        const orderNo = $("#orderId").val();
        const orderRemark = $("#orderRemark").val();

        // Get user token from localStorage
        const jsonStringFromLocalStorage = localStorage.getItem("userData");
        const gertuserData = JSON.parse(jsonStringFromLocalStorage);
        const user_token = gertuserData.token;

        // Prepare API parameters
        const action = "updateOrderDetail";
        const source = "HBEVBACKEND";
        const chsmToUpdate = action + source + "HBEVOrderBApi";
        const chsm = CryptoJS.MD5(chsmToUpdate).toString().toLowerCase();

        // Prepare the data object
        const data = JSON.stringify({
            orderNo: orderNo,
            remark: orderRemark
        });

        // Make the API call
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
                if (response.returnCode === "1") {
                    toastr.success(response.returnMessage);
                    setTimeout(function() {
                        window.location.href = "orderList.html";
                    }, 1000);
                } else {
                    toastr.error("更新失敗：" + response.returnMessage);
                }
            },
            error: function(error) {
                toastr.error("發生錯誤，請稍後再試");
            }
        });
    }
    

    // Cancel order button click event
    $('button[data-bs-target="#cancelOrderModal"]').on('click', function(e) {
        var orderId = $('#orderId').val()
        // var orderprepayAmount = $('#orderAmount').val()
        // var returnFee = orderprepayAmount-orderprepayAmount*0.5
        setCancelMessage(orderId);
    });

    function setCancelMessage(orderId) {
        // var message = `您確定要取消訂單 ${orderId} 嗎？`;
        // message += `<br>訂金 ${orderprepayAmount} - 取消費 (${orderprepayAmount} * 50%) 元 = 刷卡退費${returnFee}元，是否要取消訂單`;
        
        var title = "";
		var message = "";

		var action = "checkOrderRefund";
        var source = "HBEVBACKEND";
        var chsmtoCancelOrder = action + source + "HBEVOrderBApi";
        var chsm = CryptoJS.MD5(chsmtoCancelOrder).toString().toLowerCase();

        var data = JSON.stringify({ 
            orderNo: orderId,
            orderRemark: $("#orderRemark").val() // Include orderRemark
        });

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
            success: function (response) {
                if (response.returnCode === "1") {
                    console.log(response.returnData);
                    title += `${response.returnData[0].title} <br/>`;
                    message += `${response.returnData[0].content}`;
                    // Update modal content
                    $('#cancelOrderModalLabel').html(title);
                    $('#cancelmessage').html(message);
                } else {
                    toastr.error("無法取得退款資訊：" + response.returnMessage);
                }
            },
            error: function (error) {
                toastr.error("發生錯誤，請稍後再試");
            }
        });
    }

    // Confirm cancel order button click event
    $('#confirmCancelOrder').on('click', function() {
        var orderId = $('#orderId').val();
        cancelOrder(orderId);
    });

    function cancelOrder(orderId) {
        var action = "cancelOrder";
        var source = "HBEVBACKEND";
        var chsmtoCancelOrder = action + source + "HBEVOrderBApi";
        var chsm = CryptoJS.MD5(chsmtoCancelOrder).toString().toLowerCase();

        var data = JSON.stringify({ 
            orderNo: orderId,
            orderRemark: $("#orderRemark").val() // Include orderRemark
        });

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
            success: function (response) {
                if (response.returnCode === "1") {
                    toastr.success("訂單已成功取消");
                    $('#cancelOrderModal').modal('hide');
                    setTimeout(function() {
                        location.reload();
                    }, 1000);
                } else {
                    toastr.error("取消訂單失敗：" + response.returnMessage);
                }
            },
            error: function (error) {
                toastr.error("發生錯誤，請稍後再試");
            }
        });
    }

    // Handle power interruption
    $('#confirmInterruptPower').on('click', function() {
        var orderId = $('#orderId').val();
        interruptPower(orderId);
    });

    function interruptPower(orderId) {
        var action = "powerOff";
        var source = "HBEVBACKEND";
        var chsmtoInterruptPower = action + source + "HBEVOrderBApi";
        var chsm = CryptoJS.MD5(chsmtoInterruptPower).toString().toLowerCase();

        var data = JSON.stringify({ 
            orderNo: orderId,
            orderRemark: $("#orderRemark").val() // Include orderRemark
        });

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
            success: function (response) {
                if (response.returnCode === "1") {
                    toastr.success("電源已成功中斷");
                    $('#interruptPowerModal').modal('hide');
                    setTimeout(function() {
                        location.reload();
                    }, 1000);
					// location.reload();
                } else {
                    toastr.error("中斷電源失敗：" + response.returnMessage);
                }
            },
            error: function (error) {
                toastr.error("發生錯誤，請稍後再試");
            }
        });
    }

	// Order appeal form submission
	var appealForm = document.getElementById("orderAppealForm");

	if (appealForm) {
		// Remove the form's submit event listener and handle submission via button click
		$("#submitAppeal").on("click", function(event) {
			event.preventDefault();
			submitAppealForm();
		});
	} else {
		console.warn("Appeal form not found in the document. Appeal functionality may not work as expected.");
	}

	function submitAppealForm() {
		// Get form values
		let discountAmount = $("#discountAmount").val().trim();
		let orderRemarks = $("#orderRemarks").val().trim();
		let orderNo = $("#orderId").val();
        let orderRemark = $("#orderRemark").val(); // Get orderRemark

		// Check if all required fields are filled
		if (!discountAmount || !orderRemarks) {
			if (!discountAmount) {
				// toastr.error("請填寫折扣金額");
				$("#discountAmount").addClass("is-invalid");
			} else {
				$("#discountAmount").removeClass("is-invalid");
			}
			if (!orderRemarks) {
				// toastr.error("請填寫訂單明細備註");
				$("#orderRemarks").addClass("is-invalid");
			} else {
				$("#orderRemarks").removeClass("is-invalid");
			}
			return; // Stop the submission if validation fails
		}

		// Remove any previous error styling
		$("#discountAmount, #orderRemarks").removeClass("is-invalid");

		var appealData = {
            orderNo: orderNo,
            discount: discountAmount,
            discountReason: orderRemarks,
            orderRemark: orderRemark // Include orderRemark
        };

		// Prepare API call data
		var action = "appealOrder";
		var source = "HBEVBACKEND";
		var chsmtoSubmitOrderAppeal = action + source + "HBEVOrderBApi";
		var chsm = CryptoJS.MD5(chsmtoSubmitOrderAppeal).toString().toLowerCase();

		var formData = new FormData(appealForm);
		formData.set("action", action);
		formData.set("source", source);
		formData.set("chsm", chsm);
		formData.set("data", JSON.stringify(appealData));

		$.ajax({
			type: "POST",
			url: `${apiURL}/order`,
			headers: { Authorization: "Bearer " + user_token },
			data: formData,
			processData: false,
			contentType: false,
			success: function (response) {
				if (response.returnCode === "1") {
					console.log("Order appeal submitted successfully", response);
					toastr.success("訂單申訴已成功提交");
					$('#orderAppealModal').modal('hide');
                    setTimeout(function() {
                        location.reload();
                    }, 1000);
					// location.reload();
				} else {
					toastr.error("提交訂單申訴失敗：" + response.returnMessage);
				}
			},
			error: function (error) {
				toastr.error("發生錯誤，請稍後再試");
			}
		});
	}

	// Ensure the form fields are not disabled when the modal opens
	$('#orderAppealModal').on('show.bs.modal', function () {
		$('#discountAmount').prop('disabled', false).removeClass('is-invalid');
		$('#orderRemarks').prop('disabled', false).removeClass('is-invalid');
	});

	// Add input event listeners to remove error styling when user starts typing
	$("#discountAmount, #orderRemarks").on('input', function() {
		$(this).removeClass('is-invalid');
	});
});

function updatePageWithData(responseData, table) {
    table.clear().rows.add(responseData).draw();
}
