document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const inputTextarea = document.getElementById('to-translate');
    const outputTextarea = document.getElementById('translation');
    const clearButton = document.getElementById('clear-input');
    const copyButton = document.getElementById('copy-output');
    const languageSelect = document.getElementById('language-select');
    const loader = document.getElementById('loader');
    const settingsIcon = document.querySelector('.settings-icon');
    const translatorSection = document.getElementById('translator');
    const settingsSection = document.getElementById('settings');
    const title = document.getElementById('title');
    // Из настроек
    const settingsLanguageSelect = document.getElementById('settings-language-select');
    const inputLanguage = document.getElementById('input-language');
    
    // Переменные
    let debounceTimer;
    const debounceDelay = 500; // Задержка перед отправкой запроса
    var is_settings_open = false;
    
    
    // Функция после ввода текста
    inputTextarea.addEventListener('input', function() {
        // изменяем высоту текстового поля
        adjustTextareaHeight(inputTextarea);

        if (inputTextarea.value.trim() !== '') {
            clearButton.style.display = 'flex';
            translateText();
        } else {
            adjustTextareaHeight(outputTextarea);
            clearButton.style.display = 'none';
            outputTextarea.value = '';
            copyButton.style.display = 'none';
        }
    });

    // изменение высоты текстового поля
    function adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto'; // Сбрасываем высоту
        textarea.style.height = (textarea.scrollHeight - 30) + 'px'; // Устанавливаем новую высоту
    }
    
    // Очистка поля ввода
    clearButton.addEventListener('click', function() {
        inputTextarea.value = '';
        outputTextarea.value = '';
        clearButton.style.display = 'none';
        copyButton.style.display = 'none';
        inputTextarea.focus();
    });
    
    // Копирование текста
    copyButton.addEventListener('click', async function() {
        try {
            await navigator.clipboard.writeText(outputTextarea.value);
    
            // Визуальное подтверждение копирования
            const originalIcon = copyButton.innerHTML;
            copyButton.innerHTML = '<i class="fas fa-check"></i>';
    
            setTimeout(() => {
                copyButton.innerHTML = originalIcon;
            }, 1500);
        } catch (err) {
            console.error('Ошибка копирования: ', err);
        }
    });
    
    
    // Изменение языка перевода
    languageSelect.addEventListener('change', function() {
        // изменение языка перевода в настройках
        settingsLanguageSelect.value = languageSelect.value;

        if (inputTextarea.value.trim() !== '') {
            translateText();
        }
    });
    
    // Изменение языка перевода в настройках
    settingsLanguageSelect.addEventListener('change', function() {
        // изменение языка перевода в переводчике
        languageSelect.value = settingsLanguageSelect.value;

        if (inputTextarea.value.trim() !== '') {
            translateText();
        }
    });
    
    // Функция перевода текста
    function translateText() {
        const text = inputTextarea.value.trim();
        const targetLang = languageSelect.value;
        
        if (text === '') {
            outputTextarea.value = '';
            copyButton.style.display = 'none';
            loader.style.display = 'none';
            return;
        }
        
        // Показываем лоадер
        loader.style.display = 'flex';
        copyButton.style.display = 'none';
        
        // Очищаем предыдущий таймер
        clearTimeout(debounceTimer);
        
        // Устанавливаем новый таймер
        debounceTimer = setTimeout(() => {
            Translation(text, targetLang);
        }, debounceDelay);
    }
    
    // Переводчик
    async function Translation(text, targetLang) {


        outputTextarea.value = text + " " + targetLang;

        // Показываем кнопку копирования и убираем лоадер
        copyButton.style.display = 'flex';
        loader.style.display = 'none';
        // изменяем размер текстового поля
        adjustTextareaHeight(outputTextarea);
    }

    // Переключение между переводчиком и настройками
    settingsIcon.addEventListener('click', function() {
        // переключить на переводчик
        if (is_settings_open) {
            // анимация иконки
            settingsIcon.style.transform = 'rotate(0deg)';
            // показать переводчик и скрыть настройки
            translatorSection.style.display = 'flex';
            languageSelect.style.display = 'flex';
            settingsSection.style.display = 'none';
            // изменение надписи сверху
            title.textContent = 'перевести на:';
            is_settings_open = false;
        // переключить на настройки
        } else {
            // анимация иконки
            settingsIcon.style.transform = 'rotate(45deg)';
            // показать настройки и скрыть переводчик
            translatorSection.style.display = 'none';
            languageSelect.style.display = 'none';
            settingsSection.style.display = 'flex';
            // изменение надписи сверху
            title.textContent = 'настройки';
            is_settings_open = true;
        }
    });
});