// 全局變量
let map;
let markers = [];

// 頁面加載時初始化
$(document).ready(function () {
    initializeCarmap();
    initMap();

    $('#searchBtn').on('click', handleSearch);

    // 為 modal 中的關閉按鈕添加點擊事件
    $('#bumpRecordModal .btn-close, #bumpRecordModal .btn-secondary').on('click', function() {
        $('#bumpRecordModal').modal('hide');
    });

    // 當 modal 隱藏時銷毀 DataTable
    $('#bumpRecordModal').on('hidden.bs.modal', function () {
        if ($.fn.DataTable && $.fn.DataTable.isDataTable('#bumpRecordTable')) {
            $('#bumpRecordTable').DataTable().destroy();
        }
        // 移除 modal-xl
        $('#bumpRecordModal .modal-dialog').removeClass('modal-xl');
    });

    // 為 modal 中的關閉按鈕添加點擊事件
    $('#vehicleDetailsModal').on('click', '.btn-close, .btn-secondary', function() {
        $('#vehicleDetailsModal').modal('hide');
    });

    // 監聽視窗大小變化
    $(window).resize(function() {
        if ($('#bumpRecordModal').hasClass('show')) {
            const windowHeight = $(window).height();
            const modalContent = $('#bumpRecordModal .modal-content');
            const modalHeight = modalContent.height();
            
            if (modalHeight > windowHeight) {
                modalContent.css('height', '90vh');
            } else {
                modalContent.css('height', '');
            }
        }
    });

});


async function initializeCarmap() {
    try {
        await Promise.all([
            await initializeCompanyList(),
            initializeSiteList(),
            initializeBrandList(),
            initializeModelList()
        ]);

        // 設置 datetime 輸入框的默認值為當前時間
        const currentDateTime = getCurrentDateTime();
        $('#dateTime').val(currentDateTime);

        // 初始化地圖
        await initMap();

        // 檢查 localStorage 是否有搜尋參數
        const licensePlateNumber = sessionStorage.getItem('carMapSearch');
        
        if (licensePlateNumber) {
            // 清除 localStorage 中的搜尋參數
            sessionStorage.removeItem('carMapSearch');
            
            // 設置到搜索欄位中
            $('#licensePlateNumber').val(licensePlateNumber);
            
            // 執行搜索
            await loadVehicles({
                licensePlateNumber: licensePlateNumber
            });
        } else {
            // 否則執行默認搜索
            await performDefaultSearch(currentDateTime);
        }
    } catch (error) {
        console.error("Error during initialization:", error);
        showErrorNotification();
    }
}

// 初始化查詢
async function performDefaultSearch(currentDateTime) {
    const defaultSearchCriteria = {
        createTime: currentDateTime,
        createOperatorName: '',
        companyId: '',
        pickSiteId: '',
        returnSiteId: '',
        brandId: '',
        modelId: '',
        carStatus: '',
        createOperatorName: '',
        licensePlateNumber: ''
    };
    await loadVehicles(defaultSearchCriteria);
}

// 初始化地圖
async function initMap() {
    try {
        const { Map } = await google.maps.importLibrary("maps");
        // const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
        
        map = new Map(document.getElementById('map'), {
            center: { lat: 25.033964, lng: 121.564468 }, // 台北 101 的坐標
            zoom: 15, // 增加了初始縮放級別以更好地顯示台北 101 周圍區域
            mapId: "5588836", // 使用預設的地圖 ID
            fullscreenControl: false,
            mapTypeControl: false,
        });

        // 添加點擊事件監聽器
        map.addListener('click', function() {
            $('#vehicleInfo').fadeOut();
        });
    } catch (error) {
        console.error('Error initializing map:', error);
        alert('There was an error initializing the map. Please check your API key.');
    }
}

// 初始化公司列表
async function initializeCompanyList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getCompanyList";
    var source = "HBEVBACKEND";
    var chsmtoGetManualList = action + source + "HBEVCompanyBApi";
    var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/company`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm
            }
        });

        if (responseData.returnCode === "1") {
            populateCompanyDropdown(responseData.returnData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error fetching company list:", error);
        showErrorNotification();
    }
}

// 初始化站點列表
async function initializeSiteList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getSiteList";
    var source = "HBEVBACKEND";
    var chsmtoGetSiteList = action + source + "HBEVSiteBApi";
    var chsm = CryptoJS.MD5(chsmtoGetSiteList).toString().toLowerCase();

    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/site`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
            }
        });

        if (responseData.returnCode === "1") {
            populatepickupStationDropdown(responseData.returnData);
            populatereturnStationDropdown(responseData.returnData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error fetching site list:", error);
        showErrorNotification();
    }
}

// 初始化品牌列表
async function initializeBrandList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getBrandList";
    var source = "HBEVBACKEND";
    var chsmtoGetModelList = action + source + "HBEVBrandBApi";
    var chsm = CryptoJS.MD5(chsmtoGetModelList).toString().toLowerCase();

    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/brand`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
            }
        });

        if (responseData.returnCode === "1") {
            populateBrandDropdown(responseData.returnData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error fetching brand list:", error);
        showErrorNotification();
    }
}

// 初始化車型列表
async function initializeModelList() {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getModelList";
    var source = "HBEVBACKEND";
    var chsmtoGetModelList = action + source + "HBEVModelBApi";
    var chsm = CryptoJS.MD5(chsmtoGetModelList).toString().toLowerCase();

    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/model`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
            }
        });

        if (responseData.returnCode === "1") {
            populateModelDropdown(responseData.returnData);
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error fetching model list:", error);
        showErrorNotification();
    }
}

// 填充公司下拉列表
function populateCompanyDropdown(companies) {
    const companyList = document.getElementById("rentalCompany");
    companyList.innerHTML = ''; // 清空現有選項

    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇公司";
    defaultOption.value = "";
    companyList.appendChild(defaultOption);

    companies.forEach(company => {
        const option = document.createElement("option");
        option.text = company.name;
        option.value = company.id;
        companyList.appendChild(option);
    });
}

// 填充權限下拉列表
function populatepickupStationDropdown(Sites) {
    const siteList = document.getElementById("pickupStation");
    siteList.innerHTML = ''; // 清空現有選項

    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇站點";
    defaultOption.value = "";
    siteList.appendChild(defaultOption);

    Sites.forEach(site => {
        const option = document.createElement("option");
        option.text = site.name;
        option.value = site.id;
        siteList.appendChild(option);
    });
}

// 填充權限下拉列表
function populatereturnStationDropdown(positionSites) {
    const positionSiteList = document.getElementById("returnStation");
    positionSiteList.innerHTML = ''; // 清空現有選項

    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇站點";
    defaultOption.value = "";
    positionSiteList.appendChild(defaultOption);

    positionSites.forEach(positionSite => {
        const option = document.createElement("option");
        option.text = positionSite.name;
        option.value = positionSite.id;
        positionSiteList.appendChild(option);
    });
}

// 填充權限下拉列表
function populateModelDropdown(Models) {
    const modelList = document.getElementById("modelSelect");
    modelList.innerHTML = ''; // 清空現有選項

    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇車型";
    defaultOption.value = "";
    modelList.appendChild(defaultOption);

    Models.forEach(model => {
        const option = document.createElement("option");
        option.text = model.name;
        option.value = model.id;
        modelList.appendChild(option);
    });
}

// 填充權限下拉列表
function populateBrandDropdown(Brands) {
    const BrandList = document.getElementById("brandSelect");
    BrandList.innerHTML = ''; // 清空現有選項

    const defaultOption = document.createElement("option");
    defaultOption.text = "請選擇品牌";
    defaultOption.value = "";
    BrandList.appendChild(defaultOption);

    Brands.forEach(brand => {
        const option = document.createElement("option");
        option.text = brand.name;
        option.value = brand.id;
        BrandList.appendChild(option);
    });
}


// 加載車輛數據
async function loadVehicles(searchCriteria) {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    var action = "getCarMap";
    var source = "HBEVBACKEND";
    var chsmtoGetManualList = action + source + "HBEVCarBApi";
    var chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

    // 过滤掉空值的搜索条件
    const filteredCriteria = Object.entries(searchCriteria).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
            acc[key] = value;
        }
        return acc;
    }, {});

    // 准备发送到 API 的数据
    const apiData = {
        action: action,
        source: source,
        chsm: chsm
    };

    // 只有在 filteredCriteria 不为空时才添加 data 字段
    if (Object.keys(filteredCriteria).length > 0) {
        apiData.data = JSON.stringify(filteredCriteria);
    }

    try {
        const responseData = await $.ajax({
            type: "POST",
            url: `${apiURL}/car`,
            headers: { Authorization: "Bearer " + user_token },
            data: apiData
        });

        if (responseData.returnCode === "1") {
            console.log("Vehicle data:", responseData.returnData);
            // 清除現有的標記
            clearMarkers();
            // 使用返回的數據添加新的標記
            for (const vehicle of responseData.returnData) {
                await addMarker(vehicle);
            }
            // 計算所有標記的中心點
            const center = calculateCenter(markers);
            if (center) {
                map.setCenter(center);
            }
            // 如果有多個車輛，可以調整地圖視圖以顯示所有標記
            if (responseData.returnData.length > 0) {
                fitMapToMarkers();
            }
        } else {
            handleApiResponse(responseData);
        }
    } catch (error) {
        console.error("Error fetching car list:", error);
        showErrorNotification();
    }
}

// 清除地圖上的所有標記
function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

// 添加標記
async function addMarker(vehicle) {
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    // 將字符串坐標轉換為浮點數
    const lat = parseFloat(vehicle.coordinateY);
    const lng = parseFloat(vehicle.coordinateX);

    // 檢查坐標是否有效
    if (isNaN(lat) || isNaN(lng)) {
        console.error('Invalid coordinates for vehicle:', vehicle);
        return;
    }

    const position = { lat, lng };

    const marker = new AdvancedMarkerElement({
        map,
        position,
        title: vehicle.licensePlateNumber || 'Unknown',
        content: createMarkerContent(vehicle)
    });

    marker.addListener('click', () => {
        showVehicleInfo(vehicle);
    });

    markers.push(marker);
}

// calculateCenter 函數
function calculateCenter(markers) {
    if (markers.length === 0) return null;

    let totalLat = 0;
    let totalLng = 0;
    markers.forEach(marker => {
        totalLat += marker.position.lat;
        totalLng += marker.position.lng;
    });

    return {
        lat: totalLat / markers.length,
        lng: totalLng / markers.length
    };
}

// 調整地圖視圖以顯示所有標記
function fitMapToMarkers() {
    if (markers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    markers.forEach(marker => bounds.extend(marker.position));

    map.fitBounds(bounds);

    // 設置最小縮放級別
    const minZoomLevel = 17; // 你可以根據需要調整這個值
    const listener = google.maps.event.addListener(map, "idle", function() {
        if (map.getZoom() > minZoomLevel) {
            map.setZoom(minZoomLevel);
        }
        google.maps.event.removeListener(listener);
    });

    // 如果只有一個標記，手動設置縮放級別
    if (markers.length === 1) {
        const center = markers[0].position;
        map.setCenter(center);
        map.setZoom(minZoomLevel);
    }
}

// 顯示車輛信息
async function showVehicleInfo(vehicle) {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    const action = "getCarMapInfo";
    const source = "HBEVBACKEND";
    const chsmtoGetManualList = action + source + "HBEVCarBApi";
    const chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

    const carinfo = {
        carId: vehicle.carId,
        id: vehicle.id,
        type: vehicle.type
    };
    console.log(carinfo);

    try {
        const response = await $.ajax({
            type: "POST",
            url: `${apiURL}/car`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
                data: JSON.stringify(carinfo)
            }
        });

        if (response && response.returnCode === "1") {
            console.log(response.returnData);
            carinformation = response.returnData;
            displayVehicleInfo(carinformation[0],carinfo);
        } else {
            handleApiResponse(response);
        }
    } catch (error) {
        console.error("Error fetching car information:", error);
        showErrorNotification();
    }
}

function displayVehicleInfo(carinformation, carinfo) {
    const content = `
        <h3>${carinformation.licensePlateNumber}</h3>
        <button class="btn btn-primary btn-sm vehicle-info-btn" id="vehicleInfoBtn">車機詳細資訊</button>
        <br><br>
        <h6>[訂單訊息]</h6>
        <p>訂單編號: ${carinformation.orderNo}</p>
        <br>
        <p>租用人: ${carinformation.createOperatorName}</p>
        <p>出發時間: ${carinformation.orderStime}</p>
        <p>結束時間: ${carinformation.orderEtime}</p>
        <br>
        <p>取車地點: ${carinformation.pickSiteName}</p>
        <br>
        <p>還車地點: ${carinformation.returnSiteName}</p>
        <button class="btn btn-primary btn-sm bump-record-btn" id="recordBtn">撞擊、傾斜記錄</button>
    `;

    $('#vehicleInfoContent').html(content);
    $('#vehicleInfo').fadeIn();

    $('.info-close').on('click', function() {
        $('#vehicleInfo').fadeOut();
    });

    // 為車輛訊息按鈕添加點擊事件
    $("#vehicleInfoBtn").on('click', function() {
        showVehicleDetailsModal(carinformation);
    });

    // 為撞擊、傾斜記錄按鈕添加點擊事件
    $("#recordBtn").on('click', function() {
        console.log(carinfo);
        showBumpRecord(carinfo);
    });
}

function showVehicleDetailsModal(carinformation) {
    const modalContent = `
        <div class="modal-header">
            <h5 class="modal-title">${carinformation.licensePlateNumber} 的車機資訊</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <p>IMEI 車機編號 : ${carinformation.IMEI}</p>
            <p>ICCID SIM CARD : ${carinformation.ICCID}</p>
            <p>經緯度: ${carinformation.coordinateX} ${carinformation.coordinateY}</p>
            <p>機車小電電壓 (V) : ${carinformation.carVoltage}</p>
            <p>GPS 車機電池電壓 : ${carinformation.gpsBatteryVoltage}</p>
            <p>RTC 時間 : ${carinformation.RTCTime}</p>
            <p>機車大電池 SOC(%) : ${carinformation.carBigBatterySOC}</p>
            <p>機車車速 SPEED(k/ph) : ${carinformation.carSpeed}</p>
            <p>機車累積里程 : ${carinformation.carTotalMileage}</p>
            <p>機車剩餘行駛里程 : ${carinformation.carRemainingMileage}</p>
            <p>機車狀態 : ${carinformation.carStatusName}</p>
            <p>機車車架起閉狀態 : ${carinformation.carBracketStatusName}</p>
            <p>機車之坐墊起閉狀態 : ${carinformation.carSeatStatusName}</p>
            <p>機車故障警告燈狀態 : ${carinformation.carWarnLightStatusName}</p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
        </div>
    `;

    $('#vehicleDetailsModal .modal-content').html(modalContent);
    $('#vehicleDetailsModal').modal('show');

    // 為關閉按鈕添加事件監聽器
    $('#vehicleDetailsModal .btn-close, #vehicleDetailsModal .btn-secondary').on('click', function() {
        $('#vehicleDetailsModal').modal('hide');
    });
}

// 處理搜索
function handleSearch() {
    const searchCriteria = {};

    // 有值才放入搜尋條件
    function addIfNotEmpty(key, value) {
        if (value !== null && value !== undefined && value !== "") {
            searchCriteria[key] = value;
        }
    }

    addIfNotEmpty('createTime', $('#dateTime').val());
    addIfNotEmpty('companyId', $('#rentalCompany').val());
    addIfNotEmpty('pickSiteId', $('#pickupStation').val());
    addIfNotEmpty('returnSiteId', $('#returnStation').val());
    addIfNotEmpty('brandId', $('#brandSelect').val());
    addIfNotEmpty('modelId', $('#modelSelect').val());
    addIfNotEmpty('carStatus', $('#carStatusSelect').val());
    addIfNotEmpty('createOperatorName', $('#createOperatorName').val());
    addIfNotEmpty('licensePlateNumber', $('#licensePlateNumber').val());

    console.log('搜索條件:', searchCriteria);
    loadVehicles(searchCriteria);
}

async function showBumpRecord(carinfo) {
    const jsonStringFromLocalStorage = localStorage.getItem("userData");
    const getUserData = JSON.parse(jsonStringFromLocalStorage);
    const user_token = getUserData.token;

    const action = "getCarMapDetail";
    const source = "HBEVBACKEND";
    const chsmtoGetManualList = action + source + "HBEVCarBApi";
    const chsm = CryptoJS.MD5(chsmtoGetManualList).toString().toLowerCase();

    try {
        const response = await $.ajax({
            type: "POST",
            url: `${apiURL}/car`,
            headers: { Authorization: "Bearer " + user_token },
            data: {
                action: action,
                source: source,
                chsm: chsm,
                data: JSON.stringify(carinfo)
            }
        });

        if (response && response.returnCode === "1") {
            console.log(response.returnData);
            displayBumpRecord(response.returnData);
        } else {
            handleApiResponse(response);
        }
    } catch (error) {
        console.error("Error fetching car bump record:", error);
        showErrorNotification();
    }
}

function displayBumpRecord(bumpData) {
    const tableHtml = `
        <div class="table-responsive">
            <table id="bumpRecordTable" class="display table table-striped table-bordered" style="width:100%">
                <thead>
                    <tr>
                        <th>經緯度</th>
                        <th>機車狀態</th>
                        <th>車速 (km/h)</th>
                        <th>電池 SOC (%)</th>
                        <th>異常代號</th>
                        <th>接收時間</th>
                    </tr>
                </thead>
            </table>
        </div>
    `;

    $('#bumpRecordContent').html(tableHtml);

    if ($.fn.DataTable) {
        $('#bumpRecordTable').DataTable({
            // data: Array.isArray(bumpData) ? bumpData : [bumpData],
            data : bumpData,
            columns: [
                { data: null, render: function(data, type, row) {
                    return `${row.coordinateX || 'N/A'} ${row.coordinateY || 'N/A'}`;
                }},
                // { data: 'carStatusName', render: function(data, type, row) {
                //     return getCarStatusText(data) || 'N/A';
                // }},
                { data: 'carStatusName' },
                { data: 'carSpeed' },
                { data: 'carBigBatterySOC' },
                { data: 'messageName' },
                { data: 'RTCTime' }
            ],
            language: {
                "url": "https://cdn.datatables.net/plug-ins/1.10.24/i18n/Chinese-traditional.json"
            },
            responsive: true,
            scrollX: true,
            autoWidth: false,
            columnDefs: [
                { width: '20%', targets: 0 },
                { width: '15%', targets: 1 },
                { width: '15%', targets: 2 },
                { width: '15%', targets: 3 },
                { width: '15%', targets: 4 },
                { width: '20%', targets: 5 }
            ],
            order: [[5, 'desc']],
            pageLength: 10,
            lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "全部"]],
            dom: "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
                 "<'row'<'col-sm-12'tr>>" +
                 "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        });
    } else {
        console.error('DataTables is not loaded. Falling back to basic table display.');
        // 基本表格顯示的後備方案（保持不變）
    }

    // 調整 modal 大小和位置
    $('#bumpRecordModal .modal-dialog').addClass('modal-xl');
    $('#bumpRecordModal').modal('show');

    // 在 modal 顯示後重新調整 DataTable 和 modal 位置
    $('#bumpRecordModal').on('shown.bs.modal', function () {
        $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
        
        // 動態調整 modal 位置
        const windowHeight = $(window).height();
        const modalContent = $('#bumpRecordModal .modal-content');
        const modalHeight = modalContent.height();
        
        if (modalHeight > windowHeight) {
            modalContent.css('height', '90vh');
        } else {
            modalContent.css('height', '');
        }
    });
}

function getCarStatusText(status) {
    switch(status) {
        case '0': return 'OFF';
        case '1': return 'BG CG ACC (Low Line)';
        case '2': return 'SB CG IG (Low Line)';
        case '3': return 'IG (防暴衝模式)';
        case '4': return 'RIDE (騎乘模式)';
        case '5': return 'Emergency Shut Down';
        case '6': return 'T.B.D';
        case '7': return 'Invalid';
        default: return '未知';
    }
}


function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// 創建標記內容
function createMarkerContent(vehicle) {
    const container = document.createElement('div');
    container.className = 'default-marker';
    container.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="34" height="34">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#FF0000"/>
        </svg>
    `;
    return container;
}

// // 根據車輛狀態獲取顏色（留存）
// function getColorForVehicle(vehicle) {
//     // 這裡可以根據車輛的狀態或其他屬性來決定顏色
//     // 例如：
//     switch(vehicle.mode) {
//         case 'OFF': return 'gray';
//         case 'ACC': return 'blue';
//         case 'IG': return 'green';
//         case 'ACC+IG': return 'yellow';
//         case 'RIDE': return 'red';
//         case '緊急中斷': return 'purple';
//         default: return 'black';
//     }
// }

// function getCarBracketStatusText(status) {
//     switch(status) {
//         case '0': return '下側腳架';
//         case '1': return '收側腳架';
//         default: return '未知';
//     }
// }

// function getCarSeatStatusText(status) {
//     switch(status) {
//         case '0': return '坐墊關閉';
//         case '1': return '坐墊開啟';
//         default: return '未知';
//     }
// }

// function getCarWarnLightStatusText(status) {
//     switch(status) {
//         case '0': return 'OFF';
//         case '1': return 'Amber';
//         case '2': return 'Red';
//         case '3': return 'T.B.D';
//         default: return '未知';
//     }
// }