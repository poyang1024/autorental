// 全局變量
let map;
let directionsService;
let directionsRenderer;
let markers = []; // 用於存儲所有的標記

// 初始化函數
async function initMap() {
    // 加載必要的庫
    const { Map } = await google.maps.importLibrary("maps");
    const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes");

    // 創建地圖
    map = new Map(document.getElementById('map'), {
        center: { lat: 25.033964, lng: 121.564468 }, // 台北市中心
        mapId: "5588836", // 使用預設的地圖 ID
        zoom: 12
    });

    // 初始化 DirectionsService 和 DirectionsRenderer
    directionsService = new DirectionsService();
    directionsRenderer = new DirectionsRenderer({
        map: map,
        suppressMarkers: true, // 我們將自定義起點和終點標記
        polylineOptions: {
            strokeColor: '#4285F4', // 設置路線顏色為藍色
            strokeWeight: 5 // 設置路線寬度
        }
    });

    // 加載測試數據並繪製路線
    loadDataAndDrawRoute();
}

// 加載測試數據並繪製路線
async function loadDataAndDrawRoute() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getCarRoute";
    var source = "HBEVBACKEND";
    var chsmtoGetManualList = action + source + "HBEVCarBApi";
    var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

    var orderNo = sessionStorage.getItem("orderNo");
    const orderNoId = JSON.stringify({orderNo: orderNo});

    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/car`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
                data: orderNoId
            }
        });

        if (responseData.returnCode === "1") {
            console.log("Route data:", responseData.returnData);
            const convertedRouteData = convertRouteData(responseData.returnData);

            // 繪製路線
            drawDrivingRouteOnMap(convertedRouteData);
            // drawDrivingRouteOnMap(testRouteData); // 測試數據
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error fetching car list:", error);
        showErrorNotification();
    }
}

function convertRouteData(apiRouteData) {
    return apiRouteData.map(point => ({
        lat: parseFloat(point.coordinateY),
        lng: parseFloat(point.coordinateX),
        timestamp: point.RTCTime
    }));
}

// 測試數據
const testRouteData = [
    { lat: 25.033964, lng: 121.564468, timestamp: '2024-02-04T10:00:00' }, // 台北 101
    { lat: 25.047924, lng: 121.517081, timestamp: '2024-02-04T10:15:00' }, // 中正紀念堂
    { lat: 25.102356, lng: 121.548691, timestamp: '2024-02-04T10:30:00' }  // 國立故宮博物院
];


// 將路線點分割成多個組
function splitRouteData(routeData, maxWaypoints = 23) {
    const groups = [];
    for (let i = 0; i < routeData.length; i += maxWaypoints) {
        groups.push(routeData.slice(i, Math.min(i + maxWaypoints, routeData.length)));
    }
    return groups;
}

// 繪製行車路線
async function drawDrivingRouteOnMap(routeData) {
    if (routeData.length < 2) {
        console.error("At least two points are required to draw a route");
        return;
    }

    // 清除之前的標記
    clearMarkers();

    const origin = routeData[0];
    const destination = routeData[routeData.length - 1];

    // 分割路線點
    const waypoints = routeData.slice(1, -1).map(point => ({
        location: new google.maps.LatLng(point.lat, point.lng),
        stopover: true
    }));

    const request = {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING
    };

    try {
        const result = await new Promise((resolve, reject) => {
            directionsService.route(request, (result, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    resolve(result);
                } else {
                    reject(status);
                }
            });
        });

        directionsRenderer.setDirections(result);

        // 添加起點和終點標記
        addMarker(origin, '起點', 'green');
        addMarker(destination, '終點', 'red');

        // 添加途經點標記
        routeData.slice(1, -1).forEach((point, index) => {
            addMarker(point, `停靠點 ${index + 1}`, 'blue');
        });

        // 調整地圖視圖以顯示整個路線
        const bounds = new google.maps.LatLngBounds();
        result.routes[0].overview_path.forEach(point => bounds.extend(point));
        map.fitBounds(bounds);
    } catch (error) {
        console.error("Directions request failed due to " + error);
    }
}

// 添加標記
async function addMarker(position, title, color) {
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    
    const marker = new AdvancedMarkerElement({
        position: position,
        map: map,
        title: title,
        content: buildMarkerContent(title, color)
    });
    markers.push(marker);
}

// 構建標記內容
function buildMarkerContent(title, color) {
    const content = document.createElement('div');
    content.classList.add('custom-marker');
    content.style.backgroundColor = color;
    content.style.color = 'white';
    content.style.padding = '5px 10px';
    content.style.borderRadius = '5px';
    content.textContent = title;
    return content;
}

// 清除所有標記
function clearMarkers() {
    markers.forEach(marker => marker.map = null);
    markers = [];
}

document.getElementById("viewMapButton").addEventListener("click", function() {
    $('#mapModal').modal('show');
    
    // 確保地圖在模態框顯示後初始化
    $('#mapModal').on('shown.bs.modal', function () {
        if (!map) {
            initMap();
        } else {
            google.maps.event.trigger(map, 'resize');
            // 重新加載數據並繪製路線
            loadDataAndDrawRoute();
        }
    });
});

// 當 DOM 加載完成後初始化地圖
document.addEventListener('DOMContentLoaded', function() {
    // 不要在這裡直接調用 initMap，而是等待按鈕點擊
    initMap();
});