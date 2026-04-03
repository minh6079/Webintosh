//application state
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let currentNoteId = null;
let searchQuery = '';
let currentLang = localStorage.getItem('language') || 'en';
let viewMode = localStorage.getItem('viewMode') || 'list';//'list' or 'gallery'
let lastAnimatedNoteId = null;
let selectionMode = false;//selection mode for notes
let selectedNotes = new Set();//set of selected note IDs
let confirmResolve = null;//promise for confirmation

