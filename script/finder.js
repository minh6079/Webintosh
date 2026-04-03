const FINDER_DB_NAME = "webintosh-finder";
const FINDER_DB_VERSION = 1;

function openFinderDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(FINDER_DB_NAME, FINDER_DB_VERSION);
        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("items")) {
                const store = db.createObjectStore("items", { keyPath: "path" });
                store.createIndex("parentPath", "parentPath", { unique: false });
                store.createIndex("modifiedAt", "modifiedAt", { unique: false });
                store.createIndex("name", "name", { unique: false });
            }
        };
        request.onsuccess = function () {
            resolve(request.result);
        };
        request.onerror = function () {
            reject(request.error);
        };
    });
}

function withStore(db, mode) {
    return db.transaction("items", mode).objectStore("items");
}

function seedFinderIfNeeded(db) {
    return new Promise((resolve, reject) => {
        const store = withStore(db, "readonly");
        const countRequest = store.count();
        countRequest.onsuccess = function () {
            if (countRequest.result > 0) {
                resolve();
                return;
            }
            const tx = db.transaction("items", "readwrite");
            const writeStore = tx.objectStore("items");
            const now = Date.now();
            const rootItems = [
                { path: "/Applications", parentPath: "/", name: "Applications", type: "folder" },
                { path: "/Desktop", parentPath: "/", name: "Desktop", type: "folder" },
                { path: "/Documents", parentPath: "/", name: "Documents", type: "folder" },
                { path: "/Downloads", parentPath: "/", name: "Downloads", type: "folder" },
                { path: "/Notes", parentPath: "/", name: "Notes", type: "folder" },
                { path: "/Trash", parentPath: "/", name: "Trash", type: "folder" },
                { path: "/Pictures", parentPath: "/", name: "Pictures", type: "folder" }
            ];

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
                    modifiedAt: now - 1000 * 60 * 60 * 24 * 15,
                    createdAt: now - 1000 * 60 * 60 * 24 * 15
                }
            ];

            rootItems.forEach((item) => {
                writeStore.add({
                    ...item,
                    kind: "Folder",
                    size: 0,
                    createdAt: now,
                    modifiedAt: now
                });
            });
            sampleItems.forEach((item) => writeStore.add(item));
            tx.oncomplete = function () {
                resolve();
            };
            tx.onerror = function () {
                reject(tx.error);
            };
        };
        countRequest.onerror = function () {
            reject(countRequest.error);
        };
    });
}

function formatSize(bytes) {
    if (!bytes || bytes <= 0) {
        return "--";
    }
    const units = ["B", "KB", "MB", "GB"];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }
    return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDate(timestamp) {
    if (!timestamp) {
        return "--";
    }
    const date = new Date(timestamp);
    const dateText = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
    const timeText = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit"
    });
    return `${dateText} at ${timeText}`;
}

function titleFromPath(path) {
    if (!path || path === "/") {
        return "Finder";
    }
    const parts = path.split("/").filter(Boolean);
    return parts[parts.length - 1];
}

function pathSegments(path) {
    if (!path || path === "/") {
        return [{ name: "Macintosh HD", path: "/" }];
    }
    const parts = path.split("/").filter(Boolean);
    const segments = [{ name: "Macintosh HD", path: "/" }];
    let current = "";
    parts.forEach((part) => {
        current += `/${part}`;
        segments.push({ name: part, path: current });
    });
    return segments;
}

function getKind(item) {
    if (item.type === "folder") {
        return "Folder";
    }
    if (item.kind) {
        return item.kind;
    }
    if (item.mime && item.mime.startsWith("image/")) {
        return `${item.mime.split("/")[1].toUpperCase()} image`;
    }
    return "Document";
}

function clearChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function withSuffix(name, suffix) {
    if (!suffix) {
        return name;
    }
    const parts = name.split(".");
    if (parts.length > 1) {
        const ext = parts.pop();
        const stem = parts.join(".");
        return `${stem} (${suffix}).${ext}`;
    }
    return `${name} (${suffix})`;
}

function makeUniquePath(usedPaths, parentPath, name) {
    let suffix = 0;
    let candidate = `${parentPath === "/" ? "" : parentPath}/${name}`;
    while (usedPaths.has(candidate)) {
        suffix += 1;
        const nextName = withSuffix(name, suffix);
        candidate = `${parentPath === "/" ? "" : parentPath}/${nextName}`;
    }
    usedPaths.add(candidate);
    return { path: candidate, name: candidate.split("/").pop() };
}

async function listItems(db, parentPath) {
    return new Promise((resolve, reject) => {
        const store = withStore(db, "readonly");
        const index = store.index("parentPath");
        const request = index.getAll(parentPath);
        request.onsuccess = function () {
            resolve(request.result || []);
        };
        request.onerror = function () {
            reject(request.error);
        };
    });
}

async function listRecents(db) {
    return new Promise((resolve, reject) => {
        const store = withStore(db, "readonly");
        const request = store.getAll();
        request.onsuccess = function () {
            const items = (request.result || [])
                .filter((item) => item.type !== "folder" && !item.isTrashed)
                .sort((a, b) => (b.modifiedAt || 0) - (a.modifiedAt || 0))
                .slice(0, 30);
            resolve(items);
        };
        request.onerror = function () {
            reject(request.error);
        };
    });
}

async function ensureUniquePath(db, parentPath, name) {
    const baseName = name;
    let suffix = 0;
    let candidate = `${parentPath === "/" ? "" : parentPath}/${name}`;
    while (true) {
        const exists = await new Promise((resolve) => {
            const store = withStore(db, "readonly");
            const request = store.get(candidate);
            request.onsuccess = function () {
                resolve(!!request.result);
            };
            request.onerror = function () {
                resolve(false);
            };
        });
        if (!exists) {
            return candidate;
        }
        suffix += 1;
        const nameParts = baseName.split(".");
        if (nameParts.length > 1) {
            const ext = nameParts.pop();
            const stem = nameParts.join(".");
            name = `${stem} (${suffix}).${ext}`;
        } else {
            name = `${baseName} (${suffix})`;
        }
        candidate = `${parentPath === "/" ? "" : parentPath}/${name}`;
    }
}

function getItemFromStore(store, path) {
    return new Promise((resolve, reject) => {
        const request = store.get(path);
        request.onsuccess = function () {
            resolve(request.result || null);
        };
        request.onerror = function () {
            reject(request.error);
        };
    });
}

async function ensureUniquePathInStore(store, parentPath, name) {
    const baseName = name;
    let suffix = 0;
    let candidate = `${parentPath === "/" ? "" : parentPath}/${name}`;
    while (true) {
        // eslint-disable-next-line no-await-in-loop
        const exists = await getItemFromStore(store, candidate);
        if (!exists) {
            return candidate;
        }
        suffix += 1;
        const nameParts = baseName.split(".");
        if (nameParts.length > 1) {
            const ext = nameParts.pop();
            const stem = nameParts.join(".");
            name = `${stem} (${suffix}).${ext}`;
        } else {
            name = `${baseName} (${suffix})`;
        }
        candidate = `${parentPath === "/" ? "" : parentPath}/${name}`;
    }
}

async function ensureFolderInStore(store, folderPath, parentPath, name, now) {
    const existing = await getItemFromStore(store, folderPath);
    if (existing) {
        return;
    }
    store.add({
        path: folderPath,
        parentPath,
        name,
        type: "folder",
        kind: "Folder",
        size: 0,
        createdAt: now,
        modifiedAt: now
    });
}

async function addFilesToDb(db, parentPath, files) {
    const tx = db.transaction("items", "readwrite");
    const store = tx.objectStore("items");
    const now = Date.now();

    for (const file of Array.from(files)) {
        const relativePath = file.webkitRelativePath && file.webkitRelativePath.includes("/")
            ? file.webkitRelativePath
            : file.name;
        const parts = relativePath.split("/").filter(Boolean);
        let currentParent = parentPath;

        for (let i = 0; i < parts.length - 1; i += 1) {
            const folderName = parts[i];
            const folderPath = `${currentParent === "/" ? "" : currentParent}/${folderName}`;
            // eslint-disable-next-line no-await-in-loop
            await ensureFolderInStore(store, folderPath, currentParent, folderName, now);
            currentParent = folderPath;
        }

        const fileName = parts[parts.length - 1];
        // eslint-disable-next-line no-await-in-loop
        const uniquePath = await ensureUniquePathInStore(store, currentParent, fileName);
        const name = uniquePath.split("/").pop();
        const mime = file.type || "application/octet-stream";
        const mimeLabel = mime.split("/")[1] ? mime.split("/")[1].toUpperCase() : "File";
        const kind = mime.startsWith("image/") ? `${mimeLabel} image` : `${mimeLabel} file`;
        store.put({
            path: uniquePath,
            parentPath: currentParent,
            name,
            type: "file",
            mime,
            kind,
            size: file.size,
            modifiedAt: file.lastModified || now,
            createdAt: now,
            data: file
        });
    }

    return new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

async function createFolder(db, parentPath) {
    const now = Date.now();
    const uniquePath = await ensureUniquePath(db, parentPath, "New Folder");
    const name = uniquePath.split("/").pop();
    return new Promise((resolve, reject) => {
        const store = withStore(db, "readwrite");
        const request = store.add({
            path: uniquePath,
            parentPath,
            name,
            type: "folder",
            kind: "Folder",
            size: 0,
            createdAt: now,
            modifiedAt: now
        });
        request.onsuccess = resolve;
        request.onerror = reject;
    });
}

async function createTextFile(db, parentPath) {
    const now = Date.now();
    const uniquePath = await ensureUniquePath(db, parentPath, "New Text File.txt");
    const name = uniquePath.split("/").pop();
    const blob = new Blob([""], { type: "text/plain" });
    const data = typeof File !== "undefined" ? new File([blob], name, { type: "text/plain", lastModified: now }) : blob;
    return new Promise((resolve, reject) => {
        const store = withStore(db, "readwrite");
        const request = store.add({
            path: uniquePath,
            parentPath,
            name,
            type: "file",
            mime: "text/plain",
            kind: "Text file",
            size: blob.size,
            createdAt: now,
            modifiedAt: now,
            data
        });
        request.onsuccess = resolve;
        request.onerror = reject;
    });
}

function loadNotesFromStorage() {
    try {
        return JSON.parse(localStorage.getItem("notes")) || [];
    } catch (error) {
        return [];
    }
}

function saveNotesToStorage(nextNotes) {
    localStorage.setItem("notes", JSON.stringify(nextNotes));
}

async function createNoteFromTextFile(item) {
    const notesList = loadNotesFromStorage();
    const title = item.name.replace(/\.txt$/i, "");
    let content = "";
    if (item.data && typeof item.data.text === "function") {
        content = await item.data.text();
    }
    const newNote = {
        id: Date.now().toString(),
        title,
        content,
        date: new Date().toISOString()
    };
    notesList.push(newNote);
    saveNotesToStorage(notesList);
}

function isTrashView(root) {
    return root.finderState.currentPath === "/Trash";
}

async function moveItemToTrash(db, path) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("items", "readwrite");
        const store = tx.objectStore("items");
        const request = store.getAll();
        request.onsuccess = function () {
            const items = request.result || [];
            const now = Date.now();
            const usedPaths = new Set(items.map((item) => item.path));
            if (!usedPaths.has("/Trash")) {
                store.add({
                    path: "/Trash",
                    parentPath: "/",
                    name: "Trash",
                    type: "folder",
                    kind: "Folder",
                    size: 0,
                    createdAt: now,
                    modifiedAt: now
                });
                usedPaths.add("/Trash");
            }
            const targets = items.filter((item) => item.path === path || item.path.startsWith(`${path}/`));
            targets.forEach((item) => {
                if (item.path === "/Trash") {
                    return;
                }
                const unique = makeUniquePath(usedPaths, "/Trash", item.name);
                store.put({
                    ...item,
                    path: unique.path,
                    parentPath: "/Trash",
                    name: unique.name,
                    isTrashed: true,
                    originalPath: item.originalPath || item.path,
                    originalParentPath: item.originalParentPath || item.parentPath,
                    trashedAt: now
                });
                store.delete(item.path);
            });
        };
        request.onerror = function () {
            reject(request.error);
        };
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

async function restoreFromTrash(db, path) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("items", "readwrite");
        const store = tx.objectStore("items");
        const request = store.getAll();
        request.onsuccess = function () {
            const items = request.result || [];
            const target = items.find((item) => item.path === path);
            if (!target || !target.originalPath) {
                resolve();
                return;
            }
            const originalRoot = target.originalPath;
            const restoreAll = target.type === "folder";
            const toRestore = items.filter((item) => {
                if (!item.originalPath) {
                    return false;
                }
                if (restoreAll) {
                    return item.originalPath === originalRoot || item.originalPath.startsWith(`${originalRoot}/`);
                }
                return item.originalPath === originalRoot;
            });
            const remainingPaths = new Set(items.filter((item) => !toRestore.includes(item)).map((item) => item.path));
            let rootRestorePath = originalRoot;
            if (remainingPaths.has(rootRestorePath)) {
                const parentPath = target.originalParentPath || "/";
                const unique = makeUniquePath(remainingPaths, parentPath, target.name);
                rootRestorePath = unique.path;
            } else {
                remainingPaths.add(rootRestorePath);
            }
            toRestore.forEach((item) => {
                let newPath = item.originalPath;
                if (restoreAll) {
                    newPath = `${rootRestorePath}${item.originalPath.slice(originalRoot.length)}`;
                } else if (newPath !== rootRestorePath) {
                    newPath = rootRestorePath;
                }
                const parentPath = newPath.split("/").slice(0, -1).join("/") || "/";
                store.put({
                    ...item,
                    path: newPath,
                    parentPath,
                    name: newPath.split("/").pop(),
                    isTrashed: false,
                    trashedAt: null,
                    originalPath: null,
                    originalParentPath: null
                });
                store.delete(item.path);
            });
        };
        request.onerror = function () {
            reject(request.error);
        };
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

async function deleteItem(db, path) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("items", "readwrite");
        const store = tx.objectStore("items");
        const request = store.getAll();
        request.onsuccess = function () {
            const items = request.result || [];
            items.forEach((item) => {
                if (item.path === path || item.path.startsWith(`${path}/`)) {
                    store.delete(item.path);
                }
            });
        };
        request.onerror = function () {
            reject(request.error);
        };
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

function setSelection(root, item) {
    const state = root.finderState;
    state.selectedPath = item ? item.path : null;
    state.selectedItem = item || null;
    root.querySelectorAll(".finder-row").forEach((row) => {
        row.classList.toggle("selected", item && row.dataset.path === item.path);
    });
    renderPreview(root, item);
    updateContextMenuState(root);
}

function clearSelection(root) {
    setSelection(root, null);
}

async function emptyTrash(db) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("items", "readwrite");
        const store = tx.objectStore("items");
        const request = store.getAll();
        request.onsuccess = function () {
            const items = request.result || [];
            items.forEach((item) => {
                if (item.path === "/Trash" || item.path.startsWith("/Trash/")) {
                    if (item.path !== "/Trash") {
                        store.delete(item.path);
                    }
                }
            });
        };
        request.onerror = function () {
            reject(request.error);
        };
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

function updateContextMenuState(root) {
    const menu = root.querySelector(".finder-context-menu");
    if (!menu) {
        return;
    }
    const restoreButton = menu.querySelector("[data-action='context-restore']");
    const sendButton = menu.querySelector("[data-action='context-send-notes']");
    const emptyTrashButton = menu.querySelector("[data-action='context-empty-trash']");
    const renameButton = menu.querySelector("[data-action='context-rename']");
    const newFolderButton = menu.querySelector("[data-action='context-new-folder']");
    const newTextButton = menu.querySelector("[data-action='context-new-text']");
    const deleteButton = menu.querySelector("[data-action='context-delete']");
    const hasSelection = !!root.finderState.selectedPath;
    const inTrash = isTrashView(root);
    if (restoreButton) {
        restoreButton.style.display = inTrash ? "flex" : "none";
        restoreButton.disabled = !hasSelection;
    }
    if (sendButton) {
        sendButton.style.display = inTrash ? "none" : "flex";
        const item = root.finderState.selectedItem;
        const isText = item && item.type === "file" && (item.mime === "text/plain" || /\\.txt$/i.test(item.name));
        sendButton.disabled = !hasSelection || !isText;
    }
    if (emptyTrashButton) {
        emptyTrashButton.style.display = inTrash ? "flex" : "none";
        emptyTrashButton.disabled = false;
    }
    if (renameButton) {
        renameButton.style.display = inTrash ? "none" : "flex";
        renameButton.disabled = !hasSelection;
    }
    if (newFolderButton) {
        newFolderButton.style.display = inTrash ? "none" : "flex";
    }
    if (newTextButton) {
        newTextButton.style.display = inTrash ? "none" : "flex";
    }
    deleteButton.disabled = !hasSelection;
}

async function deleteSelection(root) {
    const state = root.finderState;
    if (!state.selectedPath) {
        return;
    }
    if (isTrashView(root)) {
        await deleteItem(state.db, state.selectedPath);
    } else {
        await moveItemToTrash(state.db, state.selectedPath);
    }
    clearSelection(root);
    await renderFolder(root);
}

async function renameSelectedTo(root, nextName) {
    const state = root.finderState;
    if (!state.selectedItem || !state.selectedPath) {
        return;
    }
    const currentName = state.selectedItem.name;
    if (!nextName || nextName.trim() === "" || nextName.trim() === currentName) {
        return;
    }
    const parentPath = state.selectedItem.parentPath || "/";
    const newName = nextName.trim();
    const newPath = `${parentPath === "/" ? "" : parentPath}/${newName}`;
    await new Promise((resolve, reject) => {
        const tx = state.db.transaction("items", "readwrite");
        const store = tx.objectStore("items");
        const request = store.getAll();
        request.onsuccess = function () {
            const items = request.result || [];
            const target = items.find((item) => item.path === state.selectedPath);
            if (!target) {
                resolve();
                return;
            }
            const usedPaths = new Set(items.map((item) => item.path));
            usedPaths.delete(state.selectedPath);
            let finalPath = newPath;
            if (usedPaths.has(finalPath)) {
                const unique = makeUniquePath(usedPaths, parentPath, newName);
                finalPath = unique.path;
            }
            const isFolder = target.type === "folder";
            items.forEach((item) => {
                if (item.path === state.selectedPath || (isFolder && item.path.startsWith(`${state.selectedPath}/`))) {
                    const suffix = item.path.slice(state.selectedPath.length);
                    const updatedPath = `${finalPath}${suffix}`;
                    const updatedParent = updatedPath.split("/").slice(0, -1).join("/") || "/";
                    store.put({
                        ...item,
                        path: updatedPath,
                        parentPath: updatedParent,
                        name: updatedPath.split("/").pop(),
                        modifiedAt: Date.now()
                    });
                    store.delete(item.path);
                }
            });
        };
        request.onerror = function () {
            reject(request.error);
        };
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
    clearSelection(root);
    await renderFolder(root);
}

function startInlineRename(root) {
    const state = root.finderState;
    if (!state.selectedItem || !state.selectedPath) {
        return;
    }
    const row = root.querySelector(`.finder-row[data-path="${state.selectedPath}"]`);
    if (!row) {
        return;
    }
    const nameCell = row.querySelector(".finder-cell.name");
    if (!nameCell) {
        return;
    }
    const nameSpan = nameCell.querySelector("span:last-child");
    if (!nameSpan) {
        return;
    }
    row.classList.add("renaming");
    const originalName = nameSpan.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.className = "finder-rename-input";
    input.value = originalName;
    nameSpan.replaceWith(input);
    input.focus();
    input.select();

    const finalize = async (commit) => {
        input.removeEventListener("blur", onBlur);
        input.removeEventListener("keydown", onKeyDown);
        row.classList.remove("renaming");
        if (commit) {
            await renameSelectedTo(root, input.value);
            return;
        }
        const restored = document.createElement("span");
        restored.textContent = originalName;
        input.replaceWith(restored);
    };

    const onBlur = () => {
        finalize(true);
    };

    const onKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            finalize(true);
        } else if (event.key === "Escape") {
            event.preventDefault();
            finalize(false);
        }
    };

    input.addEventListener("blur", onBlur);
    input.addEventListener("keydown", onKeyDown);
    input.addEventListener("click", (event) => event.stopPropagation());
}

function renderPreview(root, item) {
    const previewTitle = root.querySelector(".finder-preview-title");
    const previewSubtitle = root.querySelector(".finder-preview-subtitle");
    const previewInfo = root.querySelector(".finder-preview-info");
    const previewMedia = root.querySelector(".finder-preview-media");
    const state = root.finderState;

    if (state.previewUrl) {
        URL.revokeObjectURL(state.previewUrl);
        state.previewUrl = null;
    }

    if (!item) {
        previewTitle.textContent = "No Selection";
        previewSubtitle.textContent = "Choose a file to preview";
        previewInfo.textContent = "";
        previewMedia.innerHTML = "";
        return;
    }

    previewTitle.textContent = item.name;
    previewSubtitle.textContent = `${getKind(item)} ${item.size ? `• ${formatSize(item.size)}` : ""}`.trim();
    previewInfo.textContent = `Created ${formatDate(item.createdAt)} • Modified ${formatDate(item.modifiedAt)}`;

    previewMedia.innerHTML = "";
    if (item.type === "folder") {
        const folderBadge = document.createElement("div");
        folderBadge.className = "finder-preview-folder";
        folderBadge.textContent = "Folder";
        previewMedia.appendChild(folderBadge);
        return;
    }

    const isHtml = item.mime === "text/html" || /\.html?$/i.test(item.name);
    if (isHtml) {
        const iframe = document.createElement("iframe");
        iframe.className = "finder-preview-html";
        if (item.data) {
            state.previewUrl = URL.createObjectURL(item.data);
            iframe.src = state.previewUrl;
        } else {
            iframe.src = "";
        }
        previewMedia.appendChild(iframe);
        return;
    }

    const codeExtensions = [
        "txt",
        "md",
        "markdown",
        "js",
        "mjs",
        "cjs",
        "ts",
        "tsx",
        "jsx",
        "py",
        "json",
        "css",
        "scss",
        "less",
        "html",
        "htm",
        "sh",
        "bash",
        "zsh",
        "bat",
        "cmd",
        "ps1",
        "yml",
        "yaml",
        "toml",
        "ini",
        "cfg",
        "log"
    ];
    const ext = item.name.split(".").pop().toLowerCase();
    const isCode =
        item.mime === "text/plain" ||
        item.mime === "application/json" ||
        item.mime === "application/javascript" ||
        item.mime === "text/javascript" ||
        item.mime === "text/css" ||
        item.mime === "application/x-sh" ||
        codeExtensions.includes(ext);

    if (isCode) {
        const textBlock = document.createElement("div");
        textBlock.className = "finder-preview-text";
        const showText = async () => {
            try {
                if (item.data && typeof item.data.text === "function") {
                    textBlock.textContent = await item.data.text();
                } else {
                    textBlock.textContent = "Text preview unavailable";
                }
            } catch (error) {
                textBlock.textContent = "Text preview unavailable";
            }
        };
        previewMedia.appendChild(textBlock);
        showText();
        return;
    }

    const isPdf = item.mime === "application/pdf" || /\.pdf$/i.test(item.name);
    if (isPdf) {
        const iframe = document.createElement("iframe");
        iframe.className = "finder-preview-pdf";
        if (item.data) {
            state.previewUrl = URL.createObjectURL(item.data);
            iframe.src = state.previewUrl;
        } else {
            iframe.src = "";
        }
        previewMedia.appendChild(iframe);
        return;
    }

    const isImage = item.mime && item.mime.startsWith("image/");
    if (!isImage) {
        const generic = document.createElement("div");
        generic.className = "finder-preview-generic";
        generic.textContent = "Preview Not Available";
        previewMedia.appendChild(generic);
        return;
    }

    let url = item.previewUrl || null;
    if (item.data) {
        state.previewUrl = URL.createObjectURL(item.data);
        url = state.previewUrl;
    }

    const img = document.createElement("img");
    img.src = url || "";
    img.alt = item.name;
    previewMedia.appendChild(img);
}

function renderRows(root, items) {
    const list = root.querySelector(".finder-table-body");
    clearChildren(list);
    list.onclick = (event) => {
        if (event.target === list) {
            clearSelection(root);
        }
    };

    if (!items.length) {
        const empty = document.createElement("div");
        empty.className = "finder-empty";
        empty.textContent = "This folder is empty";
        list.appendChild(empty);
        return;
    }

    const state = root.finderState;
    let selectedItem = null;

    items.forEach((item) => {
        const row = document.createElement("div");
        row.className = "finder-row";
        row.dataset.path = item.path;

        const nameCell = document.createElement("div");
        nameCell.className = "finder-cell name";
        const icon = document.createElement("span");
        icon.className = `finder-row-icon ${item.type === "folder" ? "folder" : "file"}`;
        nameCell.appendChild(icon);
        const nameText = document.createElement("span");
        nameText.textContent = item.name;
        nameCell.appendChild(nameText);

        const modifiedCell = document.createElement("div");
        modifiedCell.className = "finder-cell modified";
        modifiedCell.textContent = formatDate(item.modifiedAt);

        const sizeCell = document.createElement("div");
        sizeCell.className = "finder-cell size";
        sizeCell.textContent = item.type === "folder" ? "--" : formatSize(item.size);

        const kindCell = document.createElement("div");
        kindCell.className = "finder-cell kind";
        kindCell.textContent = getKind(item);

        row.appendChild(nameCell);
        row.appendChild(modifiedCell);
        row.appendChild(sizeCell);
        row.appendChild(kindCell);

        row.addEventListener("click", () => {
            setSelection(root, item);
        });

        row.addEventListener("dblclick", () => {
            if (item.type === "folder") {
                navigateTo(root, item.path);
            }
        });

        if (state.selectedPath && state.selectedPath === item.path) {
            row.classList.add("selected");
            selectedItem = item;
        }

        list.appendChild(row);
    });

    state.selectedItem = selectedItem;
    renderPreview(root, selectedItem);
    updateContextMenuState(root);
}

function updateSidebarSelection(root, path) {
    root.querySelectorAll(".finder-sidebar-item").forEach((item) => {
        item.classList.toggle("active", item.dataset.path === path);
    });
}

function updatePathBar(root, path) {
    const pathBar = root.querySelector(".finder-path");
    if (!pathBar) {
        return;
    }
    clearChildren(pathBar);
    const segments = pathSegments(path);
    segments.forEach((segment, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "finder-path-segment";
        button.textContent = segment.name;
        button.addEventListener("click", () => navigateTo(root, segment.path));
        pathBar.appendChild(button);
        if (index < segments.length - 1) {
            const divider = document.createElement("span");
            divider.className = "finder-path-divider";
            divider.textContent = "›";
            pathBar.appendChild(divider);
        }
    });
}

async function renderFolder(root) {
    const state = root.finderState;
    const title = root.querySelector(".finder-title");
    title.textContent = state.currentPath === "__recents__" ? "Recents" : titleFromPath(state.currentPath);
    updateSidebarSelection(root, state.currentPath);
    const inTrash = isTrashView(root);
    const newMenuButton = root.querySelector("[data-action='new-menu']");
    if (newMenuButton) {
        const wrap = newMenuButton.closest(".finder-menu-wrap");
        if (wrap) {
            wrap.style.display = inTrash ? "none" : "flex";
        }
    }
    const importMenuButton = root.querySelector("[data-action='import-menu']");
    if (importMenuButton) {
        const wrap = importMenuButton.closest(".finder-menu-wrap");
        if (wrap) {
            wrap.style.display = inTrash ? "none" : "flex";
        }
    }

    let items = [];
    if (state.currentPath === "__recents__") {
        items = await listRecents(state.db);
    } else {
        items = await listItems(state.db, state.currentPath);
    }

    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        items = items.filter((item) => item.name.toLowerCase().includes(query));
    }

    items.sort((a, b) => {
        if (a.type !== b.type) {
            return a.type === "folder" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
    });

    state.items = items;
    state.itemsByPath = new Map(items.map((item) => [item.path, item]));
    if (state.selectedPath && !state.itemsByPath.has(state.selectedPath)) {
        state.selectedPath = null;
        state.selectedItem = null;
    }

    renderRows(root, items);
    if (state.currentPath === "__recents__") {
        const pathBar = root.querySelector(".finder-path");
        if (pathBar) {
            clearChildren(pathBar);
            const label = document.createElement("span");
            label.textContent = "Recents";
            pathBar.appendChild(label);
        }
    } else {
        updatePathBar(root, state.currentPath);
    }
}

function pushHistory(root, path) {
    const state = root.finderState;
    if (state.history[state.historyIndex] === path) {
        return;
    }
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(path);
    state.historyIndex = state.history.length - 1;
    updateNavButtons(root);
}

function updateNavButtons(root) {
    const state = root.finderState;
    const backButton = root.querySelector("[data-action='back']");
    const forwardButton = root.querySelector("[data-action='forward']");
    backButton.disabled = state.historyIndex <= 0;
    forwardButton.disabled = state.historyIndex >= state.history.length - 1;
}

async function navigateTo(root, path, push = true) {
    const state = root.finderState;
    state.currentPath = path;
    if (push) {
        pushHistory(root, path);
    }
    await renderFolder(root);
}

function bindToolbar(root) {
    root.querySelector("[data-action='back']").addEventListener("click", async () => {
        const state = root.finderState;
        if (state.historyIndex > 0) {
            state.historyIndex -= 1;
            updateNavButtons(root);
            await navigateTo(root, state.history[state.historyIndex], false);
        }
    });

    root.querySelector("[data-action='forward']").addEventListener("click", async () => {
        const state = root.finderState;
        if (state.historyIndex < state.history.length - 1) {
            state.historyIndex += 1;
            updateNavButtons(root);
            await navigateTo(root, state.history[state.historyIndex], false);
        }
    });

    const newMenuButton = root.querySelector("[data-action='new-menu']");
    const newMenu = root.querySelector(".finder-new-menu");
    const importMenuButton = root.querySelector("[data-action='import-menu']");
    const importMenu = root.querySelector(".finder-import-menu");
    const toggleNewMenu = (forceOpen) => {
        const shouldOpen = forceOpen !== undefined ? forceOpen : !newMenu.classList.contains("open");
        newMenu.classList.toggle("open", shouldOpen);
    };
    const toggleImportMenu = (forceOpen) => {
        const shouldOpen = forceOpen !== undefined ? forceOpen : !importMenu.classList.contains("open");
        importMenu.classList.toggle("open", shouldOpen);
    };

    newMenuButton.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleImportMenu(false);
        toggleNewMenu();
    });

    newMenu.querySelector("[data-action='new-folder']").addEventListener("click", async (event) => {
        event.stopPropagation();
        toggleNewMenu(false);
        const state = root.finderState;
        if (state.currentPath === "__recents__") {
            return;
        }
        await createFolder(state.db, state.currentPath);
        await renderFolder(root);
    });

    newMenu.querySelector("[data-action='new-text']").addEventListener("click", async (event) => {
        event.stopPropagation();
        toggleNewMenu(false);
        const state = root.finderState;
        if (state.currentPath === "__recents__") {
            return;
        }
        await createTextFile(state.db, state.currentPath);
        await renderFolder(root);
    });

    importMenuButton.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleNewMenu(false);
        toggleImportMenu();
    });

    importMenu.querySelector("[data-action='import-files']").addEventListener("click", (event) => {
        event.stopPropagation();
        toggleImportMenu(false);
        const input = root.querySelector(".finder-upload-input");
        input.value = "";
        input.click();
    });

    importMenu.querySelector("[data-action='import-folder']").addEventListener("click", (event) => {
        event.stopPropagation();
        toggleImportMenu(false);
        const input = root.querySelector(".finder-folder-input");
        input.value = "";
        input.click();
    });
}

function bindSidebar(root) {
    root.querySelectorAll(".finder-sidebar-item").forEach((item) => {
        item.addEventListener("click", () => {
            const path = item.dataset.path;
            navigateTo(root, path);
        });
    });
}

function bindSearch(root) {
    const input = root.querySelector(".finder-search-input");
    input.addEventListener("input", async (event) => {
        root.finderState.searchQuery = event.target.value.trim();
        await renderFolder(root);
    });
}

function bindUpload(root) {
    const input = root.querySelector(".finder-upload-input");
    const folderInput = root.querySelector(".finder-folder-input");
    input.addEventListener("change", async (event) => {
        const files = event.target.files;
        if (!files || !files.length) {
            return;
        }
        const state = root.finderState;
        if (state.currentPath === "__recents__") {
            state.currentPath = "/Downloads";
        }
        await addFilesToDb(state.db, state.currentPath, files);
        await renderFolder(root);
    });

    folderInput.addEventListener("change", async (event) => {
        const files = event.target.files;
        if (!files || !files.length) {
            return;
        }
        const state = root.finderState;
        if (state.currentPath === "__recents__") {
            state.currentPath = "/Downloads";
        }
        await addFilesToDb(state.db, state.currentPath, files);
        await renderFolder(root);
    });

    const dropZone = root.querySelector(".finder-table-body");
    dropZone.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropZone.classList.add("dragover");
    });
    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
    });
    dropZone.addEventListener("drop", async (event) => {
        event.preventDefault();
        dropZone.classList.remove("dragover");
        if (!event.dataTransfer || !event.dataTransfer.files.length) {
            return;
        }
        const state = root.finderState;
        await addFilesToDb(state.db, state.currentPath, event.dataTransfer.files);
        await renderFolder(root);
    });
}

function hideContextMenu(root) {
    const menu = root.querySelector(".finder-context-menu");
    if (menu) {
        menu.classList.remove("open");
    }
}

function showContextMenu(root, x, y) {
    const menu = root.querySelector(".finder-context-menu");
    if (!menu) {
        return;
    }
    menu.classList.add("open");
    const rect = root.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    let left = x - rect.left;
    let top = y - rect.top;
    const padding = 8;
    if (left + menuRect.width > rect.width) {
        left = rect.width - menuRect.width - padding;
    }
    if (top + menuRect.height > rect.height) {
        top = rect.height - menuRect.height - padding;
    }
    menu.style.left = `${Math.max(padding, left)}px`;
    menu.style.top = `${Math.max(padding, top)}px`;
}

function bindContextMenu(root) {
    const menu = root.querySelector(".finder-context-menu");
    const newMenu = root.querySelector(".finder-new-menu");
    const importMenu = root.querySelector(".finder-import-menu");
    if (!menu || !newMenu) {
        return;
    }
    root.addEventListener("contextmenu", (event) => {
        if (!root.contains(event.target)) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        newMenu.classList.remove("open");
    const row = event.target.closest(".finder-row");
    const state = root.finderState;
    if (row && state.itemsByPath && state.itemsByPath.has(row.dataset.path)) {
        setSelection(root, state.itemsByPath.get(row.dataset.path));
    } else {
        clearSelection(root);
    }
    updateContextMenuState(root);
    showContextMenu(root, event.clientX, event.clientY);
});

    document.addEventListener("click", (event) => {
        if (!root.contains(event.target) || !event.target.closest(".finder-context-menu")) {
            hideContextMenu(root);
        }
        if (!event.target.closest(".finder-menu-wrap")) {
            newMenu.classList.remove("open");
            if (importMenu) {
                importMenu.classList.remove("open");
            }
        }
    });

    menu.querySelector("[data-action='context-new-folder']").addEventListener("click", async () => {
        hideContextMenu(root);
        const state = root.finderState;
        if (state.currentPath === "__recents__") {
            return;
        }
        await createFolder(state.db, state.currentPath);
        await renderFolder(root);
    });

    menu.querySelector("[data-action='context-new-text']").addEventListener("click", async () => {
        hideContextMenu(root);
        const state = root.finderState;
        if (state.currentPath === "__recents__") {
            return;
        }
        await createTextFile(state.db, state.currentPath);
        await renderFolder(root);
    });

    menu.querySelector("[data-action='context-delete']").addEventListener("click", async () => {
        hideContextMenu(root);
        await deleteSelection(root);
    });

    const restoreButton = menu.querySelector("[data-action='context-restore']");
    if (restoreButton) {
        restoreButton.addEventListener("click", async () => {
            hideContextMenu(root);
            const state = root.finderState;
            if (!state.selectedPath) {
                return;
            }
            await restoreFromTrash(state.db, state.selectedPath);
            clearSelection(root);
            await renderFolder(root);
        });
    }

    const sendButton = menu.querySelector("[data-action='context-send-notes']");
    if (sendButton) {
        sendButton.addEventListener("click", async () => {
            hideContextMenu(root);
            const state = root.finderState;
            if (!state.selectedItem) {
                return;
            }
            await createNoteFromTextFile(state.selectedItem);
        });
    }

    const emptyTrashButton = menu.querySelector("[data-action='context-empty-trash']");
    if (emptyTrashButton) {
        emptyTrashButton.addEventListener("click", async () => {
            hideContextMenu(root);
            const state = root.finderState;
            await emptyTrash(state.db);
            clearSelection(root);
            await renderFolder(root);
        });
    }

    const renameButton = menu.querySelector("[data-action='context-rename']");
    if (renameButton) {
        renameButton.addEventListener("click", async () => {
            hideContextMenu(root);
            startInlineRename(root);
        });
    }
}

function bindKeyboard(root) {
    const state = root.finderState;
    root.addEventListener("mousedown", () => {
        state.hasFocus = true;
    });
    document.addEventListener("mousedown", (event) => {
        if (!root.contains(event.target)) {
            state.hasFocus = false;
        }
    });
    document.addEventListener("keydown", async (event) => {
        if (!state.hasFocus) {
            return;
        }
        if (event.key === "Delete" || event.key === "Backspace") {
            event.preventDefault();
            await deleteSelection(root);
        }
    });
}

async function initFinder(root) {
    if (!root || root.dataset.finderReady === "true") {
        return;
    }
    root.dataset.finderReady = "true";
    root.finderState = {
        db: null,
        currentPath: "/Pictures",
        history: ["/Pictures"],
        historyIndex: 0,
        searchQuery: "",
        previewUrl: null,
        selectedPath: null,
        selectedItem: null,
        items: [],
        itemsByPath: new Map(),
        hasFocus: false
    };

    try {
        root.finderState.db = await openFinderDb();
        await seedFinderIfNeeded(root.finderState.db);
        bindToolbar(root);
        bindSidebar(root);
        bindSearch(root);
        bindUpload(root);
        bindContextMenu(root);
        bindKeyboard(root);
        updateNavButtons(root);
        await renderFolder(root);
    } catch (error) {
        console.error("Finder failed to initialize", error);
    }
}

window.initFinder = initFinder;
