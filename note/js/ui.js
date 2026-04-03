//show toast notification
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => {
        toast.classList.add('hiding');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    });

    let iconSvg = '';
    if (type === 'success') {
        iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    } else if (type === 'error') {
        iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    } else if (type === 'warning') {
        iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    } else {
        iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    }

    toast.innerHTML = `
        <div class="toast-icon">${iconSvg}</div>
        <span class="toast-message">${escapeHtml(message)}</span>
    `;
    toast.appendChild(closeBtn);

    toastContainer.appendChild(toast);

    //set transform-origin to top point (center X, top Y)
    toast.style.transformOrigin = 'center top';

    //start animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.add('animate-in');
        });
    });

    //auto remove
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, duration);
}

//show confirmation modal
function showConfirm(message) {
    return new Promise((resolve) => {
        confirmMessage.textContent = message;
        confirmModal.classList.add('show');
        confirmResolve = resolve;
    });
}

//load theme from localStorage
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = savedTheme;
    } else {
        //if theme not saved, use system theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.body.className = 'dark-theme';
        } else {
            document.body.className = 'light-theme';
        }
    }
}

//toggle theme
function toggleTheme() {
    const isDark = document.body.classList.contains('dark-theme');

    if (isDark) {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        localStorage.setItem('theme', 'light-theme');
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark-theme');
    }
}

//open/close menu
function toggleMenu() {
    const isOpen = dropdownMenu.classList.contains('show');

    if (!isOpen) {
        //hide button when menu is open
        menuToggle.style.opacity = '0';
        menuToggle.style.pointerEvents = 'none';
    } else {
        //show button when menu is closed
        menuToggle.style.opacity = '1';
        menuToggle.style.pointerEvents = 'auto';
    }

    dropdownMenu.classList.toggle('show');
    menuToggle.classList.toggle('active');
}

//close menu
function closeMenu() {
    dropdownMenu.classList.remove('show');
    menuToggle.classList.remove('active');
    //show button when menu is closed
    menuToggle.style.opacity = '1';
    menuToggle.style.pointerEvents = 'auto';
}

//load view mode
function loadViewMode() {
    //just update menu text, containers are configured inside renderNotes
    updateViewMenuText();
}

//toggle view mode
function toggleViewMode() {
    viewMode = viewMode === 'list' ? 'gallery' : 'list';
    localStorage.setItem('viewMode', viewMode);
    updateViewMenuText();//update menu text
    renderNotes();//rerender notes with new view mode
}

//update view mode menu text
function updateViewMenuText() {
    if (menuView) {
        const menuText = menuView.querySelector('.menu-text');
        const listIcon = menuView.querySelector('.list-icon');
        const galleryIcon = menuView.querySelector('.gallery-icon');

        if (menuText) {
            menuText.textContent = viewMode === 'list' ? t('showAsGallery') : t('showAsList');
        }

        if (listIcon && galleryIcon) {
            if (viewMode === 'list') {
                listIcon.style.display = 'none';
                galleryIcon.style.display = 'block';
            } else {
                listIcon.style.display = 'block';
                galleryIcon.style.display = 'none';
            }
        }
    }
}

//toggle selection mode
function toggleSelectionMode() {
    selectionMode = !selectionMode;
    selectedNotes.clear();

    if (selectionMode) {
        //enable selection mode
        document.body.classList.add('selection-mode');
        searchContainer.querySelector('.search-input-wrapper').style.display = 'none';
        addBtn.style.display = 'none';
        selectionButtons.style.display = 'flex';
        menuToggle.querySelector('.menu-dots-icon').style.display = 'none';
        menuDoneIcon.style.display = 'block';
        updateSelectAllButtonText();
    } else {
        //disable selection mode
        document.body.classList.remove('selection-mode');
        searchContainer.querySelector('.search-input-wrapper').style.display = 'block';
        addBtn.style.display = 'flex';
        selectionButtons.style.display = 'none';
        menuToggle.querySelector('.menu-dots-icon').style.display = 'block';
        menuDoneIcon.style.display = 'none';
    }

    renderNotes();
}

//toggle note selection
function toggleNoteSelection(noteId) {
    if (selectedNotes.has(noteId)) {
        selectedNotes.delete(noteId);
    } else {
        selectedNotes.add(noteId);
    }
    updateSelectAllButtonText();

    //update all checkboxes state
    document.querySelectorAll('.note-radio').forEach(radio => {
        const noteId = radio.id.replace('note-', '');
        radio.checked = selectedNotes.has(noteId);
    });
}

//update select all button text
function updateSelectAllButtonText() {
    if (selectedNotes.size === 0) {
        selectAllBtn.textContent = t('selectAll');
        selectAllBtn.classList.remove('delete-mode');
        deselectAllBtn.style.display = 'none';
    } else {
        selectAllBtn.textContent = t('deleteSelected');
        selectAllBtn.classList.add('delete-mode');
        deselectAllBtn.style.display = 'block';
    }
}

//select all notes
function selectAllNotes() {
    //get all visible notes (considering search)
    const filteredNotes = notes.filter(note => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query);
    });

    //if all already selected, deselect
    const allSelected = filteredNotes.every(note => selectedNotes.has(note.id));

    if (allSelected) {
        //deselect all visible notes
        filteredNotes.forEach(note => {
            selectedNotes.delete(note.id);
        });
    } else {
        //select all visible notes
        filteredNotes.forEach(note => {
            selectedNotes.add(note.id);
        });
    }

    //update all checkboxes state
    document.querySelectorAll('.note-radio').forEach(radio => {
        const noteId = radio.id.replace('note-', '');
        radio.checked = selectedNotes.has(noteId);
    });

    updateSelectAllButtonText();
}

//delete selected notes (called from other places, e.g. context menu)
async function deleteSelectedNotes() {
    if (selectedNotes.size === 0) return;

    //delete only selected notes
    const count = selectedNotes.size;
    const message = count === 1
        ? t('confirmDelete')
        : (currentLang === 'ru'
            ? `Вы уверены, что хотите удалить ${count} заметок?`
            : `Are you sure you want to delete ${count} notes?`);

    const confirmed = await showConfirm(message);
    if (confirmed) {
        notes = notes.filter(n => !selectedNotes.has(n.id));
        selectedNotes.clear();
        saveNotes();
        renderNotes();
        showToast(t('noteDeleted'), 'success');
        updateSelectAllButtonText();

        //if all notes deleted, exit selection mode
        if (notes.length === 0) {
            toggleSelectionMode();
        }
    }
}

