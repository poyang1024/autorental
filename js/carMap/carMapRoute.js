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
    { lat: 25.033964, lng: 121.564468, name: "台北101" },
    { lat: 25.047924, lng: 121.517081, name: "中正紀念堂" },
    { lat: 25.102356, lng: 121.548691, name: "國立故宮博物院" },
    { lat: 25.042057, lng: 121.507070, name: "西門町" },
    { lat: 25.013450, lng: 121.535637, name: "台北車站" },
    { lat: 25.058169, lng: 121.535681, name: "臺北市立動物園" },
    { lat: 25.095141, lng: 121.525274, name: "士林夜市" },
    { lat: 25.024311, lng: 121.506896, name: "龍山寺" },
    { lat: 25.079619, lng: 121.576567, name: "松山文創園區" },
    { lat: 25.044384, lng: 121.507287, name: "華西街夜市" },
    { lat: 25.032360, lng: 121.519962, name: "台北市立美術館" },
    { lat: 25.037525, lng: 121.500735, name: "剝皮寮歷史街區" },
    { lat: 25.073615, lng: 121.501687, name: "士林官邸" },
    { lat: 25.082104, lng: 121.560857, name: "松山機場" },
    { lat: 25.026989, lng: 121.522292, name: "華山1914文化創意產業園區" },
    { lat: 25.041609, lng: 121.545400, name: "臺北小巨蛋" },
    { lat: 25.049115, lng: 121.549804, name: "國父紀念館" },
    { lat: 25.051089, lng: 121.479571, name: "台北市立兒童新樂園" },
    { lat: 25.023792, lng: 121.529837, name: "光華數位新天地" },
    { lat: 25.039340, lng: 121.498784, name: "艋舺龍山寺" },
    { lat: 25.020915, lng: 121.541707, name: "台北探索館" },
    { lat: 25.068613, lng: 121.522029, name: "圓山大飯店" },
    { lat: 25.071398, lng: 121.597283, name: "南港展覽館" },
    { lat: 25.043632, lng: 121.534804, name: "中山堂" },
    { lat: 25.037977, lng: 121.563652, name: "臺北文創大樓" },
    { lat: 25.058131, lng: 121.520583, name: "國立臺灣大學" },
    { lat: 25.088853, lng: 121.523383, name: "芝山文化生態綠園" },
    { lat: 25.045069, lng: 121.507576, name: "西門紅樓" },
    { lat: 25.050298, lng: 121.550912, name: "臺北市立圖書館總館" },
    { lat: 25.099039, lng: 121.548338, name: "草山行館" },
    { lat: 25.038002, lng: 121.509003, name: "台北市立動物園" },
    { lat: 25.040055, lng: 121.512893, name: "台北市立植物園" },
    { lat: 25.033390, lng: 121.560839, name: "台北世界貿易中心" },
    { lat: 25.024681, lng: 121.506749, name: "西門紅樓" },
    { lat: 25.052450, lng: 121.520630, name: "台北市立天文科學教育館" },
    { lat: 25.035381, lng: 121.568224, name: "台北市立美術館" },
    { lat: 25.073615, lng: 121.501687, name: "士林官邸" },
    { lat: 25.052116, lng: 121.544712, name: "松山文創園區" },
    { lat: 25.024557, lng: 121.512798, name: "台北市二二八和平公園" },
    { lat: 25.039242, lng: 121.500951, name: "台北市孔廟" }
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

    // 分割路線點
    const routeGroups = splitRouteData(routeData);

    for (let i = 0; i < routeGroups.length; i++) {
        const group = routeGroups[i];
        const origin = group[0];
        const destination = group[group.length - 1];

        const waypoints = group.slice(1, -1).map(point => ({
            location: new google.maps.LatLng(point.lat, point.lng),
            stopover: true
        }));

        const request = {
            origin: new google.maps.LatLng(origin.lat, origin.lng),
            destination: new google.maps.LatLng(destination.lat, destination.lng),
            waypoints: waypoints,
            travelMode: google.maps.TravelMode.DRIVING
            // travelMode: "TWO_WHEELER"
            
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

            // 為每個組創建一個新的 DirectionsRenderer
            const renderer = new google.maps.DirectionsRenderer({
                map: map,
                suppressMarkers: true,
                polylineOptions: {
                    strokeColor: '#4285F4',
                    strokeWeight: 5
                }
            });
            renderer.setDirections(result);

            // 添加該組的標記
            // `停靠點 ${i * 23 + index + 1}`;
            group.forEach((point, index) => {
                let markerTitle = index === 0 && i === 0 ? '起點' : 
                                  index === group.length - 1 && i === routeGroups.length - 1 ? '終點' : 
                                  ``;
                let markerColor = index === 0 && i === 0 ? 'green' : 
                                  index === group.length - 1 && i === routeGroups.length - 1 ? 'red' : 
                                  '';
                addMarker(point, markerTitle, markerColor);
            });

            // 調整地圖視圖以顯示整個路線
            if (i === 0) {
                const bounds = new google.maps.LatLngBounds();
                result.routes[0].overview_path.forEach(point => bounds.extend(point));
                map.fitBounds(bounds);
            }
        } catch (error) {
            console.error("Directions request failed due to " + error);
        }
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