// инициализация переменных
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

let debounceTimer;
const debounceDelay = 500; // задержка перед отправкой запроса
var defaultLanguage = "en";
var currentLanguageToTranslate = "en";

document.addEventListener('DOMContentLoaded', function() {
    /* ========== Textarea ========== */
    window.adjustTextareaHeight = function(textarea) {
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
    window.swapLanguages = function(currentLanguage) {
        const temp = defaultLanguage;
        defaultLanguage = currentLanguage;
        languageSelect.value = temp;
    
        // если после свапа оба значения одинаковые – исправляем
        if (defaultLanguage === languageSelect.value) {
            defaultLanguage = (defaultLanguage === "en") ? userLang : "en";
            languageSelect.value = temp;
        }
    }

    languageSelect.addEventListener('change', function() {
        if (inputTextarea.value.trim() !== '') translateText();
        currentLanguageToTranslate = inputTextarea.value;
    });


    // ========== изменение языка самного переводчика ========== 
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
    
    defaultLanguage = userLang;
    
    loadLocale(langToLoad).then(dict => {
        currentDict = dict;
        applyTranslations(dict);
    });


    /* ========== Переключение переводчик/настройки ========== */
    let isSettingsOpen = false;
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


/* ========== Перевод ========== */
async function translate(text, targetLang, depth = 0) {
    if (!targetLang) {
        targetLang = languageSelect.value;
    }
    
    try {
        console.log("перевод1");
        const response = await fetch(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
        );
        console.log("перевод2");
        const data = await response.json();
        
        console.log("перевод3");
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


//========== Настройки ==========


// ========== YouTube кнопка ==========
function addButton() {
    // контейнер с кнопками плеера
    const rightControls = document.querySelector(".ytp-right-controls");

    if (!rightControls || document.querySelector("#youtube-translator")) return;

    const btn = document.createElement("button");
    btn.id = "youtube-translator";
    btn.className = "ytp-button";
    btn.title = "Открыть переводчик"; // всплывающая подсказка

    btn.style.cssText = `
        display: unset;
    `;
    
    // можно добавить иконку
    const svgIcon = document.createElement('div');
    svgIcon.innerHTML = `
    <svg width="100%" height="100%" viewBox="-6 -6 30 30" xmlns="http://www.w3.org/2000/svg" fill="#ffffffff">
        <path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286H4.545zm1.634-.736L5.5 3.956h-.049l-.679 2.022H6.18z"/>
        <path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm7.138 9.995c.193.301.402.583.63.846-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6.066 6.066 0 0 1-.415-.492 1.988 1.988 0 0 1-.94.31z"/>
    </svg>
    `;
    btn.appendChild(svgIcon);

    btn.addEventListener("click", () => {
        // Если попап уже есть, удаляем его
        const existingPopup = document.getElementById('buttonPopup');
        if (existingPopup) {
            existingPopup.remove();
            return;
        }

        // Создаём попап
        const popup = document.createElement('div');
        popup.id = 'buttonPopup';
        popup.style.position = 'absolute';
        popup.style.zIndex = '10000';
        popup.style.width = '250px';
        popup.style.padding = '10px';
        popup.style.backgroundColor = 'white';
        popup.style.border = '1px solid black';
        popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
        
        // Текстовое поле
        const input = document.createElement('textarea');
        input.style.width = '100%';
        input.style.height = '80px';
        input.placeholder = 'Напиши что-нибудь...';
        popup.appendChild(input);

        // Кнопка закрытия
        const closeBtn = document.createElement('button');
        closeBtn.innerText = 'Закрыть';
        closeBtn.style.marginTop = '5px';
        closeBtn.onclick = () => popup.remove();
        popup.appendChild(closeBtn);

        
        // Позиционируем попап над кнопкой
        const rect = btn.getBoundingClientRect();
        popup.style.top = (rect.top - popup.offsetHeight - 160) + 'px';
        popup.style.left = (rect.left + rect.width / 2 - 125) + 'px';

        document.body.appendChild(popup);
    });

    rightControls.prepend(btn);
}

if (location.hostname.includes('youtube.com')) {

    // Постоянное наблюдение за DOM
    const observer = new MutationObserver(addButton);
    observer.observe(document.body, { childList: true, subtree: true });

    // Также вызываем один раз при первой загрузке страницы
    addButton();
}
