document.addEventListener('DOMContentLoaded', () => {
    const backButton = document.getElementById('backButton');

    if (backButton) {
        backButton.addEventListener('click', () => {
            // Отправляем запрос на сброс счетчика верных ответов и CurrentQuestionId
            fetch('/Game/ResetCounters');
            fetch('/SelectMode/ResetCounters');
        });
    }
});

//анимации фона
// Create animated particles
function createLoginParticles() {
    const container = document.getElementById('loginParticles');
    if (!container) return;

    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const sizeClass = ['small', 'medium', 'large'][Math.floor(Math.random() * 3)];
        particle.className = `login-particle ${sizeClass}`;

        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (20 + Math.random() * 10) + 's';

        container.appendChild(particle);
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function () {
    // Create particles
    createLoginParticles();
});

