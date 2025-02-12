$(document).ready(function () {
	setTimeout(function() {
		handlePageUpdatePermissions(currentUser, currentUrl);
	  }, 100); // Adjust the delay as needed
});

// 表格初始化
$(document).ready(function () {
	// Data1
	var columnsData1 = [
		{ data: "empty", title: "#" },
		{ data: "read", title: "查看詳情" },
		{ data: "insert", title: "新增" },
		{ data: "update", title: "修改" },
		{ data: "delete", title: "刪除" },
	];

	var columns1 = [];

	columnsData1.forEach(function (column) {
		columns1.push({ data: column.data, title: column.title });
	});

	var table1Data = [
		{
			empty: "帳號管理",
			id: 1,
			read: '<input type="checkbox" name="rowCheckbox" data-id="1" data-column="read" />',
			insert: '<span></span>',
			update: '<span></span>',
			delete: '<span></span>',
			// insert: '<input type="checkbox" name="rowCheckbox" data-id="1" data-column="insert" />',
			// update: '<input type="checkbox" name="rowCheckbox" data-id="1" data-column="update" />',
			// delete: '<input type="checkbox" name="rowCheckbox" data-id="1" data-column="delete" />',
		},
		{
			empty: "帳號列表",
			id: 2,
			read: '<input type="checkbox" name="rowCheckbox" data-id="2" data-column="read"/>',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="2" data-column="insert"/>',
			update: '<input type="checkbox" name="rowCheckbox" data-id="2" data-column="update"/>',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="2" data-column="delete" disabled/>',
		},
		{
			empty: "帳號資料",
			id: 3,
			read: '<input type="checkbox" name="rowCheckbox" data-id="3" data-column="read"/>',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="3" data-column="insert"/>',
			update: '<input type="checkbox" name="rowCheckbox" data-id="3" data-column="update"/>',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="3" data-column="delete" disabled/>',
		},
		{
			empty: "角色列表",
			id: 4,
			read: '<input type="checkbox" name="rowCheckbox" data-id="4" data-column="read"/>',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="4" data-column="insert"/>',
			update: '<input type="checkbox" name="rowCheckbox" data-id="4" data-column="update"/>',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="4" data-column="delete" disabled/>',
		},
		{
			empty: "角色權限",
			id: 5,
			read: '<input type="checkbox" name="rowCheckbox" data-id="5" data-column="read"/>',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="5" data-column="insert"/>',
			update: '<input type="checkbox" name="rowCheckbox" data-id="5" data-column="update"/>',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="5" data-column="delete" disabled/>',
		},
	];

	var table1DataArray = Object.values(table1Data);
	table1DataArray.forEach(function (row) {
		row.id = parseInt(row.id);
	});

	table1DataArray.sort(function (a, b) {
		return a.id - b.id;
	});
	
	//Data2
	var columnsData2 = [
		{ data: "empty", title: "#" },
		{ data: "read", title: "查看詳情" },
		{ data: "insert", title: "新增" },
		{ data: "update", title: "修改" },
		{ data: "delete", title: "刪除" },
	];

	var columns2 = [];

	columnsData2.forEach(function (column) {
		columns2.push({ data: column.data, title: column.title });
	});

	var table2Data = [
		{
			empty: "站點管理",
			id: 6,
			read: '<input type="checkbox" name="rowCheckbox" data-id="6" data-column="read" />',
			insert: '<span></span>',
			update: '<span></span>',
			delete: '<span></span>',
			// insert: '<input type="checkbox" name="rowCheckbox" data-id="6" data-column="insert" />',
			// update: '<input type="checkbox" name="rowCheckbox" data-id="6" data-column="update" />',
			// delete: '<input type="checkbox" name="rowCheckbox" data-id="6" data-column="delete" />',
		},
		{
			empty: "公司列表",
			id: 7,
			read: '<input type="checkbox" name="rowCheckbox" data-id="7" data-column="read"/>',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="7" data-column="insert"/>',
			update: '<input type="checkbox" name="rowCheckbox" data-id="7" data-column="update"/>',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="7" data-column="delete" disabled/>',
		},
		{
			empty: "公司資料",
			id: 8,
			read: '<input type="checkbox" name="rowCheckbox" data-id="8" data-column="read"/>',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="8" data-column="insert"/>',
			update: '<input type="checkbox" name="rowCheckbox" data-id="8" data-column="update"/>',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="8" data-column="delete" disabled/>',
		},
		{
			empty: "站點列表",
			id: 9,
			read: '<input type="checkbox" name="rowCheckbox" data-id="9" data-column="read"/>',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="9" data-column="insert"/>',
			update: '<input type="checkbox" name="rowCheckbox" data-id="9" data-column="update"/>',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="9" data-column="delete" disabled/>',
		},
		{
			empty: "站點資料",
			id: 10,
			read: '<input type="checkbox" name="rowCheckbox" data-id="10" data-column="read"/>',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="10" data-column="insert"/>',
			update: '<input type="checkbox" name="rowCheckbox" data-id="10" data-column="update"/>',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="10" data-column="delete" disabled/>',
		},
	];

	var table2DataArray = Object.values(table2Data);
	table2DataArray.forEach(function (row) {
		row.id = parseInt(row.id);
	});

	table2DataArray.sort(function (a, b) {
		return a.id - b.id;
	});

	//Data3
	var columnsData3 = [
		{ data: "empty", title: "#" },
		{ data: "read", title: "查看詳情" },
		{ data: "insert", title: "新增" },
		{ data: "update", title: "修改" },
		{ data: "delete", title: "刪除" },
	];

	var columns3 = [];

	columnsData3.forEach(function (column) {
		columns3.push({ data: column.data, title: column.title });
	});

	var table3Data = [
		{
			empty: "費率管理",
			id:11,
			read: '<input type="checkbox" name="rowCheckbox" data-id="11" data-column="read"  />',
			insert: '<span></span>',
			update: '<span></span>',
			delete: '<span></span>',
			// insert: '<input type="checkbox" name="rowCheckbox" data-id="11" data-column="insert" />',
			// update: '<input type="checkbox" name="rowCheckbox" data-id="11" data-column="update" />',
			// delete: '<input type="checkbox" name="rowCheckbox" data-id="11" data-column="delete" />',
		},
		{
			empty: "假日列表",
			id: 12,
			read: '<input type="checkbox" name="rowCheckbox" data-id="12" data-column="read" />',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="12" data-column="insert" />',
			update: '<input type="checkbox" name="rowCheckbox" data-id="12" data-column="update" />',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="12" data-column="delete" disabled/>',
		},
		{
			empty: "假日資料",
			id: 13,
			read: '<input type="checkbox" name="rowCheckbox" data-id="13" data-column="read" />',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="13" data-column="insert" />',
			update: '<input type="checkbox" name="rowCheckbox" data-id="13" data-column="update" />',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="13" data-column="delete" disabled/>',
		},
		{
			empty: "費率設定列表",
			id: 17,
			read: '<input type="checkbox" name="rowCheckbox" data-id="17" data-column="read" />',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="17" data-column="insert" />',
			update: '<input type="checkbox" name="rowCheckbox" data-id="17" data-column="update" />',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="17" data-column="delete" disabled/>',
		},
		{
			empty: "費率設定資料",
			id: 18,
			read: '<input type="checkbox" name="rowCheckbox" data-id="18" data-column="read" />',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="18" data-column="insert" />',
			update: '<input type="checkbox" name="rowCheckbox" data-id="18" data-column="update" />',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="18" data-column="delete" disabled/>',
		},
		{
			empty: "費率歷史紀錄",
			id: 19,
			read: '<input type="checkbox" name="rowCheckbox" data-id="19" data-column="read" />',
			insert: '<span></span>',
			update: '<span></span>',
			delete: '<span></span>',
			// insert: '<input type="checkbox" name="rowCheckbox" data-id="16" data-column="insert" />',
			// update: '<input type="checkbox" name="rowCheckbox" data-id="16" data-column="update" />',
			// delete: '<input type="checkbox" name="rowCheckbox" data-id="16" data-column="delete" disabled/>',
		},
	];

	var table3DataArray = Object.values(table3Data);
	table3DataArray.forEach(function (row) {
		row.id = parseInt(row.id);
	});

	table3DataArray.sort(function (a, b) {
		return a.id - b.id;
	});

	//Data4
	var columnsData4 = [
		{ data: "empty", title: "#" },
		{ data: "read", title: "查看詳情" },
		{ data: "insert", title: "新增" },
		{ data: "update", title: "修改" },
		{ data: "delete", title: "刪除" },
		{ data: "powerOn", title: "解鎖" },
		{ data: "powerOff", title: "上鎖" },
		{ data: "orderDetail", title: "前往訂單" },
		{ data: "carMap", title: "前往地圖" },
	];

	var columns4 = [];

	columnsData4.forEach(function (column) {
		columns4.push({ data: column.data, title: column.title });
	});

	var table4Data = [
		{
			empty: "車輛管理",
			id:14,
			read: '<input type="checkbox" name="rowCheckbox" data-id="14" data-column="read"  />',
			insert: '<span></span>',
			update: '<span></span>',
			delete: '<span></span>',
			// insert: '<input type="checkbox" name="rowCheckbox" data-id="14" data-column="insert" />',
			// update: '<input type="checkbox" name="rowCheckbox" data-id="14" data-column="update" />',
			// delete: '<input type="checkbox" name="rowCheckbox" data-id="14" data-column="delete" disabled/>',
			powerOn: '<span></span>',
			powerOff: '<span></span>',
			orderDetail: '<span></span>',
			carMap: '<span></span>',
		},
		{
			empty: "品牌定義列表",
			id: 15,
			read: '<input type="checkbox" name="rowCheckbox" data-id="15" data-column="read" />',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="15" data-column="insert" />',
			update: '<input type="checkbox" name="rowCheckbox" data-id="15" data-column="update" />',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="15" data-column="delete" disabled/>',
			powerOn: '<span></span>',
			powerOff: '<span></span>',
			orderDetail: '<span></span>',
			carMap: '<span></span>',
		},
		{
			empty: "品牌定義資料",
			id: 16,
			read: '<input type="checkbox" name="rowCheckbox" data-id="16" data-column="read" />',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="16" data-column="insert" />',
			update: '<input type="checkbox" name="rowCheckbox" data-id="16" data-column="update" />',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="16" data-column="delete" disabled/>',
			powerOn: '<span></span>',
			powerOff: '<span></span>',
			orderDetail: '<span></span>',
			carMap: '<span></span>',
		},
		{
			empty: "車型定義列表",
			id: 23,
			read: '<input type="checkbox" name="rowCheckbox" data-id="23" data-column="read" />',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="23" data-column="insert" />',
			update: '<input type="checkbox" name="rowCheckbox" data-id="23" data-column="update" />',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="23" data-column="delete" disabled/>',
			powerOn: '<span></span>',
			powerOff: '<span></span>',
			orderDetail: '<span></span>',
			carMap: '<span></span>',
		},
		{
			empty: "車型定義資料",
			id: 24,
			read: '<input type="checkbox" name="rowCheckbox" data-id="24" data-column="read" />',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="24" data-column="insert" />',
			update: '<input type="checkbox" name="rowCheckbox" data-id="24" data-column="update" />',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="24" data-column="delete" disabled/>',
			powerOn: '<span></span>',
			powerOff: '<span></span>',
			orderDetail: '<span></span>',
			carMap: '<span></span>',
		},
		{
			empty: "車籍定義列表",
			id: 30,
			read: '<input type="checkbox" name="rowCheckbox" data-id="30" data-column="read" />',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="30" data-column="insert" />',
			update: '<input type="checkbox" name="rowCheckbox" data-id="30" data-column="update" />',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="30" data-column="delete" disabled/>',
			powerOn: '<span></span>',
			powerOff: '<span></span>',
			orderDetail: '<span></span>',
			carMap: '<span></span>',
		},
		{
			empty: "車籍定義資料",
			id: 31,
			read: '<input type="checkbox" name="rowCheckbox" data-id="31" data-column="read" />',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="31" data-column="insert" />',
			update: '<input type="checkbox" name="rowCheckbox" data-id="31" data-column="update" />',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="31" data-column="delete" disabled/>',
			powerOn: '<span></span>',
			powerOff: '<span></span>',
			orderDetail: '<span></span>',
			carMap: '<span></span>',
		},
		{
			empty: "電動車地圖",
			id: 32,
			read: '<input type="checkbox" name="rowCheckbox" data-id="32" data-column="read" />',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="32" data-column="insert" />',
			update: '<input type="checkbox" name="rowCheckbox" data-id="32" data-column="update" />',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="32" data-column="delete" disabled/>',
			powerOn: '<span></span>',
			powerOff: '<span></span>',
			orderDetail: '<span></span>',
			carMap: '<span></span>',
		},
		{
			empty: "電動車車輛監控",
			id: 38,
			read: '<input type="checkbox" name="rowCheckbox" data-id="38" data-column="read" />',
			insert: '<span></span>',
			update: '<span></span>',
			delete: '<span></span>',
			powerOn: '<input type="checkbox" name="rowCheckbox" data-id="38" data-column="powerOn" />',
			powerOff: '<input type="checkbox" name="rowCheckbox" data-id="38" data-column="powerOff" />',
			orderDetail: '<input type="checkbox" name="rowCheckbox" data-id="38" data-column="orderDetail" />',
			carMap: '<input type="checkbox" name="rowCheckbox" data-id="38" data-column="carMap" />',
		}
	];
	var table4DataArray = Object.values(table4Data);
	table4DataArray.forEach(function (row) {
		row.id = parseInt(row.id);
	});

	table4DataArray.sort(function (a, b) {
		return a.id - b.id;
	});

	//Data5
	var columnsData5 = [
		{ data: "empty", title: "#" },
		{ data: "read", title: "查看詳情" },
		{ data: "insert", title: "新增" },
		{ data: "update", title: "修改" },
		{ data: "delete", title: "刪除" },
	];

	var columns5 = [];

	columnsData5.forEach(function (column) {
		columns5.push({ data: column.data, title: column.title });
	});

	var table5Data = [
		{
			empty: "訊息管理",
			id:20,
			read: '<input type="checkbox" name="rowCheckbox" data-id="20" data-column="read"  />',
			insert: '<span></span>',
			update: '<span></span>',
			delete: '<span></span>',
			// insert: '<input type="checkbox" name="rowCheckbox" data-id="20" data-column="insert" />',
			// update: '<input type="checkbox" name="rowCheckbox" data-id="20" data-column="update" />',
			// delete: '<input type="checkbox" name="rowCheckbox" data-id="20" data-column="delete" disabled/>',
		},
		{
			empty: "訊息列表",
			id: 21,
			read: '<input type="checkbox" name="rowCheckbox" data-id="21" data-column="read" />',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="21" data-column="insert" />',
			update: '<input type="checkbox" name="rowCheckbox" data-id="21" data-column="update" />',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="21" data-column="delete" disabled/>',
		},
		{
			empty: "訊息資料",
			id: 22,
			read: '<input type="checkbox" name="rowCheckbox" data-id="22" data-column="read" />',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="22" data-column="insert" />',
			update: '<input type="checkbox" name="rowCheckbox" data-id="22" data-column="update" />',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="22" data-column="delete" disabled/>',
		},
	];

	var table5DataArray = Object.values(table5Data);
	table5DataArray.forEach(function (row) {
		row.id = parseInt(row.id);
	});

	table5DataArray.sort(function (a, b) {
		return a.id - b.id;
	});

	//Data6
	var columnsData6 = [
		{ data: "empty", title: "#" },
		{ data: "read", title: "查看詳情" },
		{ data: "insert", title: "新增" },
		{ data: "update", title: "修改" },
		{ data: "delete", title: "刪除" },
	];

	var columns6 = [];

	columnsData6.forEach(function (column) {
		columns6.push({ data: column.data, title: column.title });
	});

	var table6Data = [
		{
			empty: "會員管理",
			id:25,
			read: '<input type="checkbox" name="rowCheckbox" data-id="25" data-column="read"  />',
			insert: '<span></span>',
			update: '<span></span>',
			delete: '<span></span>',
			// insert: '<input type="checkbox" name="rowCheckbox" data-id="25" data-column="insert" />',
			// update: '<input type="checkbox" name="rowCheckbox" data-id="25" data-column="update" />',
			// delete: '<input type="checkbox" name="rowCheckbox" data-id="25" data-column="delete" disabled/>',
		},
		{
			empty: "會員列表",
			id: 26,
			read: '<input type="checkbox" name="rowCheckbox" data-id="26" data-column="read" />',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="26" data-column="insert" />',
			update: '<input type="checkbox" name="rowCheckbox" data-id="26" data-column="update" />',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="26" data-column="delete" disabled/>',
		},
		{
			empty: "會員資料",
			id: 27,
			read: '<input type="checkbox" name="rowCheckbox" data-id="27" data-column="read" />',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="27" data-column="insert" />',
			update: '<input type="checkbox" name="rowCheckbox" data-id="27" data-column="update" />',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="27" data-column="delete" disabled/>',
		},
		{
			empty: "會員審核列表",
			id: 28,
			read: '<input type="checkbox" name="rowCheckbox" data-id="28" data-column="read" />',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="28" data-column="insert" />',
			update: '<input type="checkbox" name="rowCheckbox" data-id="28" data-column="update" />',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="28" data-column="delete" disabled/>',
		},
		{
			empty: "會員審核資料",
			id: 29,
			read: '<input type="checkbox" name="rowCheckbox" data-id="29" data-column="read" />',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="29" data-column="insert" />',
			update: '<input type="checkbox" name="rowCheckbox" data-id="29" data-column="update" />',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="29" data-column="delete" disabled/>',
		},
	];

	var table6DataArray = Object.values(table6Data);
	table6DataArray.forEach(function (row) {
		row.id = parseInt(row.id);
	});

	table6DataArray.sort(function (a, b) {
		return a.id - b.id;
	});

	//Data7
	var columnsData7 = [
		{ data: "empty", title: "#" },
		{ data: "read", title: "查看詳情" },
		{ data: "insert", title: "新增" },
		{ data: "update", title: "修改" },
		{ data: "delete", title: "刪除" },
	];

	var columns7 = [];

	columnsData7.forEach(function (column) {
		columns7.push({ data: column.data, title: column.title });
	});

	var table7Data = [
		{
			empty: "優惠管理",
			id:33,
			read: '<input type="checkbox" name="rowCheckbox" data-id="33" data-column="read"  />',
			insert: '<span></span>',
			update: '<span></span>',
			delete: '<span></span>',
			// insert: '<input type="checkbox" name="rowCheckbox" data-id="33" data-column="insert" />',
			// update: '<input type="checkbox" name="rowCheckbox" data-id="33" data-column="update" />',
			// delete: '<input type="checkbox" name="rowCheckbox" data-id="33" data-column="delete" disabled/>',
		},
		{
			empty: "優惠列表",
			id: 34,
			read: '<input type="checkbox" name="rowCheckbox" data-id="34" data-column="read" />',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="34" data-column="insert" />',
			update: '<input type="checkbox" name="rowCheckbox" data-id="34" data-column="update" />',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="34" data-column="delete" disabled/>',
		},
	];

	var table7DataArray = Object.values(table7Data);
	table7DataArray.forEach(function (row) {
		row.id = parseInt(row.id);
	});

	table7DataArray.sort(function (a, b) {
		return a.id - b.id;
	});

	//Data8
	var columnsData8 = [
		{ data: "empty", title: "#" },
		{ data: "read", title: "查看詳情" },
		{ data: "insert", title: "新增" },
		{ data: "update", title: "修改" },
		{ data: "delete", title: "刪除" },
		{ data: "orderCancel", title: "取消訂單" },
		{ data: "powerOff", title: "中斷電源" },
	];

	var columns8 = [];

	columnsData8.forEach(function (column) {
		columns8.push({ data: column.data, title: column.title });
	});

	var table8Data = [
		{
			empty: "訂單管理",
			id:35,
			read: '<input type="checkbox" name="rowCheckbox" data-id="35" data-column="read" >',
			insert: '<span></span>',
			update: '<span></span>',
			delete: '<span></span>',
			orderCancel: '<span></span>',
			powerOff: '<span></span>',
			// insert: '<input type="checkbox" name="rowCheckbox" data-id="35" data-column="insert" />',
			// update: '<input type="checkbox" name="rowCheckbox" data-id="35" data-column="update" />',
			// delete: '<input type="checkbox" name="rowCheckbox" data-id="35" data-column="delete" disabled/>',
		},
		{
			empty: "訂單列表",
			id: 36,
			read: '<input type="checkbox" name="rowCheckbox" data-id="36" data-column="read" >',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="36" data-column="insert" >',
			update: '<input type="checkbox" name="rowCheckbox" data-id="36" data-column="update" >',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="36" data-column="delete" disabled/>',
			orderCancel: '<span></span>',
			powerOff: '<span></span>',
		},
		{
			empty: "訂單資料",
			id: 37,
			read: '<input type="checkbox" name="rowCheckbox" data-id="37" data-column="read" />',
			insert: '<input type="checkbox" name="rowCheckbox" data-id="37" data-column="insert" />',
			update: '<input type="checkbox" name="rowCheckbox" data-id="37" data-column="update" />',
			delete: '<input type="checkbox" name="rowCheckbox" data-id="37" data-column="delete" disabled/>',
			orderCancel: '<input type="checkbox" name="rowCheckbox" data-id="37" data-column="orderCancel"/>',
			powerOff: '<input type="checkbox" name="rowCheckbox" data-id="37" data-column="powerOff"/>',
		},
	];

	var table8DataArray = Object.values(table8Data);
	table8DataArray.forEach(function (row) {
		row.id = parseInt(row.id);
	});

	table8DataArray.sort(function (a, b) {
		return a.id - b.id;
	});

	//Data9
	var columnsData9 = [
		{ data: "empty", title: "#" },
		{ data: "read", title: "查看詳情" },
		{ data: "insert", title: "新增" },
		{ data: "update", title: "修改" },
		{ data: "delete", title: "刪除" },
	];

	var columns9 = [];

	columnsData9.forEach(function (column) {
		columns9.push({ data: column.data, title: column.title });
	});

	var table9Data = [
		{
			empty: "報表管理",
			id: 39,
			read: '<input type="checkbox" name="rowCheckbox" data-id="39" data-column="read"/>',
			insert: '<span></span>',
			update: '<span></span>',
			delete: '<span></span>',
			// insert: '<input type="checkbox" name="rowCheckbox" data-id="39" data-column="insert" />',
			// update: '<input type="checkbox" name="rowCheckbox" data-id="39" data-column="update" />',
			// delete: '<input type="checkbox" name="rowCheckbox" data-id="39" data-column="delete" disabled/>',
		},
		{
			empty: "訂單報表",
			id: 40,
			read: '<input type="checkbox" name="rowCheckbox" data-id="40" data-column="read"/>',
			insert: '<span></span>',
			update: '<span></span>',
			delete: '<span></span>',
		},
	];

	var table9DataArray = Object.values(table9Data);
	table9DataArray.forEach(function (row) {
		row.id = parseInt(row.id);
	});

	table9DataArray.sort(function (a, b) {
		return a.id - b.id;
	});

	// 初始化表格
	var table1 = $("#authorize-management-1").DataTable({
		data: table1DataArray,
		columns: columns1,
		paging: false,
		searching: false,
		scrollX: false,
		info: false,
		order: [
			[2, "desc"],
			[2, "asc"],
		],
	});

	table1.clear().rows.add(table1DataArray).draw();

	var table2 = $("#authorize-management-2").DataTable({
		data: table2DataArray,
		columns: columns2,
		paging: false,
		searching: false,
		scrollX: false,
		info: false,
		order: [
			[2, "desc"],
			[2, "asc"],
		],
	});

	table2.clear().rows.add(table2DataArray).draw();

	var table3 = $("#authorize-management-3").DataTable({
		data: table3DataArray,
		columns: columns3,
		paging: false,
		searching: false,
		scrollX: false,
		info: false,
		order: [
			[2, "desc"],
			[2, "asc"],
		],
	});

	table3.clear().rows.add(table3DataArray).draw();

	var table4 = $("#authorize-management-4").DataTable({
		data: table4DataArray,
		columns: columns4,
		paging: false,
		searching: false,
		scrollX: false,
		info: false,
		order: [
			[2, "desc"],
			[2, "asc"],
		],
	});

	table4.clear().rows.add(table4DataArray).draw();

	var table5 = $("#authorize-management-5").DataTable({
		data: table5DataArray,
		columns: columns5,
		paging: false,
		searching: false,
		scrollX: false,
		info: false,
		order: [
			[2, "desc"],
			[2, "asc"],
		],
	});

	table5.clear().rows.add(table5DataArray).draw();

	var table6 = $("#authorize-management-6").DataTable({
		data: table6DataArray,
		columns: columns6,
		paging: false,
		searching: false,
		scrollX: false,
		info: false,
		order: [
			[2, "desc"],
			[2, "asc"],
		],
	});

	table6.clear().rows.add(table6DataArray).draw();

	var table7 = $("#authorize-management-7").DataTable({
		data: table7DataArray,
		columns: columns7,
		paging: false,
		searching: false,
		scrollX: false,
		info: false,
		order: [
			[2, "desc"],
			[2, "asc"],
		],
	});

	table7.clear().rows.add(table7DataArray).draw();

	var table8 = $("#authorize-management-8").DataTable({
		data: table8DataArray,
		columns: columns8,
		paging: false,
		searching: false,
		scrollX: false,
		info: false,
		order: [
			[2, "desc"],
			[2, "asc"],
		],
	});

	table8.clear().rows.add(table8DataArray).draw();

	var table9 = $("#authorize-management-9").DataTable({
		data: table9DataArray,
		columns: columns9,
		paging: false,
		searching: false,
		scrollX: false,
		info: false,
		order: [
			[2, "desc"],
			[2, "asc"],
		],
	});

	table9.clear().rows.add(table9DataArray).draw();

});

//詳細內容
var originalMenuAuthorizeData = []; //表格選項原始資料
var deepCopyOfNewData = JSON.parse(JSON.stringify(originalMenuAuthorizeData));
$(document).ready(function () {
	var partId = sessionStorage.getItem("roleUId");
	const dataId = { id: partId };
	const IdPost = JSON.stringify(dataId);

	const jsonStringFromLocalStorage = localStorage.getItem("userData");
	const gertuserData = JSON.parse(jsonStringFromLocalStorage);
	const user_token = gertuserData.token;

	var action = "getAuthorizeDetail";
    var source = "HBEVBACKEND";
    var chsmtoGetAuthorizeList = action + source + "HBEVAuthorizeBApi";
    var chsm = CryptoJS.MD5(chsmtoGetAuthorizeList).toString().toLowerCase();

	$.ajax({
		type: "POST",
		url: `${apiURL}/authorize`,
		headers: { Authorization: "Bearer " + user_token },
		data: {
			action: action,
            source: source,
            chsm: chsm,
			data: IdPost,
		},
		success: function (authResponse) {
			console.log(authResponse);
			if (authResponse.returnCode === "1" && authResponse.returnData.length > 0) {
				const AuthData = authResponse.returnData[0];

				var storeTypeValue = AuthData.storeType;

				// 处理详细数据
				$("#roleName").val(AuthData.name);
				$("#companyType").val(AuthData.companyType);
				$("#remarkAuth").val(AuthData.remark);
				$("#roleOrder").val(AuthData.authorizeOrder);
				$("#BuildTime").val(AuthData.createTime);
				$("#EditTime").val(AuthData.updateTime);
				$("#EditAccount").val(AuthData.updateOperator);

				// 處理表格
				if (AuthData.menuAuthorize && AuthData.menuAuthorize !== "undefined") {
					originalMenuAuthorizeData = JSON.parse(AuthData.menuAuthorize);
					console.log(originalMenuAuthorizeData, "原始資料");
				} else {
					// 处理 menuAuthorize 为 undefined 的情况
					console.log("menuAuthorize is undefined");
				}
				// 表格标识符数组
				var tableIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];
				// 使用循环为不同的表格填充复选框
				for (var i = 0; i < tableIds.length; i++) {
					fillCheckboxes(originalMenuAuthorizeData, tableIds[i]);
				}

				// 填充完毕后隐藏加载中的spinner
				$("#spinner").hide();
			} else {
				handleApiResponse(authResponse);
			}
		},
	});
});


// 回填表格內容
function fillCheckboxes(originalMenuAuthorizeData, tableId) {
	var $table = $("#authorize-management-" + tableId);

	for (var id in originalMenuAuthorizeData) {
		if (originalMenuAuthorizeData.hasOwnProperty(id)) {
			var columnsToCheck = originalMenuAuthorizeData[id];

			for (var i = 0; i < columnsToCheck.length; i++) {
				var columnToCheck = columnsToCheck[i];
				$table
					.find('input[name="rowCheckbox"][data-id="' + id + '"][data-column="' + columnToCheck + '"]')
					.prop("checked", true);
			}
		}
	}
}

// 選取checkbox 整理打包
var newAuthSelectData;
var deepCopyOfNewDataJSON;
$(document).ready(function () {
	var selectedData = {};
	// 取得的每一checkbox資料

	$('input[name="rowCheckbox"]').on("change", function () {
		var checkbox = $(this);
		var id = checkbox.closest("tr").find('input[name="rowCheckbox"]').data("id");
		var column = checkbox.data("column");

		if (typeof id !== "undefined" && typeof column !== "undefined") {
			if (checkbox.is(":checked")) {
				// 复选框被选中
				if (!selectedData[id]) {
					selectedData[id] = [];
				}
				selectedData[id].push(column);
			} else {
				if (selectedData[id]) {
					var columnIndex = selectedData[id].indexOf(column);
					if (columnIndex !== -1) {
						selectedData[id].splice(columnIndex, 1);

						// 在取消选中时，从 deepCopyOfNewData 中删除相应的项目
						if (deepCopyOfNewData[id]) {
							var deepCopyIndex = deepCopyOfNewData[id].indexOf(column);
							if (deepCopyIndex !== -1) {
								deepCopyOfNewData[id].splice(deepCopyIndex, 1);
							}
							// 如果深拷贝数组为空，从 deepCopyOfNewData 中删除属性
							if (deepCopyOfNewData[id].length === 0) {
								delete deepCopyOfNewData[id];
							}
							// 如果 deepCopyOfNewData[id] 中不再包含任何元素，也删除 id
							if (Object.keys(deepCopyOfNewData).length === 0) {
								delete deepCopyOfNewData[id];
							}
						}
					}
				}

				// 从原始数据中删除
				if (originalMenuAuthorizeData[id]) {
					var originalIndex = originalMenuAuthorizeData[id].indexOf(column);
					if (originalIndex !== -1) {
						originalMenuAuthorizeData[id].splice(originalIndex, 1);
					}
				}
			}

			// 将选中数据组装成指定的格式
			var formattedData = {};
			for (var id in selectedData) {
				if (selectedData.hasOwnProperty(id)) {
					formattedData[id] = selectedData[id];
				}
			}

			var formdeepCopyOfNewData = {};
			for (var id in deepCopyOfNewData) {
				if (deepCopyOfNewData.hasOwnProperty(id)) {
					formdeepCopyOfNewData[id] = deepCopyOfNewData[id];
				}
			}

			// 使用 jQuery 将对象转换为 JSON 字符串
			newAuthSelectData = formattedData;
			deepCopyOfNewDataJSON = formdeepCopyOfNewData;
			deepCopyOfNewData = JSON.parse(JSON.stringify(originalMenuAuthorizeData));

			for (var selectedTableId in selectedData) {
				if (selectedData.hasOwnProperty(selectedTableId)) {
					if (!deepCopyOfNewData[selectedTableId]) {
						deepCopyOfNewData[selectedTableId] = [];
					}
					deepCopyOfNewData[selectedTableId] = deepCopyOfNewData[selectedTableId].concat(
						deepCopyWithoutUndefinedAndNull(selectedData[selectedTableId])
					);
				}
			}
		}
	});
});

function deepCopyWithoutUndefinedAndNull(obj) {
	// 對於 null 或 undefined 的輸入，返回 null 或空數組
	if (obj === null || obj === undefined) {
		return obj === null ? null : [];
	}

	// 將 undefined 轉換為 null
	const parsedObj = JSON.parse(
		JSON.stringify(obj, (key, value) => {
			if (value === undefined) {
				return null;
			}
			return value;
		})
	);

	// 如果返回的是陣列，則使用 filter 函數
	if (Array.isArray(parsedObj)) {
		return parsedObj.filter((item) => item !== null);
	}

	return parsedObj;
}

// 新增
var miss = [];
$(document).ready(function () {
	var formData = new FormData();
	var uploadForm = document.getElementById("uploadForm");

	// 添加表单提交事件监听器
	uploadForm.addEventListener("submit", function (event) {
		if (uploadForm.checkValidity() === false) {
			event.preventDefault();
			event.stopPropagation();
			showWarningfillFormNotification();
		} else {
			// 处理表单提交
			event.preventDefault();

			var partId = sessionStorage.getItem("roleUId");

			var getroleName = $("#roleName").val();
			var getcompanyType = $("#companyType").val();
			var getremarkAuth = $("#remarkAuth").val();
			var getroleOrder = $("#roleOrder").val();

			var AuthDataObject = {
				id: partId,
				name: getroleName,
				companyType: getcompanyType,
				authorizeOrder: getroleOrder,
				remark: getremarkAuth,
			};

			const jsonStringFromLocalStorage = localStorage.getItem("userData");
			const gertuserData = JSON.parse(jsonStringFromLocalStorage);
			const user_token = gertuserData.token;

			var action = "updateAuthorizeDetail";
			var source = "HBEVBACKEND";
			var chsmtoGetAuthorizeList = action + source + "HBEVAuthorizeBApi";
			var chsm = CryptoJS.MD5(chsmtoGetAuthorizeList).toString().toLowerCase();

			// 设置其他formData字段
			formData.set("action", action);
			formData.set("source", source);
			formData.set("chsm", chsm);
			formData.set("data", JSON.stringify(AuthDataObject));

			var sendData;
			if (Object.keys(deepCopyOfNewData).length > 0) {
				sendData = deepCopyOfNewData;
			} else {
				sendData = originalMenuAuthorizeData;
			}
			formData.set("menuAuthorize", JSON.stringify(sendData));

			// 发送文件上传请求
			$.ajax({
				type: "POST",
				url: `${apiURL}/authorize`,
				headers: { Authorization: "Bearer " + user_token },
				data: formData,
				processData: false,
				contentType: false,
				success: function (response) {
					console.log(response);
					showSuccessFileNotification();

					setTimeout(function () {
						sessionStorage.removeItem("roleUId");
						var newPageUrl = "roleList.html";
						window.location.href = newPageUrl;
					}, 1000);
				},
				error: function (error) {
					console.log(error);
					showErrorNotification();
				},
			});
		}
		uploadForm.classList.add("was-validated");
	});
});

