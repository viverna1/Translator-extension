let translationTimer;
const TRANSLATION_DELAY = 500; // 100ms = 0.1 секунды

function translateText(text) {
    document.getElementById('translation').value = text;
}

function startTranslationTimer(inputText) {
    // Сбрасываем предыдущий таймер
    if (translationTimer) {
        clearTimeout(translationTimer);
    }
    
    // Запускаем новый таймер
    translationTimer = setTimeout(() => {
        translateText(inputText);
    }, TRANSLATION_DELAY);
}

document.getElementById('to-translate').addEventListener('input', function(e) {
    startTranslationTimer(e.target.value);
});