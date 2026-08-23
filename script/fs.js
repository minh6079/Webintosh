// Shared File System - IndexedDB backed, used by both Finder and Terminal
const FS_DB_NAME = "webintosh-fs";
const FS_DB_VERSION = 1;

function openFsDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(FS_DB_NAME, FS_DB_VERSION);
        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("items")) {
                const store = db.createObjectStore("items", { keyPath: "path" });
                store.createIndex("parentPath", "parentPath", { unique: false });
                store.createIndex("name", "name", { unique: false });
                store.createIndex("type", "type", { unique: false });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function withStore(db, mode = "readonly") {
    return db.transaction("items", mode).objectStore("items");
}

function formatSize(bytes) {
    if (!bytes || bytes <= 0) return "--";
    const units = ["B", "KB", "MB", "GB"];
    let value = bytes, unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex++;
    }
    return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

async function listItems(db, parentPath) {
    return new Promise((resolve, reject) => {
        const store = withStore(db);
        const index = store.index("parentPath");
        const request = index.getAll(parentPath);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

async function getItem(db, path) {
    return new Promise((resolve, reject) => {
        const store = withStore(db);
        const request = store.get(path);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

async function putItem(db, item) {
    return new Promise((resolve, reject) => {
        const store = withStore(db, "readwrite");
        const request = store.put(item);
        request.onsuccess = resolve;
        request.onerror = () => reject(request.error);
    });
}

async function deleteItem(db, path) {
    return new Promise((resolve, reject) => {
        const store = withStore(db, "readwrite");
        const request = store.delete(path);
        request.onsuccess = resolve;
        request.onerror = () => reject(request.error);
    });
}

async function deleteRecursive(db, path) {
    const items = await listAll(db);
    const targets = items.filter(i => i.path === path || i.path.startsWith(path + "/"));
    for (const item of targets) {
        await deleteItem(db, item.path);
    }
}

async function listAll(db) {
    return new Promise((resolve, reject) => {
        const store = withStore(db);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

async function ensureUniquePath(db, parentPath, name) {
    let candidate = `${parentPath === "/" ? "" : parentPath}/${name}`;
    while (await getItem(db, candidate)) {
        const parts = name.split(".");
        const ext = parts.pop();
        const stem = parts.join(".");
        const match = stem.match(/^(.+) \((\d+)\)$/);
        const num = match ? parseInt(match[2]) + 1 : 2;
        name = `${match ? match[1] : stem} (${num}).${ext}`;
        candidate = `${parentPath === "/" ? "" : parentPath}/${name}`;
    }
    return candidate;
}

async function seedFsIfNeeded(db) {
    const store = withStore(db, "readonly");
    const count = await new Promise((resolve, reject) => {
        const req = store.count();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
    if (count > 0) return;

    const now = Date.now();
    const tx = db.transaction("items", "readwrite");
    const writeStore = tx.objectStore("items");

    // Root folders
    const rootItems = [
        { path: "/Applications", parentPath: "/", name: "Applications", type: "folder", kind: "Folder", size: 0, createdAt: now, modifiedAt: now },
        { path: "/Desktop", parentPath: "/", name: "Desktop", type: "folder", kind: "Folder", size: 0, createdAt: now, modifiedAt: now },
        { path: "/Documents", parentPath: "/", name: "Documents", type: "folder", kind: "Folder", size: 0, createdAt: now, modifiedAt: now },
        { path: "/Downloads", parentPath: "/", name: "Downloads", type: "folder", kind: "Folder", size: 0, createdAt: now, modifiedAt: now },
        { path: "/Notes", parentPath: "/", name: "Notes", type: "folder", kind: "Folder", size: 0, createdAt: now, modifiedAt: now },
        { path: "/Trash", parentPath: "/", name: "Trash", type: "folder", kind: "Folder", size: 0, createdAt: now, modifiedAt: now },
        { path: "/Pictures", parentPath: "/", name: "Pictures", type: "folder", kind: "Folder", size: 0, createdAt: now, modifiedAt: now },
    ];

    // App bundle files (.app) - these are "files" that launch apps
    const apps = [
        { name: "Finder.app", appId: "Finder", icon: "./dock/Finder.png" },
        { name: "Launchpad.app", appId: "Launchpad", icon: "./dock/Launchpad.png" },
        { name: "Safari.app", appId: "Safari", icon: "./dock/Safari.png" },
        { name: "Mail.app", appId: "Mail", icon: "./dock/Mail.png" },
        { name: "Messages.app", appId: "Messages", icon: "./dock/Messages.png" },
        { name: "Maps.app", appId: "Maps", icon: "./dock/Maps.png" },
        { name: "Photos.app", appId: "Photos", icon: "./dock/Photos.png" },
        { name: "FaceTime.app", appId: "FaceTime", icon: "./dock/FaceTime.png" },
        { name: "Calendar.app", appId: "Calendar", icon: "./dock/Calendar.png" },
        { name: "Contacts.app", appId: "Contacts", icon: "./dock/Contacts.png" },
        { name: "Reminders.app", appId: "Reminders", icon: "./dock/Reminders.png" },
        { name: "Notes.app", appId: "Notes", icon: "./dock/Notes.png" },
        { name: "Freeform.app", appId: "Freeform", icon: "./dock/Freeform.png" },
        { name: "TV.app", appId: "TV", icon: "./dock/TV.png" },
        { name: "Music.app", appId: "Music", icon: "./dock/Music.png" },
        { name: "Terminal.app", appId: "Terminal", icon: "./dock/Terminal.png" },
        { name: "Calculator.app", appId: "Calculator", icon: "./images/AppIcon 105.png" },
        { name: "App Store.app", appId: "App Store", icon: "./dock/App Store.png" },
        { name: "System Settings.app", appId: "Settings", icon: "./dock/System Preferences.png" },
    ];

    const appItems = apps.map(app => ({
        path: `/Applications/${app.name}`,
        parentPath: "/Applications",
        name: app.name,
        type: "file",
        mime: "application/x-webintosh-app",
        kind: "Application",
        size: 1024,
        createdAt: now,
        modifiedAt: now,
        appId: app.appId,
        icon: app.icon
    }));

    const sampleItems = [
        {
            path: "/Pictures/Sequoia Day.jpg",
            parentPath: "/Pictures",
            name: "Sequoia Day.jpg",
            type: "file",
            mime: "image/jpeg",
            kind: "JPEG image",
            size: 3900000,
            modifiedAt: now - 1000 * 60 * 60 * 24 * 3,
            createdAt: now - 1000 * 60 * 60 * 24 * 3,
            previewUrl: "./images/Sequoia-Day.jpg"
        },
        {
            path: "/Pictures/Sequoia Night.jpg",
            parentPath: "/Pictures",
            name: "Sequoia Night.jpg",
            type: "file",
            mime: "image/jpeg",
            kind: "JPEG image",
            size: 3200000,
            modifiedAt: now - 1000 * 60 * 60 * 24 * 7,
            createdAt: now - 1000 * 60 * 60 * 24 * 7,
            previewUrl: "./images/Sequoia-Night.jpg"
        },
        {
            path: "/Pictures/Wallpapers",
            parentPath: "/Pictures",
            name: "Wallpapers",
            type: "folder",
            kind: "Folder",
            size: 0,
            modifiedAt: now - 1000 * 60 * 60 * 24 * 15,
            createdAt: now - 1000 * 60 * 60 * 24 * 15
        },
        {
            path: "/Documents/README.txt",
            parentPath: "/Documents",
            name: "README.txt",
            type: "file",
            mime: "text/plain",
            kind: "Text file",
            size: 1200,
            modifiedAt: now - 1000 * 60 * 60 * 24,
            createdAt: now - 1000 * 60 * 60 * 24,
            content: "Welcome to Webintosh!\n\nThis is a shared file system between Finder and Terminal.\n\nTry:\n  ls /Applications\n  open /Applications/Safari.app\n  cat /Documents/README.txt"
        },
        {
            path: "/Documents/projects",
            parentPath: "/Documents",
            name: "projects",
            type: "folder",
            kind: "Folder",
            size: 0,
            modifiedAt: now - 1000 * 60 * 60 * 48,
            createdAt: now - 1000 * 60 * 60 * 48
        },
        {
            path: "/Documents/projects/hello.js",
            parentPath: "/Documents/projects",
            name: "hello.js",
            type: "file",
            mime: "application/javascript",
            kind: "JavaScript file",
            size: 250,
            modifiedAt: now - 1000 * 60 * 60 * 12,
            createdAt: now - 1000 * 60 * 60 * 12,
            content: "console.log('Hello from Webintosh!');\n\n// This file is visible in both Finder and Terminal\nconst msg = 'Shared file system works!';"
        },
        {
            path: "/Downloads/example.pdf",
            parentPath: "/Downloads",
            name: "example.pdf",
            type: "file",
            mime: "application/pdf",
            kind: "PDF document",
            size: 1024000,
            modifiedAt: now - 1000 * 60 * 60 * 6,
            createdAt: now - 1000 * 60 * 60 * 6
        },
        {
            path: "/Notes/quick-note.txt",
            parentPath: "/Notes",
            name: "quick-note.txt",
            type: "file",
            mime: "text/plain",
            kind: "Text file",
            size: 500,
            modifiedAt: now - 1000 * 60 * 60 * 2,
            createdAt: now - 1000 * 60 * 60 * 2,
            content: "Quick note:\n- Finder and Terminal now share the same files\n- Double-click .app files in Finder to launch apps\n- Use 'open' command in Terminal"
        },
        {
            path: "/Documents/notes.md",
            parentPath: "/Documents",
            name: "notes.md",
            type: "file",
            mime: "text/markdown",
            kind: "Markdown file",
            size: 800,
            modifiedAt: now - 1000 * 60 * 60 * 5,
            createdAt: now - 1000 * 60 * 60 * 5,
            content: "# Webintosh Notes\n\n## Features\n- Shared file system (IndexedDB)\n- Finder integration\n- Terminal with real FS\n- App bundles in /Applications\n\n## Commands to try\n```bash\nls /Applications\nopen /Applications/Safari.app\ncat /Documents/README.txt\n```"
        },
        {
            path: "/Documents/projects/package.json",
            parentPath: "/Documents/projects",
            name: "package.json",
            type: "file",
            mime: "application/json",
            kind: "JSON file",
            size: 450,
            modifiedAt: now - 1000 * 60 * 60 * 10,
            createdAt: now - 1000 * 60 * 60 * 10,
            content: "{\n  \"name\": \"webintosh-project\",\n  \"version\": \"1.0.0\",\n  \"description\": \"Sample project\",\n  \"main\": \"hello.js\",\n  \"scripts\": {\n    \"start\": \"node hello.js\"\n  }\n}"
        },
        {
            path: "/Documents/projects/style.css",
            parentPath: "/Documents/projects",
            name: "style.css",
            type: "file",
            mime: "text/css",
            kind: "CSS file",
            size: 320,
            modifiedAt: now - 1000 * 60 * 60 * 8,
            createdAt: now - 1000 * 60 * 60 * 8,
            content: "/* Webintosh project styles */\nbody {\n  font-family: -apple-system, sans-serif;\n  background: #f5f5f7;\n  color: #1d1d1f;\n}\n.app-icon {\n  width: 48px;\n  height: 48px;\n}"
        },
        {
            path: "/Downloads/sample-image.png",
            parentPath: "/Downloads",
            name: "sample-image.png",
            type: "file",
            mime: "image/png",
            kind: "PNG image",
            size: 204800,
            modifiedAt: now - 1000 * 60 * 60 * 4,
            createdAt: now - 1000 * 60 * 60 * 4,
            previewUrl: "./images/Sequoia-Day.jpg"
        },
        {
            path: "/Desktop/Todo.txt",
            parentPath: "/Desktop",
            name: "Todo.txt",
            type: "file",
            mime: "text/plain",
            kind: "Text file",
            size: 200,
            modifiedAt: now - 1000 * 60 * 60,
            createdAt: now - 1000 * 60 * 60,
            content: "- Explore Finder\n- Try Terminal commands\n- Open Safari.app\n- Check /Applications folder"
        }
    ];

    rootItems.forEach(item => writeStore.add(item));
    appItems.forEach(item => writeStore.add(item));
    sampleItems.forEach(item => writeStore.add(item));

    return new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
}

// Terminal-specific helpers
// Get all files from shared FS in format expected by just-bash InMemoryFs
// (just-bash auto-creates parent directories from file paths)
// Also adds .keep files for empty folders so they appear in terminal
async function getFilesForTerminal(db) {
    const items = await listAll(db);
    const files = {};
    const folders = new Set(['/']); // Track all folders

    // First pass: collect all folders from items
    for (const item of items) {
        if (item.type === "folder") {
            folders.add(item.path);
        } else if (item.type === "file") {
            // Add parent folders of each file
            const parts = item.path.split('/').filter(Boolean);
            for (let i = 1; i <= parts.length; i++) {
                folders.add('/' + parts.slice(0, i).join('/'));
            }
        }
    }

    // Add .keep files for all folders (including empty ones)
    // This ensures just-bash creates the directory structure
    for (const folder of folders) {
        const keepPath = folder === '/' ? '/.keep' : folder + '/.keep';
        files[keepPath] = '';
    }

    // Second pass: add actual file contents
    for (const item of items) {
        if (item.type === "file") {
            if (item.content !== undefined && typeof item.content === "string") {
                files[item.path] = item.content;
            } else if (item.data && typeof item.data.text === "function") {
                try {
                    files[item.path] = await item.data.text();
                } catch (e) {
                    console.warn('[FS] Failed to read file content:', item.path, e);
                }
            }
        }
    }
    return files;
}

// Launch an app from a .app file
function launchApp(appId) {
    if (typeof OpenApp === "function") {
        // Find the dock icon and trigger it
        const img = document.querySelector(`.icns img[alt="${appId}"]`);
        if (img) {
            OpenApp(img, getNextWindowZIndex ? getNextWindowZIndex() : 100);
        }
    }
}

window.FS = {
    openDb: openFsDb,
    seedIfNeeded: seedFsIfNeeded,
    listItems,
    getItem,
    putItem,
    deleteItem,
    deleteRecursive,
    listAll,
    ensureUniquePath,
    formatSize,
    launchApp,
    getFilesForTerminal
};