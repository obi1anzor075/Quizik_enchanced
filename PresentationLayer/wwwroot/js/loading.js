// Показать анимацию загрузки
let loading;

function ShowProgress() {
    loading = document.getElementById("loading");
    loading.style.display = "flex";
    loading.classList.remove('fade-out');
}

// Скрыть анимацию загрузки
function HideProgress() {
    loading = document.getElementById("loading");
    loading.classList.add('fade-out');
    setTimeout(() => {
        loading.style.display = "none";
    }, 500);
}

// Автоматически показать при загрузке
ShowProgress();

// Изменение текста загрузки
const loadingTexts = [
    "Загружаю викторины...",
    "Придумываю вопросы...",
    "Почти готово...",
    "Запускаю игру..."
];

let textIndex = 0;
const loadingLabel = document.querySelector('.loading-label-page');

setInterval(() => {
    textIndex = (textIndex + 1) % loadingTexts.length;
    loadingLabel.textContent = loadingTexts[textIndex];
}, 2000);