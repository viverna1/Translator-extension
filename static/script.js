let timer;
let timeLeft = 1; // 1 секунда

function translateText(text) {
    var el = document.getElementById('translation');
    el.value = text; // Копируем переданный текст в поле перевода
}

function startTimer(inputText) {
  clearInterval(timer); // Очищаем предыдущий таймер
  timeLeft = 1; // Сбрасываем время
  
  timer = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timer);
      translateText(inputText); // Передаем текст для перевода
      return;
    }
    timeLeft--;
  }, 1000);
}

// Сброс таймера
function resetTimer() {
  clearInterval(timer); // Останавливаем таймер
  timeLeft = 1; // Возвращаем начальное значение
  console.log("Таймер сброшен");
}

document.getElementById('to-translate').addEventListener('input', function(e) {
    startTimer(e.target.value); // Передаем текущее значение поля ввода
});