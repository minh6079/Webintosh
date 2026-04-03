//escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

//truncate text with ellipsis
function truncateText(text, maxLength = 30) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

//pluralize words for russian language
function pluralizeRu(number, one, few, many) {
    const mod10 = number % 10;
    const mod100 = number % 100;

    if (mod100 >= 11 && mod100 <= 19) {
        return many;
    }
    if (mod10 === 1) {
        return one;
    }
    if (mod10 >= 2 && mod10 <= 4) {
        return few;
    }
    return many;
}

//format date
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        return t('justNow');
    } else if (minutes < 60) {
        if (currentLang === 'ru') {
            return `${minutes} ${pluralizeRu(minutes, 'минуту', 'минуты', 'минут')} назад`;
        } else {
            return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
        }
    } else if (hours < 24) {
        if (currentLang === 'ru') {
            return `${hours} ${pluralizeRu(hours, 'час', 'часа', 'часов')} назад`;
        } else {
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        }
    } else if (days < 7) {
        if (currentLang === 'ru') {
            return `${days} ${pluralizeRu(days, 'день', 'дня', 'дней')} назад`;
        } else {
            return `${days} ${days === 1 ? 'day' : 'days'} ago`;
        }
    } else {
        const locale = currentLang === 'ru' ? 'ru-RU' : 'en-US';
        return date.toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
}

//update note dates
function updateNoteDates() {
    document.querySelectorAll('.note-date[data-date]').forEach(dateEl => {
        const dateStr = dateEl.getAttribute('data-date');
        if (dateStr) {
            const date = new Date(dateStr);
            dateEl.textContent = formatDate(date);
        }
    });
}

