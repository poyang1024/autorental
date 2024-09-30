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
                    // location.reload();
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

// Back button functionality
document.getElementById("backButton").addEventListener("click", function () {
    sessionStorage.removeItem("readOrderId");
    history.back();
});