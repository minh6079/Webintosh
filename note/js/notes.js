//determine time group for note
function getTimeGroup(noteDate) {
    const date = new Date(noteDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const noteDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    //today
    if (noteDay.getTime() === today.getTime()) {
        return 'today';
    }

    //yesterday
    if (noteDay.getTime() === yesterday.getTime()) {
        return 'yesterday';
    }

    //this week (last 7 days, but not today and not yesterday)
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    if (noteDay > weekAgo && noteDay < yesterday) {
        return 'thisWeek';
    }

    //this month (but not this week)
    if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
        return 'thisMonth';
    }

    //by months (format: "January 2026" or "Январь 2026")
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    return monthKey;
}

//get time group title
function getTimeGroupTitle(groupKey) {
    if (groupKey === 'today') {
        return t('today');
    } else if (groupKey === 'yesterday') {
        return t('yesterday');
    } else if (groupKey === 'thisWeek') {
        return t('thisWeek');
    } else if (groupKey === 'thisMonth') {
        return t('thisMonth');
    } else {
        //group format: "YYYY-MM"
        const [year, month] = groupKey.split('-');
        const date = new Date(parseInt(year), parseInt(month), 1);
        const locale = currentLang === 'ru' ? 'ru-RU' : 'en-US';
        const monthName = date.toLocaleDateString(locale, { month: 'long' });
        const yearNum = parseInt(year);
        const currentYear = new Date().getFullYear();

        if (yearNum === currentYear) {
            return monthName;
        } else {
            return `${monthName} ${yearNum}`;
        }
    }
}

//create note card
function createNoteCard(note) {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.dataset.id = note.id;

    if (lastAnimatedNoteId && note.id === lastAnimatedNoteId) {
        card.classList.add('note-card-animated');
        //reset id so animation doesn't repeat on next render
        requestAnimationFrame(() => {
            lastAnimatedNoteId = null;
        });
    }

    const date = new Date(note.date);
    const formattedDate = formatDate(date);

    const titleText = note.title || t('noTitle');
    const contentText = note.content || t('noAdditionalText');
    const truncatedTitle = truncateText(titleText, 30);
    const truncatedContent = truncateText(contentText, 60);

    //radio button for selection mode
    const radioButton = selectionMode ? `
        <div class="note-radio-wrapper">
            <input type="checkbox" class="note-radio" id="note-${note.id}" ${selectedNotes.has(note.id) ? 'checked' : ''}>
            <label for="note-${note.id}" class="note-radio-label"></label>
        </div>
    ` : '';

    card.innerHTML = `
        ${radioButton}
        <div class="note-content-wrapper">
            <div class="note-header">
                <div class="note-title">${escapeHtml(truncatedTitle)}</div>
            </div>
            <div class="note-meta">
                <div class="note-date" data-date="${note.date}">${formattedDate}</div>
                <div class="note-content">${escapeHtml(truncatedContent)}</div>
            </div>
        </div>
    `;

    //card click handler
    if (selectionMode) {
        //in selection mode - toggle selection
        const radio = card.querySelector('.note-radio');
        if (radio) {
            //initialize checkbox state
            radio.checked = selectedNotes.has(note.id);

            radio.addEventListener('change', (e) => {
                e.stopPropagation();
                toggleNoteSelection(note.id);
                //update checkbox state
                radio.checked = selectedNotes.has(note.id);
            });

            card.addEventListener('click', (e) => {
                //ignore clicks on radio button itself
                if (e.target === radio || e.target.closest('.note-radio-wrapper')) {
                    return;
                }
                //toggle selection
                radio.checked = !radio.checked;
                toggleNoteSelection(note.id);
            });
        }
    } else {
        //in normal mode - open note
        card.addEventListener('click', () => {
            openEditNote(note.id);
        });
    }

    return card;
}

//render notes
function renderNotes() {
    notesContainer.innerHTML = '';
    pinnedContainer.innerHTML = '';

    const filteredNotes = notes.filter(note => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query);
    });

    //separate pinned and regular notes
    const pinnedNotes = filteredNotes.filter(note => note.pinned);
    const regularNotes = filteredNotes.filter(note => !note.pinned);

    //show pinned section if there are pinned notes
    if (pinnedNotes.length > 0) {
        pinnedSection.style.display = 'block';
        //apply view mode to pinned container
        if (viewMode === 'gallery') {
            pinnedContainer.classList.add('gallery-view');
        } else {
            pinnedContainer.classList.remove('gallery-view');
        }

        const sortedPinned = [...pinnedNotes].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        sortedPinned.forEach(note => {
            const noteCard = createNoteCard(note);
            pinnedContainer.appendChild(noteCard);
        });
    } else {
        pinnedSection.style.display = 'none';
    }

    //group regular notes by time
    const groupedNotes = {};
    regularNotes.forEach(note => {
        const group = getTimeGroup(note.date);
        if (!groupedNotes[group]) {
            groupedNotes[group] = [];
        }
        groupedNotes[group].push(note);
    });

    //sort groups by date (newest first)
    const groupOrder = ['today', 'yesterday', 'thisWeek', 'thisMonth'];
    const sortedGroups = Object.keys(groupedNotes).sort((a, b) => {
        //first special groups
        const aIndex = groupOrder.indexOf(a);
        const bIndex = groupOrder.indexOf(b);
        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
        }
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;

        //then groups by months/years (newest first)
        return b.localeCompare(a);
    });

    //render groups
    sortedGroups.forEach(groupKey => {
        const groupNotes = groupedNotes[groupKey].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        //create section for group
        const section = document.createElement('div');
        section.className = 'time-group-section';

        const sectionTitle = document.createElement('h2');
        sectionTitle.className = 'section-title';
        sectionTitle.textContent = getTimeGroupTitle(groupKey);

        const groupContainer = document.createElement('div');
        groupContainer.className = 'notes-container';
        if (viewMode === 'gallery') {
            groupContainer.classList.add('gallery-view');
        }

        groupNotes.forEach(note => {
            const noteCard = createNoteCard(note);
            groupContainer.appendChild(noteCard);
        });

        section.appendChild(sectionTitle);
        section.appendChild(groupContainer);
        notesContainer.appendChild(section);
    });

    //show "no results" state if there is search query but no results
    //or show empty state if there are no notes at all
    if (filteredNotes.length === 0) {
        const hasSearchQuery = searchQuery && searchQuery.trim() !== '';
        const hasNotes = notes.length > 0;

        if (hasSearchQuery && hasNotes) {
            //there is search query, there are notes in database, but no search results
            if (emptyState) emptyState.classList.remove('show');
            if (noResultsState) noResultsState.classList.add('show');
        } else {
            //no notes at all or no search query
            if (emptyState) emptyState.classList.add('show');
            if (noResultsState) noResultsState.classList.remove('show');
        }
    } else {
        //there are results - hide both states
        if (emptyState) emptyState.classList.remove('show');
        if (noResultsState) noResultsState.classList.remove('show');
    }
}

//open new note
function openNewNote() {
    currentNoteId = null;
    modalTitle.textContent = t('newNote');
    noteTitleInput.value = '';
    noteContentInput.value = '';

    //hide action buttons for new note
    modalActions.style.display = 'none';

    const modalContent = document.querySelector('.modal-content');
    const addBtnRect = addBtn.getBoundingClientRect();
    const modalRect = modal.getBoundingClientRect();

    //calculate button position relative to modal
    const startX = addBtnRect.left + addBtnRect.width / 2 - modalRect.left;
    const startY = addBtnRect.top + addBtnRect.height / 2 - modalRect.top;

    //set transform-origin to button position
    modalContent.style.transformOrigin = `${startX}px ${startY}px`;

    modal.classList.add('show');

    //start animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            modalContent.classList.add('animate-in');
        });
    });

    noteTitleInput.focus();
}

//open note for editing
function openEditNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    currentNoteId = id;
    modalTitle.textContent = t('editNote');
    noteTitleInput.value = note.title;
    noteContentInput.value = note.content;

    //show action buttons
    modalActions.style.display = 'flex';

    //update pin button
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

    const modalContent = document.querySelector('.modal-content');
    modalContent.classList.remove('animate-in');
    modalContent.style.transform = '';
    modalContent.style.transformOrigin = '';

    modal.classList.add('show');
    noteTitleInput.focus();
}

//close modal
function closeModalHandler() {
    const modalContent = document.querySelector('.modal-content');
    modalContent.classList.remove('animate-in');
    modalContent.style.transformOrigin = '';
    modal.classList.remove('show');
    currentNoteId = null;
}

//save note
function saveNoteHandler() {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();

    if (!title && !content) {
        showToast(t('noteEmpty'), 'warning');
        return;
    }

    if (currentNoteId) {
        //edit existing note
        const note = notes.find(n => n.id === currentNoteId);
        if (note) {
            note.title = title;
            note.content = content;
            note.date = new Date().toISOString();
        }
        showToast(t('noteSaved'), 'success');
    } else {
        //create new note
        const newNote = {
            id: Date.now().toString(),
            title: title,
            content: content,
            date: new Date().toISOString()
        };
        notes.push(newNote);
        showToast(t('noteCreated'), 'success');
    }

    saveNotes();
    renderNotes();
    closeModalHandler();
}

//toggle note pin
function togglePin(id) {
    const note = notes.find(n => n.id === id);
    if (note) {
        note.pinned = !note.pinned;
        saveNotes();
        renderNotes();
    }
}

//delete note
async function deleteNote(id) {
    const confirmed = await showConfirm(t('confirmDelete'));
    if (confirmed) {
        notes = notes.filter(n => n.id !== id);
        saveNotes();
        renderNotes();
        showToast(t('noteDeleted'), 'success');
    }
}

//save notes to localStorage
function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

//search
function handleSearch(e) {
    searchQuery = e.target.value;

    //toggle add button mode (plus / cross)
    if (addBtn) {
        if (searchQuery && searchQuery.trim() !== '') {
            addBtn.classList.add('search-active');
        } else {
            addBtn.classList.remove('search-active');
        }
    }

    renderNotes();
}

//add button click handler / search clear
function onAddBtnClick(e) {
    //if there is text in search - clear it and don't open modal
    if (searchInput && searchInput.value.trim() !== '') {
        e.preventDefault();
        e.stopPropagation();

        searchInput.value = '';
        searchQuery = '';

        if (addBtn) {
            addBtn.classList.remove('search-active');
        }

        renderNotes();
        return;
    }

    //normal behavior - open new note modal
    openNewNote();
}

