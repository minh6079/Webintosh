//localization
const translations = {
    en: {
        title: 'Notes',
        searchPlaceholder: 'Search notes...',
        noNotes: 'No notes',
        emptySubtext: 'Click + to create a new note',
        newNote: 'New note',
        editNote: 'Edit note',
        save: 'Save',
        cancel: 'Cancel',
        ok: 'OK',
        edit: 'Edit',
        delete: 'Delete',
        titlePlaceholder: 'Title',
        contentPlaceholder: 'Note text...',
        confirmDelete: 'Are you sure you want to delete this note?',
        noteEmpty: 'Note cannot be empty',
        noteSaved: 'Note saved',
        noteCreated: 'Note created',
        noteDeleted: 'Note deleted',
        noTitle: 'No title',
        justNow: 'just now',
        toggleTheme: 'Toggle theme',
        switchLanguage: 'Switch language',
        noAdditionalText: 'No additional text',
        showAsGallery: 'Show as gallery',
        showAsList: 'Show as list',
        pinnedNotes: 'Pinned notes',
        allNotes: 'All notes',
        pin: 'Pin',
        unpin: 'Unpin',
        today: 'Today',
        yesterday: 'Yesterday',
        thisWeek: 'This week',
        thisMonth: 'This month',
        noResults: 'No results found for this query',
        noResultsHint: 'Check spelling or try a different search term',
        duplicate: 'Duplicate',
        noteDuplicated: 'Note duplicated',
        select: 'Select',
        done: 'Done',
        selectAll: 'Select all',
        deselectAll: 'Deselect all',
        deleteSelected: 'Delete'
    },
    ru: {
        title: 'Заметки',
        searchPlaceholder: 'Поиск заметок...',
        noNotes: 'Нет заметок',
        emptySubtext: 'Нажмите + чтобы создать новую заметку',
        noResults: 'Нет результатов по данному запросу',
        noResultsHint: 'Проверьте написание или попробуйте изменить запрос',
        newNote: 'Новая заметка',
        editNote: 'Редактировать заметку',
        save: 'Сохранить',
        cancel: 'Отмена',
        ok: 'ОК',
        edit: 'Редактировать',
        delete: 'Удалить',
        titlePlaceholder: 'Заголовок',
        contentPlaceholder: 'Текст заметки...',
        confirmDelete: 'Вы уверены, что хотите удалить эту заметку?',
        noteEmpty: 'Заметка не может быть пустой',
        noteSaved: 'Заметка сохранена',
        noteCreated: 'Заметка создана',
        noteDeleted: 'Заметка удалена',
        noTitle: 'Без названия',
        justNow: 'только что',
        toggleTheme: 'Переключить тему',
        switchLanguage: 'Сменить язык',
        noAdditionalText: 'нету дополнительного текста',
        showAsGallery: 'Показать как галерею',
        showAsList: 'Показать как список',
        pinnedNotes: 'Закрепленные заметки',
        allNotes: 'Все заметки',
        pin: 'Закрепить',
        unpin: 'Открепить',
        today: 'Сегодня',
        yesterday: 'Вчера',
        thisWeek: 'На этой неделе',
        thisMonth: 'В этом месяце',
        noResults: 'Нет результатов по данному запросу',
        noResultsHint: 'Проверьте написание или попробуйте изменить запрос',
        duplicate: 'Дублировать',
        noteDuplicated: 'Заметка продублирована',
        select: 'Выделить',
        done: 'Готово',
        selectAll: 'Выделить все',
        deselectAll: 'Снять выделение',
        deleteSelected: 'Удалить'
    }
};

//get translation function
function t(key) {
    return translations[currentLang][key] || key;
}

//update interface when language changes
function updateLanguage() {
    document.documentElement.lang = currentLang;

    //update elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });

    //update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });

    //update language value in menu
    if (menuLangValue) {
        menuLangValue.textContent = currentLang.toUpperCase();
    }

    //update view mode text
    updateViewMenuText();

    //rerender notes to update dates
    renderNotes();
}

//toggle language
function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ru' : 'en';
    localStorage.setItem('language', currentLang);
    updateLanguage();
}

