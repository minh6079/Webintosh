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
<div class="finder-shell">
    <div class="finder-toolbar">
        <div class="finder-toolbar-left">
            <div id="win-tool">
                <div id="close" onclick='exit("#finder", "finder")'></div>
                <div id="minimize" onclick="small('finder')"></div>
                <div id="zoom" onclick='big("finder")'></div>
            </div>
            <div class="finder-nav">
                <button class="finder-tool-button" data-action="back" title="Back">
                    <span class="finder-arrow" aria-hidden="true">‹</span>
                </button>
                <button class="finder-tool-button" data-action="forward" title="Forward">
                    <span class="finder-arrow" aria-hidden="true">›</span>
                </button>
            </div>
            <div class="finder-title">Pictures</div>
        </div>
        <div class="finder-toolbar-right">
            <div class="finder-menu-wrap">
                <button class="finder-tool-button" data-action="new-menu" title="New">New</button>
                <div class="finder-menu finder-new-menu">
                    <button type="button" data-action="new-folder">New Folder</button>
                    <button type="button" data-action="new-text">New Text File</button>
                </div>
            </div>
            <div class="finder-menu-wrap">
                <button class="finder-tool-button" data-action="import-menu" title="Import">Import</button>
                <div class="finder-menu finder-import-menu">
                    <button type="button" data-action="import-files">Import Files</button>
                    <button type="button" data-action="import-folder">Import Folder</button>
                </div>
            </div>
            <div class="finder-search">
                <img src="./images/magnifyingglass.png" alt="Search" />
                <input class="finder-search-input" type="text" placeholder="Search" />
            </div>
        </div>
    </div>
    <div class="finder-body">
        <aside class="finder-sidebar">
            <div class="finder-sidebar-section">
                <div class="finder-sidebar-title">Favorites</div>
                <button class="finder-sidebar-item" data-path="__recents__">Recents</button>
                <button class="finder-sidebar-item" data-path="/Applications">Applications</button>
                <button class="finder-sidebar-item" data-path="/Desktop">Desktop</button>
                <button class="finder-sidebar-item" data-path="/Documents">Documents</button>
                <button class="finder-sidebar-item" data-path="/Downloads">Downloads</button>
                <button class="finder-sidebar-item" data-path="/Notes">Notes</button>
                <button class="finder-sidebar-item" data-path="/Pictures">Pictures</button>
            </div>
            <div class="finder-sidebar-section">
                <div class="finder-sidebar-title">Locations</div>
                <button class="finder-sidebar-item" data-path="/">Macintosh HD</button>
            </div>
            <div class="finder-sidebar-section">
                <div class="finder-sidebar-title">Trash</div>
                <button class="finder-sidebar-item" data-path="/Trash">Trash</button>
            </div>
        </aside>
        <div class="finder-divider"></div>
        <section class="finder-content">
            <div class="finder-table-header">
                <div class="finder-cell name">Name</div>
                <div class="finder-cell modified">Date Modified</div>
                <div class="finder-cell size">Size</div>
                <div class="finder-cell kind">Kind</div>
            </div>
            <div class="finder-table-body"></div>
        </section>
        <aside class="finder-preview">
            <div class="finder-preview-media"></div>
            <div class="finder-preview-details">
                <div class="finder-preview-title">No Selection</div>
                <div class="finder-preview-subtitle">Choose a file to preview</div>
                <div class="finder-preview-info"></div>
            </div>
        </aside>
    </div>
    <div class="finder-context-menu">
        <button type="button" data-action="context-restore">Restore</button>
        <button type="button" data-action="context-send-notes">Send to Notes</button>
        <button type="button" data-action="context-empty-trash">Empty Trash</button>
        <div class="finder-menu-divider"></div>
        <button type="button" data-action="context-new-folder">New Folder</button>
        <button type="button" data-action="context-new-text">New Text File</button>
        <div class="finder-menu-divider"></div>
        <button type="button" data-action="context-rename">Rename</button>
        <button type="button" data-action="context-delete">Delete</button>
    </div>
    <input class="finder-upload-input" type="file" multiple />
    <input class="finder-folder-input" type="file" webkitdirectory directory multiple />
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
