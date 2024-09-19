var currentUser = localStorage.getItem("currentUser");
var userData = localStorage.getItem("userData");
var userObject = JSON.parse(currentUser);
var userName = userObject.userName;
var userPhoto = userObject.userPhoto;

// Authlogin
$(document).ready(function () {
    // Check if the JWT token is present and valid
    if (!userData || JSON.parse(userData).returnCode !== "1") {
        window.location.href = "signin.html";
    }
});

// Display user name and photo
window.onload = function () {
    var userNameElement = document.getElementById("userName");
    userNameElement.textContent = userName;

    var imgElement = document.querySelector(".userImg");
    imgElement.src = userPhoto;
};

// Log-out
$(function () {
    // Handle logout button click
    $("#logout").on("click", function (event) {
        // Prevent default link behavior
        event.preventDefault();

        // Remove user data from localStorage
        localStorage.removeItem("userData");
        localStorage.removeItem("currentUser");

        // Use setTimeout to ensure localStorage operations complete before redirecting
        setTimeout(function() {
            // 获取当前 URL 并检查倒数第二个部分是否是 html
            let currentPath = window.location.pathname;
            if (currentPath.charAt(0) === "/") {
                currentPath = currentPath.slice(1);
            }

            const pathParts = currentPath.split("/");
            const secondLastPart = pathParts[pathParts.length - 2];

            // 判断倒数第二个部分是否是 html
            const isHtmlDirectory = secondLastPart === "html";

            const subMenuItem = document.createElement("a");
            if (isHtmlDirectory) {
                window.location.href = "signin.html";
            } else {
                window.location.href = "../signin.html";
            }
        }, 100);
    });
});

// Notifications count
// $(document).ready(function () {
//     // Retrieve the JWT token
//     const token = localStorage.getItem("jwtToken");

//     if (token) {
//         // Send API request to get notifications
//         $.ajax({
//             type: "POST",
//             url: `${apiURL}/notification`,
//             headers: {
//                 "Authorization": `Bearer 
// 				${token}`
//             },
//             data: {
//                 action: "getNotificationList",
//             },
//             success: function (responseData) {
//                 // Update the notifications count
//                 var unreadMsgNumElement = document.getElementById("unreadMsgNum");
//                 if (unreadMsgNumElement) {
//                     unreadMsgNumElement.textContent = responseData.unReadAmount;
//                 }
//             },
//             error: function (error) {
//                 console.error("錯誤:", error);
//             },
//         });
//     }
// });
