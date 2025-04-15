// 全局變量
let map;
let directionsService;
let directionsRenderer;
let markers = [];
let RoutePointsOverlay;

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

async function loadGoogleMapsLibraries() {
    try {
        await google.maps.importLibrary("maps");
        await google.maps.importLibrary("routes");
        await google.maps.importLibrary("core");

        return {
            Map: google.maps.Map,
            DirectionsService: google.maps.DirectionsService,
            DirectionsRenderer: google.maps.DirectionsRenderer,
            OverlayView: google.maps.OverlayView
        };
    } catch (error) {
        console.error("Error loading Google Maps libraries:", error);
        throw error;
    }
}

// 初始化函數
async function initMap() {
    try {
        const {
            Map,
            DirectionsService,
            DirectionsRenderer,
            OverlayView
        } = await loadGoogleMapsLibraries();

        console.log("Libraries loaded, OverlayView:", OverlayView);

        // Create map
        map = new Map(document.getElementById('map'), {
            center: { lat: 25.033964, lng: 121.564468 }, // Taipei city center
            mapId: "5588836", // 使用預設的地圖 ID
            zoom: 12
        });

        // Initialize DirectionsService and DirectionsRenderer
        directionsService = new DirectionsService();
        directionsRenderer = new DirectionsRenderer({
            map: map,
            suppressMarkers: true,
            polylineOptions: {
                strokeColor: '#4285F4',
                strokeWeight: 5
            }
        });

        // Define RoutePointsOverlay class
        if (OverlayView) {
            RoutePointsOverlay = class extends OverlayView {
                constructor(points) {
                    super();
                    this.points = points;
                }

                onAdd() {
                    this.div = document.createElement('div');
                    this.div.style.position = 'absolute';
                }

                draw() {
                    const overlayProjection = this.getProjection();
                    const div = this.div;
                    div.innerHTML = '';

                    this.points.forEach(point => {
                        const pos = overlayProjection.fromLatLngToDivPixel(new google.maps.LatLng(point.lat, point.lng));
                        const dot = document.createElement('div');
                        dot.style.position = 'absolute';
                        dot.style.left = `${pos.x}px`;
                        dot.style.top = `${pos.y}px`;
                        dot.style.width = '4px';
                        dot.style.height = '4px';
                        dot.style.borderRadius = '50%';
                        dot.style.backgroundColor = 'blue';
                        div.appendChild(dot);
                    });
                }

                onRemove() {
                    if (this.div) {
                        this.div.parentNode.removeChild(this.div);
                        delete this.div;
                    }
                }
            };
            console.log("RoutePointsOverlay class defined successfully");
        } else {
            console.error("OverlayView is not defined");
        }

        // Add button click event listener
        document.getElementById('viewMapButton').addEventListener('click', handleViewMapClick);

        console.log("Map initialized successfully");
    } catch (error) {
        console.error("Error initializing map:", error);
    }
}

// 處理查看地圖按鈕點擊
async function handleViewMapClick() {
    showLoading();
    try {
        const routeData = await fetchRouteData();
        await drawOptimizedRouteOnMap(routeData);
        // await drawOptimizedRouteOnMap(testRouteData);
    } catch (error) {
        console.error("Error handling map view:", error);
        showErrorNotification("無法加載路線數據。");
    } finally {
        hideLoading();
    }
}

// 獲取路線數據
async function fetchRouteData() {

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
        const response = await $.ajax({
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

        if (response.returnCode === "1") {
            return convertRouteData(response.returnData);
        } else {
            throw new Error("API returned an error");
        }
    } catch (error) {
        console.error("Error fetching car route:", error);
        throw error;
    }
}

// 轉換路線數據格式
function convertRouteData(apiRouteData) {
    return apiRouteData.map(point => ({
        lat: parseFloat(point.coordinateY),
        lng: parseFloat(point.coordinateX),
        timestamp: point.RTCTime
    }));
}

// 數據抽樣函數，確保拿到起點終點
function sampleRouteData(data, maxPoints = 300) {
    if (data.length <= maxPoints) return data;
    
    const result = [data[0]]; // 總是包含第一個點
    const step = (data.length - 1) / (maxPoints - 2); // 調整步長以容納起點和終點
    
    for (let i = 1; i < maxPoints - 1; i++) {
        const index = Math.floor(i * step);
        result.push(data[index]);
    }
    
    result.push(data[data.length - 1]); // 總是包含最後一個點
    return result;
}

// 優化後的路線繪製函數
async function drawOptimizedRouteOnMap(routeData) {
    if (routeData.length < 2) {
        console.error("At least two points are required to draw a route");
        return;
    }

    // Clear previous markers and overlays
    clearMarkers();
    if (window.routePointsOverlay) {
        window.routePointsOverlay.setMap(null);
    }

    // Sample data
    const sampledData = sampleRouteData(routeData);

    // Split route points
    const routeGroups = splitRouteData(sampledData, 25);

    // Create a single polyline for the entire route
    const path = new google.maps.MVCArray();
    const polyline = new google.maps.Polyline({
        path: path,
        strokeColor: '#4285F4',
        strokeWeight: 5,
        map: map
    });

    const drawGroup = async (group, index) => {
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
            travelMode: google.maps.TravelMode.TWO_WHEELER,
            avoidHighways: true
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

            // Add the route points to the polyline
            const routePath = result.routes[0].overview_path;
            routePath.forEach(point => path.push(point));

            // Add markers only for start and end points
            if (index === 0) {
                addMarker(origin, 'start', '起點');
            }
            if (index === routeGroups.length - 1) {
                addMarker(destination, 'end', '終點');
            }

            // Adjust map view (only for the first group)
            if (index === 0) {
                const bounds = new google.maps.LatLngBounds();
                result.routes[0].overview_path.forEach(point => bounds.extend(point));
                map.fitBounds(bounds);
            }
        } catch (error) {
            console.error("Directions request failed due to " + error);
        }
    };

    // Process route groups in batches
    for (let i = 0; i < routeGroups.length; i++) {
        await new Promise(resolve => {
            requestAnimationFrame(async () => {
                await drawGroup(routeGroups[i], i);
                resolve();
            });
        });
    }
}

// 分割路線數據
function splitRouteData(routeData, maxWaypoints = 23) {
    const groups = [];
    for (let i = 0; i < routeData.length; i += maxWaypoints) {
        groups.push(routeData.slice(i, Math.min(i + maxWaypoints, routeData.length)));
    }
    return groups;
}

// 添加標記
async function addMarker(position, type, label) {
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    
    const marker = new AdvancedMarkerElement({
        position: position,
        map: map,
        content: buildMarkerContent(type, label)
    });
    markers.push(marker);
}

// 構建標記內容
function buildMarkerContent(type, label) {
    const content = document.createElement('div');
    content.classList.add('custom-marker');

    if (type === 'start' || type === 'end') {
        content.style.padding = '5px 10px';
        content.style.borderRadius = '4px';
        content.style.color = 'white';
        content.style.fontWeight = 'bold';
        content.style.fontSize = '14px';
        content.textContent = label;

        if (type === 'start') {
            content.style.backgroundColor = 'green';
        } else {
            content.style.backgroundColor = 'red';
        }
    } else {
        content.style.width = '10px';
        content.style.height = '10px';
        content.style.borderRadius = '50%';
        content.style.backgroundColor = 'blue';
    }

    return content;
}

// 清除所有標記
function clearMarkers() {
    markers.forEach(marker => marker.map = null);
    markers = [];
}

// 顯示 loading 狀態
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'map-loading';
    loadingDiv.style.position = 'absolute';
    loadingDiv.style.top = '50%';
    loadingDiv.style.left = '50%';
    loadingDiv.style.transform = 'translate(-50%, -50%)';
    loadingDiv.style.padding = '20px';
    loadingDiv.style.background = 'rgba(255, 255, 255, 0.8)';
    loadingDiv.style.borderRadius = '10px';
    loadingDiv.style.zIndex = '1000';
    loadingDiv.innerHTML = '正在加載路線...';
    
    document.getElementById('map').appendChild(loadingDiv);
}

// 隱藏 loading 狀態
function hideLoading() {
    const loadingDiv = document.getElementById('map-loading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// 顯示錯誤通知
function showErrorNotification(message) {
    // 實現錯誤通知的邏輯，可以使用 alert 或自定義的通知組件
    alert(message);
}

// 模態框相關邏輯
document.getElementById("viewMapButton").addEventListener("click", function() {
    initMap();
    $('#mapModal').modal('show');
    
    
    // 確保地圖在模態框顯示後初始化
    $('#mapModal').on('shown.bs.modal', function () {
        if (!map) {
            initMap();
        } else {
            google.maps.event.trigger(map, 'resize');
            // 重新加載數據並繪製路線
            handleViewMapClick();
        }
    });
});

// 當 DOM 加載完成後初始化地圖
// document.addEventListener('DOMContentLoaded', initMap);
