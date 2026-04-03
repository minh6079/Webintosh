function $$(id) {
    return document.getElementById(id);
}

function call_style(app, key, value) {
    app.style[key] = value;
}

function makeDraggable(element) {
    let isDragging = false;
    let offsetX, offsetY;

    element.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;
        element.style.position = 'absolute';
        element.style.zIndex = 2;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            element.style.left = `${e.clientX - offsetX}px`;
            element.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

function topbarText(text1, text2, text3, text4, text5, text6, text7, text8, text9, text10) {
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

function makeDraggableHardWare(element) {
    let isDragging = false;
    let offsetX, offsetY;

    element.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;
        element.style.zIndex = 2; // Set z-index to ensure the element is on top when being dragged

        // Prevent the default event to avoid selecting text or other elements during dragging
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            element.style.left = `${e.clientX - offsetX + element.offsetWidth / 2}px`;
            element.style.top = `${e.clientY - offsetY + element.offsetHeight / 2}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

function OpenMenu(menu) {
    alert('You clicked the menu item：' + menu.textContent.replace('...', ''))
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
    const options = { month: 'numeric', day: 'numeric' };
    const date = now.toLocaleDateString('en-US', options);
    document.getElementById('Time').textContent = timeString;
    document.getElementById('Zhou').textContent = dayName;
    document.getElementById('Date').textContent = date.replace(/\//g, ' of ') + ',';
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

let wallpaper_now = 'Sequoia-Day';

function change_wall(wallpaper) {
    let wallpaperId = $$('wallpaper-looking-new');
    let wallpaperLooking = $$('by-looking-new');
    wallpaper = wallpaper.toLowerCase();
    if (wallpaper == 'bigsur') {
        bg.style.backgroundImage = `url(./images/BigSur-Day.jpg)`;
        wallpaper_now = 'BigSur-Day';
        wallpaperId.innerHTML = 'Big Sur';
        wallpaperLooking.src = `./images/BigSur-Day.jpg`;
        setTopbar('black');
    } else if (wallpaper == 'monterey') {
        bg.style.backgroundImage = `url(./images/Monterey-Day.jpg)`;
        wallpaper_now = 'Monterey-Day';
        wallpaperId.innerHTML = 'Monterey';
        wallpaperLooking.src = `./images/Monterey-Day.jpg`;
        setTopbar('black');
    } else if (wallpaper == 'ventura') {
        bg.style.backgroundImage = `url(./images/Ventura-Day.jpg)`;
        wallpaper_now = 'Ventura-Day';
        wallpaperId.innerHTML = 'Ventura';
        wallpaperLooking.src = `./images/Ventura-Day.jpg`;
        setTopbar('black');
    } else if (wallpaper == 'sonoma') {
        bg.style.backgroundImage = `url(./images/Sonoma-Day.jpg)`;
        wallpaper_now = 'Sonoma-Day';
        wallpaperId.innerHTML = 'Sonoma';
        wallpaperLooking.src = `./images/Sonoma-Day.jpg`;
        setTopbar('white');
    } else if (wallpaper == 'sequoia') {
        bg.style.backgroundImage = `url(./images/Sequoia-Day.jpg)`;
        wallpaper_now = 'Sequoia-Day';
        wallpaperId.innerHTML = 'Sequoia';
        wallpaperLooking.src = `./images/Sequoia-Day.jpg`;
        setTopbar('black');
    } else if (wallpaper == 'auto') {
        let now = new Date();
        let hours = now.getHours().toString().padStart(2, '0');
        if (hours >= 19) {
            wallpaper_now = wallpaper_now.replace("Day", "Night");
            bg.style.backgroundImage = `url(./images/${wallpaper_now}.jpg)`;
            wallpaperLooking.src = `./images/${wallpaper_now}.jpg`;
            setTopbar('white');
        } else if (hours < 5) {
            wallpaper_now = wallpaper_now.replace("Day", "Night");
            bg.style.backgroundImage = `url(./images/${wallpaper_now}.jpg)`;
            wallpaperLooking.src = `./images/${wallpaper_now}.jpg`;
            setTopbar('white');
        } else {
            wallpaper_now = wallpaper_now.replace("Night", "Day");
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
        bg.style.backgroundImage = `url(./images/${wallpaper_now}.jpg)`;
        wallpaperLooking.src = `./images/${wallpaper_now}.jpg`;
        if (wallpaper_now == 'Sonoma-Day') {
            setTopbar('white');
        } else {
            setTopbar('black');
        }
    } else if (wallpaper == 'night') {
        wallpaper_now = wallpaper_now.replace("Day", "Night");
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

function selectWindowInit() {
    const windows = document.querySelectorAll('.window');
    let maxZIndex = 2;

    windows.forEach(win => {
        win.addEventListener('mousedown', function () {
            // Update maxZIndex
            maxZIndex *= 2;
            win.style.zIndex = maxZIndex; // Set the new z-index of the window

            // If the window is the settings window
            if (win.id == 'settings') {
                topbarText("System Preferences", "File", "Edit", "View", "Window", "Help", "", "", "", "");
            }
            // If the window is the Safari browser window
            else if (win.id == 'safari-window') {
                topbarText("Safari", "File", "Edit", "View", "History", "Bookmarks", "Window", "Help", "", "");
            }
            else if (win.id == 'freeform-window') {
                topbarText("Freeform", "File", "Edit", "View", "Window", "Help", "", "", "", "");
            }
            else if (win.id == 'note-window') {
                topbarText("Notes", "File", "Edit", "View", "Window", "Help", "", "", "", "");
            }
            else if (win.id == 'map-window') {
                topbarText("Maps", "File", "Edit", "View", "Window", "Help", "", "", "", "");
            }
            // If it's any other window
            else {
                topbarText("Finder", "File", "Edit", "View", "Go", "Window", "Help", "", "", "");
            }
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
