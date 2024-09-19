$(function () {
	$("#loginForm").submit(function (event) {
		event.preventDefault();

		var account = $("#username").val();
		var password = $("#password").val();
		var action = "login";
        var source = "HBEVBACKEND";
        var cobineChsm = account + password + action + source + "HBEVLoginBApi";
        var chsm = CryptoJS.MD5(cobineChsm).toString().toLowerCase();
		$.ajax({
			type: "POST",
			url: `${apiURL}/login`,
			data: {
                account: account,
                password: password,
                action: action,
                source: source,
                chsm: chsm
            },
			success: function (response) {
				if (response.returnCode === "1") {

					var token = response.returnData.token; // Assuming the response contains the JWT token

					const userData = {
						returnCode: response.returnCode,
						returnMessage: response.returnMessage,
						token: response.returnData.token,
					};

                    // Store the JWT token
                    // localStorage.setItem("jwtToken", token);

					localStorage.setItem("userData", JSON.stringify(userData));

					var menuAction = "select";
					var chsmtoMenu = menuAction + source + "HBEVMenuBApi";
					var menuChsm = CryptoJS.MD5(chsmtoMenu).toString().toLowerCase();
					$.ajax({
						type: "POST",
						url: `${apiURL}/menu`,
						headers: { Authorization: "Bearer " + token },
						data: {
                            action: menuAction,
                            source: source,
                            chsm: menuChsm
                        },
						success: function (secondApiResponse) {
							var currentUser = {
								userreturnCode: secondApiResponse.returnCode,
								userMessage: secondApiResponse.returnMessage,
								userPhoto: secondApiResponse.personalPhoto,
								userName: secondApiResponse.name,
								userretrunData: secondApiResponse.returnData,
							};

							localStorage.setItem("currentUser", JSON.stringify(currentUser));
							
							// console.log(currentUser.userretrunData);
							
							// 成功導向測試頁面
							if (currentUser.userreturnCode === "1") {
								
								showSuccessLoginNotification();

								setTimeout(function () {
									window.location.href = "index.html";
								}, 1000);
							} else {
								handleApiResponse(secondApiResponse);
							}
						},
						error: function () {
							showErrorNotification();
						},
					});
				} else {
					handleApiResponse(response);
				}
			},
			error: function () {
				showErrorNotification();
			},
		});
	});
});
