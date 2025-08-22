document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const inputTextarea = document.getElementById('to-translate');
    const outputTextarea = document.getElementById('translation');
    const clearButton = document.getElementById('clear-input');
    const copyButton = document.getElementById('copy-output');
    const languageSelect = document.getElementById('language-select'); // язык перевода
    const loader = document.getElementById('loader');
    const settingsIcon = document.querySelector('.settings-icon');
    const translatorSection = document.getElementById('translator');
    const settingsSection = document.getElementById('settings');
    const title = document.getElementById('title');

    // Переменные
    let debounceTimer;
    const debounceDelay = 500; // задержка перед отправкой запроса
    let isSettingsOpen = false;

    /* ========== Textarea ========== */
    function adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight - 20) + 'px';
    }

    inputTextarea.addEventListener('input', function() {
        adjustTextareaHeight(inputTextarea);

        if (inputTextarea.value.trim() !== '') {
            clearButton.style.display = 'flex';
            translateText();
        } else {
            adjustTextareaHeight(outputTextarea);
            clearButton.style.display = 'none';
            outputTextarea.value = '';
            copyButton.style.display = 'none';
            resetTranslator();
        }
    });

    /* ========== Очистка и копирование ========== */
    clearButton.addEventListener('click', function() {
        inputTextarea.value = '';
        outputTextarea.value = '';
        clearButton.style.display = 'none';
        copyButton.style.display = 'none';
        inputTextarea.focus();
        adjustTextareaHeight(inputTextarea);
        adjustTextareaHeight(outputTextarea);
    });

    copyButton.addEventListener('click', async function() {
        try {
            await navigator.clipboard.writeText(outputTextarea.value);
            const originalIcon = copyButton.innerHTML;
            copyButton.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => copyButton.innerHTML = originalIcon, 1500);
        } catch (err) {
            console.error('Ошибка копирования: ', err);
        }
    });

    /* ========== Синхронизация языков ========== */
    function swapLanguages(currentLanguage) {
        const temp = defaultLanguage;
        defaultLanguage.value = currentLanguage;
        languageSelect.value = temp;
    
        // если после свапа оба значения одинаковые – исправляем
        if (defaultLanguage === languageSelect.value) {
            defaultLanguage = (defaultLanguage === "en") ? userLang : "en";
            languageSelect.value = temp;
        }
    }

    languageSelect.addEventListener('change', function() {
        if (inputTextarea.value.trim() !== '') translateText();
    });

    /* ========== Перевод ========== */
    async function translate(text, targetLang, depth = 0) {
        try {
            const response = await fetch(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
            );
            const data = await response.json();

            const detectedLang = data[2]; // язык-источник

            // если переводчик определил язык так же, как targetLang
            if (detectedLang === targetLang && depth < 1) {
                const temp = defaultLanguage;
                swapLanguages(targetLang);
                return translate(text, temp, depth + 1);
            }

            // data[0] — массив предложений, берём все куски текста
            return data[0].map(part => part[0]).join("");
        } catch (error) {
            console.error("Ошибка Google Translate:", error);
            return null;
        }
    }

    function translateText() {
        const text = inputTextarea.value.trim();
        const targetLang = languageSelect.value;

        if (!text) {
            outputTextarea.value = '';
            copyButton.style.display = 'none';
            loader.style.display = 'none';
            return;
        }

        loader.style.display = 'flex';
        copyButton.style.display = 'none';
        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(async () => {
            const translation = await translate(text, targetLang);

            outputTextarea.value = translation;
            adjustTextareaHeight(outputTextarea);
            resetTranslator();
        }, debounceDelay);
    }

    function resetTranslator() {
        copyButton.style.display = 'flex';
        loader.style.display = 'none';
        adjustTextareaHeight(outputTextarea);
        clearTimeout(debounceTimer);
    }


    // ========== изменение языка самного переводчика========== 
    async function loadLocale(lang) {
        const response = await fetch(`/locales/${lang}.json`);
        const translations = await response.json();
        return translations;
    }
    
    async function applyTranslations(dict) {    
        // Меняем обычный текст
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) el.textContent = dict[key];
        });
    
        // Меняем placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key]) el.placeholder = dict[key];
        });
    }
    

    let currentDict = {}; // хранит текущие переводы
    const existingLocalizations = ['en', 'ru', 'uk'];
    const userLang = navigator.language.split('-')[0];
    const langToLoad = existingLocalizations.includes(userLang) ? userLang : 'en';
    
    var defaultLanguage = userLang;
    
    loadLocale(langToLoad).then(dict => {
        currentDict = dict;
        applyTranslations(dict);
    });


    /* ========== Переключение переводчик/настройки ========== */
    settingsIcon.addEventListener('click', function() {
        isSettingsOpen = !isSettingsOpen;
        settingsIcon.style.transform = isSettingsOpen ? 'rotate(45deg)' : 'rotate(0deg)';
        translatorSection.style.display = isSettingsOpen ? 'none' : 'flex';
        languageSelect.style.display = isSettingsOpen ? 'none' : 'flex';
        settingsSection.style.display = isSettingsOpen ? 'flex' : 'none';

        const titleKey = isSettingsOpen ? 'settings_title' : 'translator_title';
        title.textContent = currentDict[titleKey] || title.textContent;
    });    
});
