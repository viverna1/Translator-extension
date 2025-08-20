document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const inputTextarea = document.getElementById('to-translate');
    const outputTextarea = document.getElementById('translation');
    const clearButton = document.getElementById('clear-input');
    const copyButton = document.getElementById('copy-output');
    const languageSelect = document.querySelector('.lang');
    const loader = document.getElementById('loader');
    
    // Переменные
    let debounceTimer;
    const debounceDelay = 500; // Задержка перед отправкой запроса
    
    // Показ/скрытие кнопок очистки и копирования
    inputTextarea.addEventListener('input', function() {
        if (inputTextarea.value.trim() !== '') {
            clearButton.style.display = 'block';
            translateText();
        } else {
            clearButton.style.display = 'none';
            outputTextarea.value = '';
            copyButton.style.display = 'none';
        }
    });
    
    // Очистка поля ввода
    clearButton.addEventListener('click', function() {
        inputTextarea.value = '';
        outputTextarea.value = '';
        clearButton.style.display = 'none';
        copyButton.style.display = 'none';
        inputTextarea.focus();
    });
    
    // Копирование текста
    copyButton.addEventListener('click', function() {
        outputTextarea.select();
        document.execCommand('copy');
        
        // Визуальное подтверждение копирования
        const originalIcon = copyButton.innerHTML;
        copyButton.innerHTML = '<i class="fas fa-check"></i>';
        
        setTimeout(() => {
            copyButton.innerHTML = originalIcon;
        }, 1500);
    });
    
    // Изменение языка перевода
    languageSelect.addEventListener('change', function() {
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
            return;
        }
        
        // Показываем лоадер
        loader.style.display = 'block';
        
        // Очищаем предыдущий таймер
        clearTimeout(debounceTimer);
        
        // Устанавливаем новый таймер
        debounceTimer = setTimeout(() => {
            // Здесь должен быть реальный API-запрос к сервису перевода
            // Для демонстрации используем заглушку
            simulateTranslation(text, targetLang);
        }, debounceDelay);
    }
    
    // Заглушка для имитации перевода (замените на реальный API)
    function simulateTranslation(text, targetLang) {
        // Имитация задержки сети
        setTimeout(() => {
            // В реальном приложении здесь будет fetch или axios запрос
            // к API переводчика (Yandex, Google, etc.)
            
            const languages = {
                'en': 'English',
                'ru': 'Russian',
                'ua': 'Ukrainian',
                'de': 'German',
                'fr': 'French',
                'es': 'Spanish'
            };
            
            outputTextarea.value = `[${languages[targetLang]} Translation]: ${text}`;
            
            // Показываем кнопку копирования
            copyButton.style.display = 'block';
            
            // Скрываем лоадер
            loader.style.display = 'none';
        }, 800);
    }
    
    // Настройки (заглушка)
    document.querySelector('.settings-icon').addEventListener('click', function() {
        alert('Настройки будут реализованы в будущей версии');
    });
});



// Добавьте эту функцию в ваш скрипт
function adjustTextareaHeight(textarea) {
    // Минимальная высота
    const minHeight = 150;
    
    // Сброс высоты чтобы получить правильный scrollHeight
    textarea.style.height = 'auto';
    
    // Установка новой высоты based on scrollHeight
    const newHeight = Math.max(textarea.scrollHeight, minHeight);
    textarea.style.height = newHeight + 'px';
    
    return newHeight;
}

// Добавьте этот обработчик событий в DOMContentLoaded
inputTextarea.addEventListener('input', function() {
    // Регулируем высоту textarea
    adjustTextareaHeight(this);
    
    // Регулируем высоту контейнера перевода
    if (outputTextarea.value) {
        adjustTextareaHeight(outputTextarea);
    }
    
    // Остальная существующая логика...
    if (inputTextarea.value.trim() !== '') {
        clearButton.style.display = 'flex';
        translateText();
    } else {
        clearButton.style.display = 'none';
        outputTextarea.value = '';
        copyButton.style.display = 'none';
        // Восстанавливаем стандартную высоту
        outputTextarea.style.height = 'auto';
    }
});

// Также добавьте этот код для обработки изменения языка
languageSelect.addEventListener('change', function() {
    if (inputTextarea.value.trim() !== '') {
        translateText();
        // Обновляем высоту после перевода
        setTimeout(() => {
            adjustTextareaHeight(outputTextarea);
        }, 1000);
    }
});

