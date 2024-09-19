var currentData = localStorage.getItem("currentUser");
var currentData = JSON.parse(currentData);
var menuData = currentData.userretrunData;

const dynamicMenu = document.getElementById("dynamicMenu");

function compareMenuOrder(a, b) {
	return a.menuOrder - b.menuOrder;
}

function hasPermission(auth, permission) {
	return auth.includes(permission);
}

function extractPrefix(url) {
	const prefix = url.split('.html')[0];
	return prefix;
}

function generateMenu(data, parentId) {
	const parentItems = data
		.filter((item) => item.mainCategoryId === parentId && item.type === "1st")
		.sort(compareMenuOrder);

	const titleToIconMap = {
		站點管理: "fas fa-location-arrow me-2",
		通知管理: "far fa-file-alt me-2",
		帳號管理: "fa fa-th me-2",
		費率管理: "fas fa-comment-dollar me-2",
		車輛管理: "fas fa-car me-2",
		訊息管理: "fas fa-comments me-2",
		會員管理: "fas fa-id-card me-2",
		優惠管理: "fas fa-bullhorn me-2",
		訂單管理: "fas fa-edit me-2",
	};

	parentItems.forEach((parentItem) => {
		const hasReadPermission = hasPermission(parentItem.auth, "read");
		if (!hasReadPermission) {
			return;
		}

		const parentMenuItem = document.createElement("div");
		parentMenuItem.className = "nav-item dropdown";

		const parentDropdownLink = document.createElement("a");
		parentDropdownLink.href = parentItem.url || "javascript:void(0)";
		parentDropdownLink.className = "nav-link dropdown-toggle";
		parentDropdownLink.setAttribute("data-bs-toggle", "dropdown");
		parentDropdownLink.textContent = parentItem.name;

		const iconClass = titleToIconMap[parentItem.name] || "fa-circle";

		const icon = document.createElement("i");
		icon.className = `fas ${iconClass}`;

		parentDropdownLink.prepend(icon);

		const parentDropdownMenu = document.createElement("div");
		parentDropdownMenu.className = "dropdown-menu bg-transparent border-0";

		parentMenuItem.appendChild(parentDropdownLink);
		parentMenuItem.appendChild(parentDropdownMenu);

		dynamicMenu.appendChild(parentMenuItem);

		generateSubMenu(data, parentItem.id, parentDropdownMenu);
	});
}

function generateSubMenu(data, parentId, parentDropdownMenu) {
	const subItems = data
		.filter((item) => item.mainCategoryId === parentId && item.type === "2st")
		.sort(compareMenuOrder);

	subItems.forEach((subItem) => {
		const hasReadPermission = hasPermission(subItem.auth, "read");

		if (!hasReadPermission) {
			return;
		}

		const subPrefix = extractPrefix(subItem.url);
		
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
            subMenuItem.href = subPrefix + "/" + subItem.url || "javascript:void(0)";
        } else {
            subMenuItem.href = "../" + subPrefix + "/" + subItem.url || "javascript:void(0)";
        }

		subMenuItem.className = "dropdown-item";
		subMenuItem.textContent = subItem.name;

		parentDropdownMenu.appendChild(subMenuItem);

		generateSubMenu(data, subItem.id, subMenuItem);
	});
}

generateMenu(menuData, null);

//菜單展開
// 获取当前页面路径
let currentPath = window.location.pathname;
if (currentPath.charAt(0) === "/") {
	currentPath = currentPath.slice(1);
}

const pathParts = currentPath.split("/");
const htmlName = pathParts[pathParts.length - 1];

// 获取菜单项容器
const getdynamicMenu = document.getElementById("dynamicMenu");
// 找到所有的菜单项

const linksNodeList = document.querySelectorAll(".dropdown-menu a");
// const links = Array.from(linksNodeList).map((link) => link.getAttribute("href"));
const links = Array.from(linksNodeList).map((link) => {
    const href = link.getAttribute("href");
    return href ? href.split('/').pop() : '';
});

const matchedLinks = links.filter((link) => link === htmlName);
localStorage.setItem("expandedMenu", matchedLinks[0]);

// 在页面加载时应用展开的菜单项状态
window.addEventListener("load", () => {
	// 从localStorage中获取展开的菜单项URL
	const expandedMenuUrl = localStorage.getItem("expandedMenu");
	if (expandedMenuUrl) {
		// 找到对应的菜单项并展开
		const expandedMenuItem = getdynamicMenu.querySelector(`a[href$="${expandedMenuUrl}"]`);

		if (expandedMenuItem) {
			// 找到父菜单项并展开
			const parentDropdown = expandedMenuItem.closest(".dropdown-menu");
			if (parentDropdown) {
				parentDropdown.classList.add("show");

				expandedMenuItem.style.color = "#fff";
				expandedMenuItem.style.textDecoration = "none";
				expandedMenuItem.style.backgroundColor = "#0d6efd";

				// 确保展开父菜单项
				const grandParentDropdown = parentDropdown.closest(".dropdown");
				if (grandParentDropdown) {
					const parentLink = grandParentDropdown.querySelector(".nav-link");
					if (parentLink) {
						parentLink.classList.add("show");
					}
				}
			}
		}
	}
});