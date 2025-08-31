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
// Generate floating particles
function createParticles() {
    const effectsContainer = document.querySelector('.animated-effects');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = `particle ${['small', 'medium', 'large'][Math.floor(Math.random() * 3)]}`;

        // Random horizontal position
        particle.style.left = Math.random() * 100 + '%';

        // Random animation delay
        particle.style.animationDelay = Math.random() * 15 + 's';

        // Random animation duration variation
        particle.style.animationDuration = (12 + Math.random() * 8) + 's';

        effectsContainer.appendChild(particle);
    }
}

// Generate additional glowing dots randomly
function createRandomGlowDots() {
    const effectsContainer = document.querySelector('.animated-effects');
    const dotCount = 15;

    for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('div');
        dot.className = 'glow-dot';

        dot.style.top = Math.random() * 100 + '%';
        dot.style.left = Math.random() * 100 + '%';
        dot.style.animationDelay = Math.random() * 3 + 's';
        dot.style.animationDuration = (2 + Math.random() * 2) + 's';

        effectsContainer.appendChild(dot);
    }
}

// Create floating geometric shapes dynamically
function createFloatingShapes() {
    const effectsContainer = document.querySelector('.animated-effects');
    const shapes = ['diamond', 'hexagon', 'pentagon'];
    const shapeCount = 12;

    for (let i = 0; i < shapeCount; i++) {
        const shape = document.createElement('div');
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        shape.className = `geometric-shape ${randomShape}`;

        shape.style.top = Math.random() * 100 + '%';
        shape.style.left = Math.random() * 100 + '%';
        shape.style.animationDelay = Math.random() * 12 + 's';
        shape.style.animationDuration = (8 + Math.random() * 6) + 's';

        effectsContainer.appendChild(shape);
    }
}

// Create dynamic spirals
function createSpirals() {
    const effectsContainer = document.querySelector('.animated-effects');
    const spiralCount = 8;

    for (let i = 0; i < spiralCount; i++) {
        const spiral = document.createElement('div');
        spiral.className = 'spiral';

        spiral.style.top = Math.random() * 100 + '%';
        spiral.style.left = Math.random() * 100 + '%';
        spiral.style.animationDelay = Math.random() * 6 + 's';
        spiral.style.animationDuration = (4 + Math.random() * 4) + 's';

        effectsContainer.appendChild(spiral);
    }
}

// Create periodic waves
function createWave() {
    const effectsContainer = document.querySelector('.animated-effects');
    const wave = document.createElement('div');
    wave.className = 'wave';

    wave.style.top = Math.random() * 100 + '%';
    wave.style.left = Math.random() * 100 + '%';

    effectsContainer.appendChild(wave);

    // Remove wave after animation completes
    setTimeout(() => {
        if (wave.parentNode) {
            wave.parentNode.removeChild(wave);
        }
    }, 5000);
}

// Initialize all effects
function initEffects() {
    createParticles();
    createRandomGlowDots();
    createFloatingShapes();
    createSpirals();

    // Create waves periodically
    setInterval(createWave, 3000);
}

// Start effects when page loads
document.addEventListener('DOMContentLoaded', initEffects);

// Add mouse interaction effect
document.addEventListener('mousemove', function (e) {
    if (Math.random() < 0.02) { // 2% chance on mouse move
        const effectsContainer = document.querySelector('.animated-effects');
        const mouseGlow = document.createElement('div');
        mouseGlow.className = 'glow-dot';
        mouseGlow.style.left = e.clientX + 'px';
        mouseGlow.style.top = e.clientY + 'px';
        mouseGlow.style.animationDuration = '1s';

        effectsContainer.appendChild(mouseGlow);

        setTimeout(() => {
            if (mouseGlow.parentNode) {
                mouseGlow.parentNode.removeChild(mouseGlow);
            }
        }, 1000);
    }
});
