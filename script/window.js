function getElementByZIndex(zIndex) {
    const allElements = document.querySelectorAll('div');
    for (const element of allElements) {
        const elementZIndex = window.getComputedStyle(element).zIndex;
        if (elementZIndex === zIndex) {
            return element;
        }
    }
    return null;
}

let finder_code = `
<div id="sidebar"></div>
<div id="edge"></div>
<div id="content"></div>
<div id="toolbar">
    <div id="win-tool">
        <div id="close" onclick='exit("#finder", "finder")'></div>
        <div id="minimize" onclick="small('finder')"></div>
        <div id="zoom" onclick='big("finder")'></div>
    </div>
    <div id="toolbar-right-content">
        <div id="back-for-ward">
            <img id="wards" src="./images/chevron.backward.png" />
            <img id="wards" src="./images/chevron.forward.png" style="margin: 0;" />
        </div>
        <p id="title">Title</p>
        <div id="right-tools">
            <div id="item">
                <img src="./images/magnifyingglass.png" width="20" height="20" />
            </div>
        </div>
        <div id="toolbar-bottom-border"></div>
    </div>
</div>`;

let settings_code = `
<div id="sidebar">
    <div id="win-tool" style="top: 10px; left: 10px">
        <div id="close" onclick='exit("#settings", "settings")'></div>
        <div id="minimize" onclick="small('settings')"></div>
        <div id="zoom" onclick='big("settings")'></div>
    </div>
</div>
<div id="divider-edge"></div>
<div id="main">
    <div style="display: flex; flex-direction: row;">
        <img id="by-looking-new" src="./images/Sequoia-Day.jpg" width="160" height="90"
            style="border-radius: 8px; border: solid 3px white" />
        <div style="display: flex; flex-direction: column; justify-content: center;">
            <section id="content-frame" style="width: 305px; margin-top: 0;">
                <p id="wallpaper-looking-new">Sequoia</p>
                <div
                    style="display: flex; flex-direction: row; justify-content: center; align-items: center;">
                    <div id="btn" onclick="change_wall('auto')">Auto</div>
                    <div id="btn" onclick="change_wall('day')">Light</div>
                    <div id="btn" onclick="change_wall('night')">Dark</div>
                </div>
            </section>
            <section id="content-frame" style="width: 305px;">
                <p id="wallpaper-looking">Show as Screen Saver</p>
                <div
                    style="display: flex; flex-direction: row; justify-content: center; align-items: center;">
                    <div id="btn">Off</div>
                </div>
            </section>
            <section id="content-frame" style="width: 305px; margin-bottom: auto; margin-top: 0;">
                <p id="wallpaper-looking">Show Across All Desktops</p>
                <div
                    style="display: flex; flex-direction: row; justify-content: center; align-items: center;">
                    <div id="btn">On</div>
                </div>
            </section>
        </div>
    </div>
    <section id="content-frame">
        <p id="sub-title">Wallpaper</p>
        <div style="display: flex; flex-direction: row; justify-content: center; align-items: center;">
            <div id="btn" onclick="change_wall('bigsur')">Big Sur</div>
            <div id="btn" onclick="change_wall('monterey')">Monterey</div>
            <div id="btn" onclick="change_wall('ventura')">Ventura</div>
            <div id="btn" onclick="change_wall('sonoma')">Sonoma</div>
            <div id="btn" onclick="change_wall('sequoia')">Sequoia</div>
        </div>
    </section>
    <section id="content-frame">
        <p id="sub-title">Automatically Hide and Show Dock</p>
        <div style="display: flex; flex-direction: row; justify-content: center; align-items: center;">
            <div id="btn" onclick="setDock('hidden')" id="open-dock-hidden">Enable</div>
        </div>
    </section>
    <section id="content-frame">
        <p id="sub-title">Dock Magnification</p>
        <div style="display: flex; flex-direction: row; justify-content: center; align-items: center;">
            <div id="btn" onclick="setDockZoom(true)" id="open-dock-hidden">Enable</div>
            <div id="btn" onclick="setDockZoom(false)" id="open-dock-hidden">Disable</div>
        </div>
    </section>
    <section id="content-frame">
        <p id="sub-title">Appearance</p>
        <div style="display: flex; flex-direction: row; justify-content: center; align-items: center;">
            <div id="btn" onclick="theme('light')" id="open-dock-hidden">Light</div>
            <div id="btn" onclick="theme('dark')" id="open-dock-hidden">Dark</div>
        </div>
    </section>
</div>`;


let safari_code = `<div id="safari-topbar">
    <div id="win-tool">
        <div id="close" onclick='exit("#safari-window", "safari")'></div>
        <div id="minimize" onclick="small('safari-window')"></div>
        <div id="zoom" onclick='big("safari-window")'></div>
    </div>
    <!-- <div id="page-using">
            <img src="./images/chevron.backward.png" style="margin-right: 8px; width: 13px; height: 16px" />
            <img src="./images/chevron.forward.png" style="width: 13px; height: 16px" />
        </div>
        <div id="page-tool"></div>
        <img src="./images/plus@10x.png" width="20" height="20" /> -->
    </div>
    <iframe id="main-safari" src="https://google.com">
    </iframe>`;

let freeform_code = `<div id="freeform-topbar">
    <div id="win-tool">
        <div id="close" onclick='exit("#freeform-window", "freeform")'></div>
        <div id="minimize" onclick="small('freeform-window')"></div>
        <div id="zoom" onclick='big("freeform-window")'></div>
    </div>
    <div id="page-tool"></div>
</div>
<iframe id="main-freeform" src="./freeform.html">
</iframe>`;

let notes_code = `<div id="note-topbar">
    <div id="win-tool">
        <div id="close" onclick='exit("#note-window", "notes")'></div>
        <div id="minimize" onclick="small('note-window')"></div>
        <div id="zoom" onclick='big("note-window")'></div>
    </div>
    <div id="page-tool"></div>
</div>
<iframe id="main-note" src="./note/note.html">
</iframe>`;

let maps_code = `<div id="map-topbar">
    <div id="win-tool">
        <div id="close" onclick='exit("#map-window", "maps")'></div>
        <div id="minimize" onclick="small('map-window')"></div>
        <div id="zoom" onclick='big("map-window")'></div>
    </div>
    <div id="page-tool"></div>
</div>
<iframe id="main-map" src="https://maps.apple.com">
</iframe>`;

let hardware_code = `<div id="win-tool" style="margin-top: 8px; margin-left: 8px;">
    <div id="close" onclick="exit('#hardware', 'hardware')"></div>
    <div id="none" style="margin: 0;"></div>
    <div id="none"></div>
</div>
<img src="./images/com.apple.macpro-2019 2.png" alt="macpro-2019" />
<h2>Mac Pro</h2>
<h5 style="margin-top: 20px; opacity: 0.7;" class="year">2023</h5>
<h5 style="top: 55%; opacity: 0.7; left: calc(30% - 65px)">Processor</h5>
<h5 style="top: 55%; opacity: 0.8;">3.5GHz Apple M2 Ultra</h5>
<h5 style="top: 59%; opacity: 0.7; left: calc(30% - 65px)">Graphics</h5>
<h5 style="top: 59%; opacity: 0.8;">60-core GPU</h5>
<h5 style="top: 63%; opacity: 0.7; left: calc(30% - 55px)">Memory</h5>
<h5 style="top: 63%; opacity: 0.8;">64 GB unified memory</h5>
<h5 style="top: 67%; opacity: 0.7; left: calc(30% - 75px)">Startup disk</h5>
<h5 style="top: 67%; opacity: 0.8;">Macintosh HD</h5>
<h5 style="top: 71%; opacity: 0.7; left: calc(30% - 75px)">Serial number</h5>
<h5 style="top: 71%; opacity: 0.8;">CCSTDMACOSOL</h5>
<h5 style="top: 75%; opacity: 0.7; left: calc(30% - 70px)">macOS</h5>
<h5 style="top: 75%; opacity: 0.8;">Sequoia 15.0</h5>
<h5
    style="text-align: center; top: 87.5%; left: 50%; opacity: 0.6; transform: translate(-50%, -50%); width: 100%; height: auto; ">
    ™ © 1983-2024 Apple Inc.<br>All rights reserved</h5>`;
