document.addEventListener('DOMContentLoaded', () => {
    createbackParticles();
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
function createbackParticles() {
    const container = document.getElementById('backParticles');
    if (!container) return;

    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const sizeClass = ['small', 'medium', 'large'][Math.floor(Math.random() * 3)];
        particle.className = `particles ${sizeClass}`;

        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (20 + Math.random() * 10) + 's';

        container.appendChild(particle);
    }
}


// Dev modal
// Initialize development features modal
function initDevFeatures() {
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('dev-feature') ||
            e.target.closest('.dev-feature')) {
            e.preventDefault();
            e.stopPropagation();
            showDevModal();
        }
    });
}
function showDevModal() {
    const modal = document.getElementById('devModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Add a subtle shake animation to the modal
    const content = modal.querySelector('.dev-modal-content');
    content.style.animation = 'none';
    setTimeout(() => {
        content.style.animation = 'devModalSlide 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    }, 10);
}

function closeDevModal() {
    const modal = document.getElementById('devModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal on outside click
document.addEventListener('click', function (e) {
    const modal = document.getElementById('devModal');
    if (e.target === modal) {
        closeDevModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeDevModal();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    initDevFeatures();
});
