document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const inputTextarea = document.getElementById('to-translate');
    const outputTextarea = document.getElementById('translation');
    const clearButton = document.getElementById('clear-input');
    const copyButton = document.getElementById('copy-output');
    const languageSelect = document.getElementById('language-select'); // язык перевода
    const defaultLanguage = document.getElementById('default-language');
    const loader = document.getElementById('loader');
    const settingsIcon = document.querySelector('.settings-icon');
    const translatorSection = document.getElementById('translator');
    const settingsSection = document.getElementById('settings');
    const title = document.getElementById('title');
    const settingsLanguageSelect = document.getElementById('settings-language-select');

    // Переменные
    let debounceTimer;
    const debounceDelay = 500; // задержка перед отправкой запроса
    let isSettingsOpen = false;

    /* ========== Textarea ========== */
    function adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight - 30) + 'px';
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
    function setLanguage(language) {
        languageSelect.value = language;
        settingsLanguageSelect.value = language;
    }

    function swapLanguages(currentLanguage) {
        const temp = defaultLanguage.value;
        defaultLanguage.value = currentLanguage;
        setLanguage(temp);
    
        // если после свапа оба значения одинаковые – исправляем
        if (defaultLanguage.value === languageSelect.value) {
            defaultLanguage.value = (defaultLanguage.value === "en") ? "ru" : "en";
            setLanguage(temp);
        }
    }

    languageSelect.addEventListener('change', function() {
        setLanguage(languageSelect.value);
        if (inputTextarea.value.trim() !== '') translateText();
    });

    settingsLanguageSelect.addEventListener('change', function() {
        setLanguage(settingsLanguageSelect.value);
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
                const temp = defaultLanguage.value;
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
            outputTextarea.value = translation || '';
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

    /* ========== Переключение переводчик/настройки ========== */
    settingsIcon.addEventListener('click', function() {
        isSettingsOpen = !isSettingsOpen;
        settingsIcon.style.transform = isSettingsOpen ? 'rotate(45deg)' : 'rotate(0deg)';
        translatorSection.style.display = isSettingsOpen ? 'none' : 'flex';
        languageSelect.style.display = isSettingsOpen ? 'none' : 'flex';
        settingsSection.style.display = isSettingsOpen ? 'flex' : 'none';
        title.textContent = isSettingsOpen ? 'настройки' : 'перевести на:';
    });
});
