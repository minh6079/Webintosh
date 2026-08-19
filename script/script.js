function $$(id) {
    return document.getElementById(id);
}

function call_style(app, key, value) {
    app.style[key] = value;
}

const WINDOW_HEADER_FOCUS_HEIGHT = 64;
let highestWindowZ = 2;
let windowZInitialized = false;

function ensureWindowZInitialized(force = false) {
    if (windowZInitialized && !force) {
        return;
    }
    windowZInitialized = true;
    let maxZ = 2;
    document.querySelectorAll('.window').forEach(win => {
        const z = parseFloat(window.getComputedStyle(win).zIndex) || 0;
        if (z > maxZ) {
            maxZ = z;
        }
    });
    highestWindowZ = maxZ;
}

function getNextWindowZIndex() {
    ensureWindowZInitialized();
    highestWindowZ += 1;
    return highestWindowZ;
}

function bringWindowToFront(win) {
    if (!win) {
        return;
    }
    win.style.zIndex = getNextWindowZIndex();
}

document.addEventListener('DOMContentLoaded', () => {
    ensureWindowZInitialized(true);
});

function makeDraggable(element) {
    let isDragging = false;
    let pendingDrag = false;
    let offsetX, offsetY;
    let startX = 0;
    let startY = 0;
    let activePointerId = null;
    const DRAG_THRESHOLD_PX = 4;

    element.addEventListener('pointerdown', (e) => {
        if (element.dataset.resizing === "true" || e.target.closest('.window-resize-handle') || e.target.closest('#win-tool')) {
            return;
        }
        if (e.button !== undefined && e.button !== 0) {
            return;
        }
        bringWindowToFront(element);
        pendingDrag = true;
        activePointerId = e.pointerId;
        startX = e.clientX;
        startY = e.clientY;
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;
        element.style.position = 'absolute';
        if (window.getComputedStyle(element).transform !== 'none') {
            const rect = element.getBoundingClientRect();
            element.style.left = `${rect.left}px`;
            element.style.top = `${rect.top}px`;
            element.style.transform = 'none';
        }
    });

    element.addEventListener('pointermove', (e) => {
        if ((!pendingDrag && !isDragging) || e.pointerId !== activePointerId) {
            return;
        }
        if (!isDragging) {
            const deltaX = Math.abs(e.clientX - startX);
            const deltaY = Math.abs(e.clientY - startY);
            if (deltaX < DRAG_THRESHOLD_PX && deltaY < DRAG_THRESHOLD_PX) {
                return;
            }
            isDragging = true;
            element.setPointerCapture(e.pointerId);
        }
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
        e.preventDefault();
    });

    element.addEventListener('pointerup', (e) => {
        if (e.pointerId !== activePointerId) {
            return;
        }
        isDragging = false;
        pendingDrag = false;
        activePointerId = null;
        try {
            element.releasePointerCapture(e.pointerId);
        } catch (error) {
            // ignore (capture may not have been taken if user only clicked)
        }
    });
}

function topbarText(text1, text2, text3, text4, text5, text6, text7, text8, text9, text10) {
    window.currentTopbarApp = text1;
    menu1.innerHTML = text1;
    menu2.innerHTML = text2;
    menu3.innerHTML = text3;
    menu4.innerHTML = text4;
    menu5.innerHTML = text5;
    menu6.innerHTML = text6;
    menu7.innerHTML = text7;
    menu8.innerHTML = text8;
    menu9.innerHTML = text9;
    menu10.innerHTML = text10;
}

const TOPBAR_MENU_ITEMS = {
    Finder: {
        app: ["About Finder", "Settings...", "Empty Trash...", "Services", "Hide Finder", "Hide Others", "Show All"],
        file: ["New Finder Window", "New Folder", "New Smart Folder", "New Tab", "Close Window", "Get Info", "Rename", "Duplicate", "Make Alias", "Move to Trash", "Eject"],
        edit: ["Undo", "Redo", "Cut", "Copy", "Paste", "Select All", "Show Clipboard"],
        view: ["as Icons", "as List", "as Columns", "as Gallery", "Use Groups", "Sort By", "Clean Up", "Show Path Bar", "Show Status Bar", "Show Sidebar", "Show Preview", "Show Tab Bar", "Customize Toolbar..."],
        go: ["Back", "Forward", "Enclosing Folder", "Recents", "Documents", "Desktop", "Downloads", "Home", "Computer", "Network", "AirDrop", "Applications", "Utilities", "Go to Folder...", "Connect to Server..."],
        window: ["Minimize", "Zoom", "Move Window to Left Side of Screen", "Move Window to Right Side of Screen", "Bring All to Front"],
        help: ["macOS Help", "Finder Help"]
    },
    Safari: {
        app: ["About Safari", "Settings...", "Privacy Report...", "Services", "Hide Safari", "Hide Others", "Show All", "Quit Safari"],
        file: ["New Window", "New Private Window", "New Tab", "Open Location...", "Open File...", "Close Window", "Close All Windows", "Close Tab", "Save As...", "Share", "Print..."],
        edit: ["Undo", "Redo", "Cut", "Copy", "Paste", "Select All", "AutoFill", "Find", "Spelling and Grammar", "Substitutions", "Start Dictation"],
        view: ["Show Title Bar", "Show Tab Bar", "Show Favorites Bar", "Show Sidebar", "Hide Sidebar", "Show All Tabs", "Zoom In", "Zoom Out", "Stop", "Reload Page", "Customize Toolbar...", "Hide Status Bar", "Enter Full Screen"],
        history: ["Back", "Forward", "Home", "History Highlights", "Recently Closed", "Reopen Last Closed Window", "Reopen Last Closed Tab", "Show All History", "Clear History..."],
        bookmarks: ["Add Bookmark...", "Add Bookmarks for These Tabs...", "Add to Favorites", "Bookmarks Folder", "Edit Bookmarks", "Show Bookmarks"],
        window: ["Minimize", "Zoom", "Move Window to Left Side of Screen", "Move Window to Right Side of Screen", "Bring All to Front"],
        help: ["Safari Help", "Privacy Report..."]
    },
    Settings: {
        app: ["About System Settings", "Settings...", "Services", "Hide System Settings", "Hide Others", "Show All", "Quit System Settings"],
        file: ["Close", "Close Window"],
        edit: ["Undo", "Redo", "Cut", "Copy", "Paste", "Select All"],
        view: ["All Settings", "Show Previous", "Show Next", "Zoom In", "Zoom Out"],
        window: ["Minimize", "Zoom", "Bring All to Front"],
        help: ["System Settings Help"]
    },
    Freeform: {
        app: ["About Freeform", "Settings...", "Services", "Hide Freeform", "Hide Others", "Show All", "Quit Freeform"],
        file: ["New Board", "New Board from Template", "Open...", "Open Recent", "Close", "Duplicate", "Rename...", "Export", "Export as PDF...", "Share"],
        edit: ["Undo", "Redo", "Cut", "Copy", "Paste", "Paste and Match Style", "Delete", "Select All", "Duplicate"],
        insert: ["Text", "Shape", "Sticky Note", "Media", "Scan"],
        view: ["Zoom In", "Zoom Out", "Actual Size", "Zoom to Fit", "Show Grid", "Hide Alignment Guides", "Enter Full Screen"],
        window: ["Minimize", "Zoom", "Bring All to Front"],
        help: ["Freeform Help"]
    },
    Notes: {
        app: ["About Notes", "Settings...", "Services", "Hide Notes", "Hide Others", "Show All", "Quit Notes"],
        file: ["New Note", "New Quick Note", "New Folder", "Close", "Import to Notes...", "Export as PDF..."],
        edit: ["Undo", "Redo", "Cut", "Copy", "Paste", "Paste and Match Style", "Delete", "Select All", "Attach Files...", "Insert Photo..."],
        format: ["Font", "Text", "Checklist", "Table"],
        view: ["as List", "as Gallery", "Sort Notes By", "Show Folders", "Hide Sidebar", "Show Attachments Browser", "Enter Full Screen"],
        window: ["Minimize", "Zoom", "Bring All to Front"],
        help: ["Notes Help"]
    },
    Maps: {
        app: ["About Maps", "Settings...", "Services", "Hide Maps", "Hide Others", "Show All", "Quit Maps"],
        file: ["New Window", "New Tab", "Close Window", "Save to Guides...", "Print..."],
        edit: ["Undo", "Redo", "Cut", "Copy", "Paste", "Select All", "Find"],
        view: ["Explore", "Driving", "Transit", "Satellite", "Show Traffic", "Show Labels", "Show Compass", "2D Map", "3D Map", "Zoom In", "Zoom Out", "Enter Full Screen"],
        window: ["Minimize", "Zoom", "Bring All to Front"],
        help: ["Maps Help"]
    },
    Terminal: {
        app: ["About Terminal", "Settings...", "Secure Keyboard Entry", "Services", "Hide Terminal", "Hide Others", "Show All", "Quit Terminal"],
        shell: ["New Window", "New Tab", "New Command...", "Connect to Server...", "Close Window", "Close Tab", "Export Text As...", "Print..."],
        edit: ["Undo", "Redo", "Cut", "Copy", "Paste", "Paste Escaped Text", "Select All", "Find", "Use Selection for Find", "Clear Scrollback"],
        view: ["Show Tab Bar", "Show Inspector", "Show Font Panel", "Bigger Text", "Smaller Text", "Zoom In", "Zoom Out", "Enter Full Screen"],
        window: ["Minimize", "Zoom", "Bring All to Front"],
        help: ["Terminal Help"]
    },
    Calculator: {
        app: ["About Calculator", "Settings...", "Services", "Hide Calculator", "Hide Others", "Show All", "Quit Calculator"],
        file: ["Close Window"],
        edit: ["Undo", "Redo", "Cut", "Copy", "Paste", "Select All", "Show Paper Tape"],
        view: ["Basic", "Scientific", "Programmer", "Convert", "Show Paper Tape", "Show Thousands Separator", "RPN Mode"],
        convert: ["Area", "Currency", "Energy", "Length", "Power", "Pressure", "Speed", "Temperature", "Time", "Volume", "Weights and Masses"],
        window: ["Minimize", "Zoom", "Bring All to Front"],
        help: ["Calculator Help"]
    }
};

let activeTopbarMenu = null;

function closeAppleMenu() {
    if (typeof apple_menu !== "undefined" && apple_menu) {
        apple_menu.style.animation = "none";
        apple_menu.style.opacity = 0;
        apple_menu.style.zIndex = -0.5;
        apple_menu.classList.remove("open");
    }
    if (typeof h4div !== "undefined" && h4div) {
        h4div.style.animation = "none";
        h4div.style.opacity = 0;
    }
    if (typeof appleFrame !== "undefined" && appleFrame) {
        appleFrame.style.backgroundColor = "rgba(255, 255, 255, 0)";
    }
    if (typeof menu !== "undefined") {
        menu = false;
    }
}

function getTopbarDropdownLabel(menuKey) {
    const labels = {
        app: "Finder",
        file: "File",
        edit: "Edit",
        view: "View",
        go: "Go",
        window: "Window",
        help: "Help"
    };
    return labels[menuKey] || "";
}

function closeTopbarDropdown() {
    const dropdown = document.getElementById("topbar-dropdown");
    const menuItems = document.querySelectorAll("#topbar #menu h4");
    if (dropdown) {
        dropdown.classList.remove("open");
        dropdown.innerHTML = "";
        dropdown.setAttribute("aria-hidden", "true");
    }
    menuItems.forEach((item) => item.classList.remove("topbar-menu-active"));
    activeTopbarMenu = null;
}

function openTopbarDropdown(menuEl) {
    const dropdown = document.getElementById("topbar-dropdown");
    if (!dropdown || !menuEl) {
        return;
    }
    closeAppleMenu();
    const menuKey = menuEl.dataset.menu;
    const appName = window.currentTopbarApp || "Finder";
    const appMenus = TOPBAR_MENU_ITEMS[appName] || TOPBAR_MENU_ITEMS.Finder;
    const items = menuKey === "app" ? null : appMenus[menuKey];
    if (!items || !items.length) {
        closeTopbarDropdown();
        return;
    }

    const rect = menuEl.getBoundingClientRect();
    dropdown.innerHTML = items.map((item) => `<button type="button" class="topbar-dropdown-item">${item}</button>`).join("");
    dropdown.style.left = `${Math.max(8, rect.left)}px`;
    dropdown.style.top = `${rect.bottom + 6}px`;
    dropdown.classList.add("open");
    dropdown.setAttribute("aria-hidden", "false");
    document.querySelectorAll("#topbar #menu h4").forEach((item) => {
        item.classList.toggle("topbar-menu-active", item === menuEl);
    });
    activeTopbarMenu = menuEl;
}

function toggleTopbarDropdown(menuEl) {
    if (!menuEl || !menuEl.dataset.menu) {
        return;
    }
    if (activeTopbarMenu === menuEl) {
        closeTopbarDropdown();
        return;
    }
    openTopbarDropdown(menuEl);
}

document.addEventListener("click", (event) => {
    const menuItem = event.target.closest("#topbar #menu h4[data-menu]");
    const dropdown = event.target.closest("#topbar-dropdown");
    if (menuItem) {
        event.stopPropagation();
        toggleTopbarDropdown(menuItem);
        return;
    }
    if (!dropdown) {
        closeTopbarDropdown();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeTopbarDropdown();
    }
});

function makeDraggableHardWare(element) {
    let isDragging = false;
    let pendingDrag = false;
    let offsetX, offsetY;
    let startX = 0;
    let startY = 0;
    let activePointerId = null;
    const DRAG_THRESHOLD_PX = 4;

    element.addEventListener('pointerdown', (e) => {
        if (element.dataset.resizing === "true" || e.target.closest('.window-resize-handle') || e.target.closest('#win-tool')) {
            return;
        }
        if (e.button !== undefined && e.button !== 0) {
            return;
        }
        bringWindowToFront(element);
        pendingDrag = true;
        activePointerId = e.pointerId;
        startX = e.clientX;
        startY = e.clientY;
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;
        element.style.zIndex = 2; // Set z-index to ensure the element is on top when being dragged
    });

    element.addEventListener('pointermove', (e) => {
        if ((!pendingDrag && !isDragging) || e.pointerId !== activePointerId) {
            return;
        }
        if (!isDragging) {
            const deltaX = Math.abs(e.clientX - startX);
            const deltaY = Math.abs(e.clientY - startY);
            if (deltaX < DRAG_THRESHOLD_PX && deltaY < DRAG_THRESHOLD_PX) {
                return;
            }
            isDragging = true;
            element.setPointerCapture(e.pointerId);
        }
        element.style.left = `${e.clientX - offsetX + element.offsetWidth / 2}px`;
        element.style.top = `${e.clientY - offsetY + element.offsetHeight / 2}px`;
        e.preventDefault();
    });

    element.addEventListener('pointerup', (e) => {
        if (e.pointerId !== activePointerId) {
            return;
        }
        isDragging = false;
        pendingDrag = false;
        activePointerId = null;
        try {
            element.releasePointerCapture(e.pointerId);
        } catch (error) {
            // ignore (capture may not have been taken if user only clicked)
        }
    });
}

function makeResizable(element) {
    if (!element || element.querySelector('.window-resize-handle')) {
        return;
    }
    const handle = document.createElement('div');
    handle.className = 'window-resize-handle';
    element.appendChild(handle);

    const styles = window.getComputedStyle(element);
    const minWidth = parseFloat(element.dataset.minWidth) || parseFloat(styles.minWidth) || 240;
    const minHeight = parseFloat(element.dataset.minHeight) || parseFloat(styles.minHeight) || 160;
    const maxWidth = parseFloat(element.dataset.maxWidth) || Number.POSITIVE_INFINITY;
    const maxHeight = parseFloat(element.dataset.maxHeight) || Number.POSITIVE_INFINITY;
    let isResizing = false;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;

    const onMove = (e) => {
        if (!isResizing || e.pointerId !== activePointerId) return;
        const nextWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + (e.clientX - startX)));
        const nextHeight = Math.min(maxHeight, Math.max(minHeight, startHeight + (e.clientY - startY)));
        element.style.width = `${nextWidth}px`;
        element.style.height = `${nextHeight}px`;
    };

    const onUp = (e) => {
        if (!isResizing || e.pointerId !== activePointerId) return;
        isResizing = false;
        activePointerId = null;
        element.dataset.resizing = "false";
        handle.releasePointerCapture(e.pointerId);
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onUp);
    };

    let activePointerId = null;

    handle.addEventListener('pointerdown', (e) => {
        if (e.button !== undefined && e.button !== 0) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        activePointerId = e.pointerId;
        element.dataset.resizing = "true";
        handle.setPointerCapture(e.pointerId);
        startX = e.clientX;
        startY = e.clientY;
        startWidth = element.getBoundingClientRect().width;
        startHeight = element.getBoundingClientRect().height;
        handle.addEventListener('pointermove', onMove);
        handle.addEventListener('pointerup', onUp);
        handle.addEventListener('pointercancel', onUp);
    });
}

function attachIframeScale(windowEl, iframeSelector) {
    if (!windowEl) {
        return;
    }
    const iframe = windowEl.querySelector(iframeSelector);
    if (!iframe || iframe.dataset.scaled === "true") {
        return;
    }
    const parent = iframe.parentElement;
    if (!parent) {
        return;
    }

    const wrap = document.createElement("div");
    wrap.className = "iframe-scale-wrap";
    parent.replaceChild(wrap, iframe);
    wrap.appendChild(iframe);

    iframe.dataset.scaled = "true";

    const baseWidth = wrap.clientWidth;
    const baseHeight = wrap.clientHeight;
    iframe.dataset.baseWidth = `${baseWidth}`;
    iframe.dataset.baseHeight = `${baseHeight}`;
    iframe.style.width = `${baseWidth}px`;
    iframe.style.height = `${baseHeight}px`;
    iframe.style.transformOrigin = "top left";

    const update = () => {
        const bw = parseFloat(iframe.dataset.baseWidth) || baseWidth;
        const bh = parseFloat(iframe.dataset.baseHeight) || baseHeight;
        const availableWidth = wrap.clientWidth || bw;
        const availableHeight = wrap.clientHeight || bh;
        const scale = Math.min(1, availableWidth / bw, availableHeight / bh);
        iframe.style.transform = `scale(${scale})`;
    };

    update();

    if (window.ResizeObserver) {
        const ro = new ResizeObserver(update);
        ro.observe(wrap);
    } else {
        window.addEventListener("resize", update);
    }
}

function OpenMenu(menu) {
    null;
}

function Reset() {
    setTimeout(function () { dock.style.animation = 'DockBack 0.75s forwards ease-in-out' }, 500)
    topbar.style.opacity = 0
    apple_menu.style.opacity = 0
    setTimeout(function () { body.style.backgroundColor = '#000' }, 1500)
    setTimeout(function () { window.location = './index.html' }, 3000)
}

function Shutdown() {
    setTimeout(function () { dock.style.animation = 'DockBack 0.75s forwards ease-in-out' }, 500)
    topbar.style.opacity = 0
    apple_menu.style.opacity = 0
    setTimeout(function () { window.location = 'about:blank' }, 2000)
}

function BackLogon() {
    setTimeout(function () { dock.style.animation = 'DockBack 0.75s forwards ease-in-out' }, 500)
    topbar.style.opacity = 0
    apple_menu.style.opacity = 0
    setTimeout(function () { window.location = './logon.html?bg=none' }, 2000)
}

function updateTime() {
    let now = new Date();
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    let timeString = hours + ':' + minutes;
    let dayOfWeek = now.getDay();
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let dayName = days[dayOfWeek];
    const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    document.getElementById('Time').textContent = timeString;
    document.getElementById('Zhou').textContent = dayName;
    document.getElementById('Date').textContent = date;
}

function Sleep() {
    document.body.children.style.opacity = `0`;
    body.style.backgroundImage = 'none'
    body.style.backgroundColor = '#000'
    document.addEventListener('mousemove', function (e) {
        document.body.children.style.opacity = `1`;
        body.style.backgroundImage = `url(./images/${wallpaper_now}.jpg)`
    })
}

function Show_AppleMenu() {
    if (menu == false) {
        closeTopbarDropdown();
        apple_menu.classList.add("open");
        apple_menu.style.opacity = 1
        apple_menu.style.zIndex = 2
        h4div.style.opacity = 1
        appleFrame.style.backgroundColor = `rgba(255, 255, 255, 0.5)`
        menu = true;
        apple_menu.addEventListener('click', function (e) {
            let click = e.target;
            if (!click.matches('#app-menu')) {
                apple_menu.style.animation = `opacityBack 0.125s ease-in-out`;
                h4div.style.animation = `opacityBack 0.125s ease-in-out`;
                appleFrame.style.backgroundColor = `rgba(255, 255, 255, 0)`
                setTimeout(function () {
                    apple_menu.style.zIndex = -0.5;
                    apple_menu.style.opacity = 0;
                    h4div.style.opacity = 0;
                    h4div.style.animation = `none`;
                    apple_menu.style.animation = `none`;
                    menu = false;
                }, 125)
            }
        });
    } else {
        closeAppleMenu();
    }
}

function setTopbar(color) {
    if (color == 'white') {
        topbar.style.color = '#fff';
        topbar.style.textShadow = `0 1px 5px rgba(0, 0, 0, 0.2)`;
    } else if (color == 'black') {
        topbar.style.color = '#000';
        topbar.style.textShadow = `none`;
    } else {
        return
    }
}

function loadWallpaperPreference() {
    try {
        const saved = localStorage.getItem("wallpaper_now");
        if (saved && /^[A-Za-z]+-(Day|Night)$/.test(saved)) {
            return saved;
        }
    } catch (error) {
        // localStorage may not be available (private mode / disabled cookies)
    }
    return null;
}

function saveWallpaperPreference(value) {
    try {
        localStorage.setItem("wallpaper_now", value);
    } catch (error) {
        // localStorage may not be available; silently ignore.
    }
}

function applyWallpaperByName(name, skipDom) {
    // name: e.g. "BigSur-Day", "Monterey-Night". Sets bg + (optional) DOM preview.
    if (!/^[A-Za-z]+-(Day|Night)$/.test(name)) {
        return;
    }
    bg.style.backgroundImage = `url(./images/${name}.jpg)`;
    wallpaper_now = name;
    saveWallpaperPreference(name);
    if (skipDom) {
        return;
    }
    const wallpaperId = $$('wallpaper-looking-new');
    const wallpaperLooking = $$('by-looking-new');
    const match = name.match(/^([A-Za-z]+)-(Day|Night)$/);
    const stem = match ? match[1] : "Sequoia";
    const prettyMap = {
        BigSur: "Beach",
        Monterey: "Lake",
        Ventura: "Desert",
        Sonoma: "Cliff",
        Sequoia: "Default"
    };
    if (wallpaperId) {
        wallpaperId.innerHTML = prettyMap[stem] || stem;
    }
    if (wallpaperLooking) {
        wallpaperLooking.src = `./images/${name}.jpg`;
    }
    const isLightBg = stem === "Sonoma";
    // Sonoma shows a light topbar in day; everything else uses black text.
    setTopbar(isLightBg ? 'white' : 'black');
}

let wallpaper_now = loadWallpaperPreference() || 'Sequoia-Day';

// Apply the persisted wallpaper once the rest of the page has finished
// setting up `bg`. `bg` is declared by the inline script in desktop.html
// that runs after this file, so DOMContentLoaded is the safest hook.
document.addEventListener("DOMContentLoaded", () => {
    if (typeof bg === "undefined" || !bg) {
        return;
    }
    bg.style.backgroundImage = `url(./images/${wallpaper_now}.jpg)`;
    if (typeof setTopbar === "function") {
        const stem = String(wallpaper_now).match(/^([A-Za-z]+)-(Day|Night)$/);
        const isNight = String(wallpaper_now).endsWith("Night");
        const isSonomaDay = !!(stem && stem[1] === "Sonoma" && !isNight);
        // Night always uses a light topbar; Sonoma-Day also; everything else black.
        setTopbar(isNight || isSonomaDay ? "white" : "black");
    }
    // The static legacy settings panel inside #old (hidden) carries the
    // same wallpaper preview, but its two IDs lack the "-new" suffix.
    const legacyTitle = document.querySelector('p#wallpaper-looking');
    const legacyImg = document.querySelector('img#by-looking');
    if (legacyTitle || legacyImg) {
        const stem = String(wallpaper_now).match(/^([A-Za-z]+)-(Day|Night)$/);
        const prettyMap = {
            BigSur: "Beach",
            Monterey: "Lake",
            Ventura: "Desert",
            Sonoma: "Cliff",
            Sequoia: "Default"
        };
        const pretty = prettyMap[stem && stem[1]] || (stem && stem[1]) || "Default";
        if (legacyTitle) {
            legacyTitle.textContent = pretty;
        }
        if (legacyImg) {
            legacyImg.src = `./images/${wallpaper_now}.jpg`;
        }
    }
});

function change_wall(wallpaper) {
    let wallpaperId = $$('wallpaper-looking-new');
    let wallpaperLooking = $$('by-looking-new');
    wallpaper = wallpaper.toLowerCase();
    if (wallpaper == 'beach') {
        bg.style.backgroundImage = `url(./images/BigSur-Day.jpg)`;
        wallpaper_now = 'BigSur-Day';
        saveWallpaperPreference(wallpaper_now);
        wallpaperId.innerHTML = 'Beach';
        wallpaperLooking.src = `./images/BigSur-Day.jpg`;
        setTopbar('black');
    } else if (wallpaper == 'lake') {
        bg.style.backgroundImage = `url(./images/Monterey-Day.jpg)`;
        wallpaper_now = 'Monterey-Day';
        saveWallpaperPreference(wallpaper_now);
        wallpaperId.innerHTML = 'Lake';
        wallpaperLooking.src = `./images/Monterey-Day.jpg`;
        setTopbar('black');
    } else if (wallpaper == 'desert') {
        bg.style.backgroundImage = `url(./images/Ventura-Day.jpg)`;
        wallpaper_now = 'Ventura-Day';
        saveWallpaperPreference(wallpaper_now);
        wallpaperId.innerHTML = 'Desert';
        wallpaperLooking.src = `./images/Ventura-Day.jpg`;
        setTopbar('black');
    } else if (wallpaper == 'cliff') {
        bg.style.backgroundImage = `url(./images/Sonoma-Day.jpg)`;
        wallpaper_now = 'Sonoma-Day';
        saveWallpaperPreference(wallpaper_now);
        wallpaperId.innerHTML = 'Cliff';
        wallpaperLooking.src = `./images/Sonoma-Day.jpg`;
        setTopbar('white');
    } else if (wallpaper == 'default') {
        bg.style.backgroundImage = `url(./images/Sequoia-Day.jpg)`;
        wallpaper_now = 'Sequoia-Day';
        saveWallpaperPreference(wallpaper_now);
        wallpaperId.innerHTML = 'Default';
        wallpaperLooking.src = `./images/Sequoia-Day.jpg`;
        setTopbar('black');
    } else if (wallpaper == 'auto') {
        let now = new Date();
        let hours = now.getHours().toString().padStart(2, '0');
        if (hours >= 19) {
            wallpaper_now = wallpaper_now.replace("Day", "Night");
            saveWallpaperPreference(wallpaper_now);
            bg.style.backgroundImage = `url(./images/${wallpaper_now}.jpg)`;
            wallpaperLooking.src = `./images/${wallpaper_now}.jpg`;
            setTopbar('white');
        } else if (hours < 5) {
            wallpaper_now = wallpaper_now.replace("Day", "Night");
            saveWallpaperPreference(wallpaper_now);
            bg.style.backgroundImage = `url(./images/${wallpaper_now}.jpg)`;
            wallpaperLooking.src = `./images/${wallpaper_now}.jpg`;
            setTopbar('white');
        } else {
            wallpaper_now = wallpaper_now.replace("Night", "Day");
            saveWallpaperPreference(wallpaper_now);
            bg.style.backgroundImage = `url(./images/${wallpaper_now}.jpg)`;
            wallpaperLooking.src = `./images/${wallpaper_now}.jpg`;
            if (wallpaper_now == 'Sonoma-Day') {
                setTopbar('white');
            } else {
                setTopbar('black');
            }
        }
    } else if (wallpaper == 'day') {
        wallpaper_now = wallpaper_now.replace("Night", "Day");
        saveWallpaperPreference(wallpaper_now);
        bg.style.backgroundImage = `url(./images/${wallpaper_now}.jpg)`;
        wallpaperLooking.src = `./images/${wallpaper_now}.jpg`;
        if (wallpaper_now == 'Sonoma-Day') {
            setTopbar('white');
        } else {
            setTopbar('black');
        }
    } else if (wallpaper == 'night') {
        wallpaper_now = wallpaper_now.replace("Day", "Night");
        saveWallpaperPreference(wallpaper_now);
        bg.style.backgroundImage = `url(./images/${wallpaper_now}.jpg)`;
        wallpaperLooking.src = `./images/${wallpaper_now}.jpg`;
        setTopbar('white');
    } else {
        alert(`unknown wallpaper name or status: ${wallpaper}`);
    }
}

document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    bg.addEventListener("contextmenu", function (e) {
        right_menu.style.display = `inline-flex`;
        right_menu.style.opacity = 1;
        right_menu.style.top = `${e.clientY}px`;
        right_menu.style.left = `${e.clientX}px`;
    });
    bg.addEventListener('click', function (e) {
        let ClickedElement = e.target;
        if (!ClickedElement.matches('.contextmenu')) {
            right_menu.style.display = `none`;
            right_menu.style.transition = `opacity 0.5s ease-out`;
            right_menu.style.opacity = 0;
            right_menu.style.top = `${e.clientY}px`;
            right_menu.style.left = `${e.clientX}px`;
        }
    });
});

function loadStyleSheet(filename) {
    filenameAll = `css/${filename}`;
    link = document.createElement('link');
    link.rel = "stylesheet";
    link.href = filenameAll;
    document.head.appendChild(link);
    return link;
}

function removeStyleSheet(link) {
    document.head.removeChild(link);
}

function updateTopbarForWindow(win) {
    if (!win) {
        return;
    }
    if (win.id == 'settings') {
        topbarText("Settings", "File", "Edit", "View", "Window", "Help", "", "", "", "");
    } else if (win.id == 'safari-window') {
        topbarText("Safari", "File", "Edit", "View", "History", "Bookmarks", "Window", "Help", "", "");
    } else if (win.id == 'freeform-window') {
        topbarText("Freeform", "File", "Edit", "View", "Window", "Help", "", "", "", "");
    } else if (win.id == 'note-window') {
        topbarText("Notes", "File", "Edit", "View", "Window", "Help", "", "", "", "");
    } else if (win.id == 'map-window') {
        topbarText("Maps", "File", "Edit", "View", "Window", "Help", "", "", "", "");
    } else if (win.id == 'terminal-window') {
        topbarText("Terminal", "Shell", "Edit", "View", "Window", "Help", "", "", "", "");
    } else if (win.id == 'calc-window') {
        topbarText("Calculator", "File", "Edit", "View", "Window", "Help", "", "", "", "");
    } else {
        topbarText("Finder", "File", "Edit", "View", "Go", "Window", "Help", "", "", "");
    }
}

function selectWindowInit() {
    ensureWindowZInitialized();
    document.querySelectorAll('.window').forEach(win => {
        if (win.dataset.focusAttached === 'true') {
            return;
        }
        win.dataset.focusAttached = 'true';
        win.addEventListener('pointerdown', function (e) {
            if (e && e.button !== undefined && e.button !== 0) {
                return;
            }
            bringWindowToFront(win);
            updateTopbarForWindow(win);
        });
    });
}

function theme(name) {
    if (name == 'light') {
        if (window.apps) {
            window.apps.href = `./css/apps.css`;
            window.ui.href = `./css/ui.css`;
            window.finder.href = `./css/finder.css`;
        } else {
            window.apps = loadStyleSheet('apps.css');
            window.ui = loadStyleSheet('ui.css');
            window.finder = loadStyleSheet('finder.css');
        }
        wallpaperLooking.src = './images/Sequoia-Day.jpg';
    } else {
        if (window.apps) {
            window.apps.href = `./css/dark/apps.css`;
            window.ui.href = `./css/dark/ui.css`;
            window.finder.href = `./css/dark/finder.css`;
        } else {
            window.apps = loadStyleSheet('dark/apps.css');
            window.ui = loadStyleSheet('dark/ui.css');
            window.finder = loadStyleSheet('dark/finder.css');
        }
        wallpaperLooking.src = './images/Sequoia-Night.jpg';
    }
}

/* document.addEventListener('mousemove', function (e) {
    cursor.style.top = e.clientY;
    cursor.style.left = e.clientX;
}); */
