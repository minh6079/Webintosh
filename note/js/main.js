//initialization
function init() {
    //load saved theme
    loadTheme();

    //load language and update interface
    updateLanguage();

    //load view mode
    loadViewMode();

    renderNotes();

    //event handlers
    addBtn.addEventListener('click', onAddBtnClick);
    closeModal.addEventListener('click', closeModalHandler);
    saveNote.addEventListener('click', saveNoteHandler);
    searchInput.addEventListener('input', handleSearch);

    //menu handlers
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (selectionMode) {
            //in selection mode button works as "done"
            toggleSelectionMode();
        } else {
            toggleMenu();
        }
    });

    menuTheme.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTheme();
        closeMenu();
    });

    menuLang.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLanguage();
        closeMenu();
    });

    menuView.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleViewMode();
        closeMenu();
    });

    menuSelect.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSelectionMode();
        closeMenu();
    });

    //handler for pinned notes accordion
    if (pinnedSectionHeader) {
        pinnedSectionHeader.addEventListener('click', () => {
            pinnedSection.classList.toggle('collapsed');
        });
    }

    //handlers for modal buttons
    modalPinBtn.addEventListener('click', () => {
        if (currentNoteId) {
            togglePin(currentNoteId);
            //update button
            const note = notes.find(n => n.id === currentNoteId);
            if (note) {
                const pinLabel = modalPinBtn.querySelector('.modal-action-label');
                if (note.pinned) {
                    modalPinBtn.classList.add('pinned');
                    pinLabel.textContent = t('unpin');
                    modalPinBtn.querySelector('svg path').setAttribute('fill', 'currentColor');
                } else {
                    modalPinBtn.classList.remove('pinned');
                    pinLabel.textContent = t('pin');
                    modalPinBtn.querySelector('svg path').removeAttribute('fill');
                }
            }
        }
    });

    //duplicate note
    modalDuplicateBtn.addEventListener('click', () => {
        if (!currentNoteId) return;
        const original = notes.find(n => n.id === currentNoteId);
        if (!original) return;

        const newNote = {
            ...original,
            id: Date.now().toString(),
            date: new Date().toISOString()
        };

        lastAnimatedNoteId = newNote.id;
        notes.push(newNote);
        saveNotes();
        renderNotes();
        closeModalHandler();
        showToast(t('noteDuplicated'), 'success');
    });

    modalDeleteBtn.addEventListener('click', async () => {
        if (currentNoteId) {
            const noteIdToDelete = currentNoteId;
            closeModalHandler();
            await deleteNote(noteIdToDelete);
        }
    });

    //close menu on outside click
    document.addEventListener('click', (e) => {
        if (!dropdownMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            closeMenu();
        }
    });

    //handler for select all/delete button
    selectAllBtn.addEventListener('click', async () => {
        if (selectedNotes.size === 0) {
            //if nothing selected - select all
            selectAllNotes();
        } else {
            //if there are selected - delete them
            await deleteSelectedNotes();
        }
    });

    //handler for deselect all button
    deselectAllBtn.addEventListener('click', () => {
        selectedNotes.clear();
        updateSelectAllButtonText();

        //update all checkboxes state
        document.querySelectorAll('.note-radio').forEach(radio => {
            radio.checked = false;
        });
    });

    //confirmation modal handlers
    confirmCancel.addEventListener('click', () => {
        confirmModal.classList.remove('show');
        if (confirmResolve) {
            confirmResolve(false);
            confirmResolve = null;
        }
    });

    confirmOk.addEventListener('click', () => {
        confirmModal.classList.remove('show');
        if (confirmResolve) {
            confirmResolve(true);
            confirmResolve = null;
        }
    });

    //close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalHandler();
        }
    });

    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            confirmModal.classList.remove('show');
            if (confirmResolve) {
                confirmResolve(false);
                confirmResolve = null;
            }
        }
    });

    //close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (modal.classList.contains('show')) {
                closeModalHandler();
            } else if (confirmModal.classList.contains('show')) {
                confirmModal.classList.remove('show');
                if (confirmResolve) {
                    confirmResolve(false);
                    confirmResolve = null;
                }
            }
        }
    });
}

//start application
init();

//update time every minute
setInterval(() => {
    updateNoteDates();
}, 60000);

