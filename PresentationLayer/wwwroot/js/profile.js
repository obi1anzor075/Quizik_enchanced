
// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Form submission handler
function setupProfileForm() {
    const profileForm = document.getElementById('profileForm');
    if (!profileForm) return;

    profileForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const form = this;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : '';
        const avatarEl = form.querySelector('#avatar');
        const userNameEl = form.querySelector('#userName');
        const userEmailEl = form.querySelector('#userEmail');

        // Validate visible values
        const userName = (userNameEl?.value || '').trim();
        const userEmail = (userEmailEl?.value || '').trim();

        if (!userName) {
            alert('Пожалуйста, введите имя');
            userNameEl?.focus();
            return;
        }
        if (!userEmail) {
            alert('Пожалуйста, введите email');
            userEmailEl?.focus();
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userEmail)) {
            alert('Пожалуйста, введите корректный email');
            userEmailEl?.focus();
            return;
        }

        try {
            if (submitBtn) { submitBtn.textContent = 'Сохранение...'; submitBtn.disabled = true; }

            // Собираем FormData из формы (включая файлы и скрытые поля)
            const formData = new FormData(form);

            // Гарантируем, что поля совпадают с UpdateUserVM.Name / UpdateUserVM.Email
            // (вдруг в разметке не было name="" — тогда заменяем/дополняем)
            formData.set('Name', userName);
            formData.set('Email', userEmail);

            // Файл: контроллер ожидает IFormFile avatar
            // Если input не имеет name="avatar", FormData(form) не добавит файл — добавим вручную
            const avatarFile = avatarEl?.files?.[0];
            if (avatarFile) {
                formData.set('avatar', avatarFile); // имя параметра должно быть 'avatar'
            }

            // Анти-фрод токен (если есть в форме)
            const tokenInput = form.querySelector('input[name="__RequestVerificationToken"]');
            if (tokenInput && !formData.has('__RequestVerificationToken')) {
                formData.set('__RequestVerificationToken', tokenInput.value);
            }

            // Отправляем запрос
            const url = form.action || window.location.href;
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest' // помогает на сервере понять AJAX
                },
                redirect: 'follow' // по умолчанию
            });

            // Если сервер сделал редирект (например RedirectToAction("Profile")), перенаправим браузер
            if (response.redirected) {
                window.location.href = response.url;
                return;
            }

            // Попробуем понять тип ответа
            const contentType = (response.headers.get('content-type') || '').toLowerCase();

            if (response.ok && contentType.includes('application/json')) {
                const result = await response.json();
                if (result.success) {
                    alert('Профиль успешно обновлен!');
                    // если сервер вернул avatarUrl — обновим превью
                    if (result.avatarUrl) {
                        const imagePreview = document.getElementById('imagePreview');
                        if (imagePreview) {
                            imagePreview.innerHTML = `<img src="${result.avatarUrl}" alt="Avatar" />`;
                        }
                    }
                    // Можно обновить страницу / части UI при необходимости
                } else {
                    alert(result.message || 'Произошла ошибка при сохранении');
                    console.log('Response JSON:', result);
                }
            } else if (!response.ok) {
                // Примитивная обработка ошибок по статусу
                if (response.status === 400) {
                    // сервер может вернуть HTML или JSON — попробуем JSON, если нет — показать текст
                    const ct = (response.headers.get('content-type') || '').toLowerCase();
                    if (ct.includes('application/json')) {
                        const err = await response.json();
                        alert(err.message || 'Ошибка валидации');
                        console.log('Validation errors:', err);
                    } else {
                        const txt = await response.text();
                        console.warn('400 response (HTML):', txt);
                        alert('Ошибка валидации (см. консоль).');
                    }
                } else if (response.status === 413) {
                    alert('Файл слишком большой. Пожалуйста, выберите файл меньшего размера.');
                } else if (response.status === 401 || response.status === 403) {
                    // возможно сессия истекла — перенаправим на логин
                    window.location.reload();
                } else {
                    const txt = await response.text();
                    console.error('Server error:', response.status, txt);
                    alert('Произошла ошибка сервера. Проверьте консоль для деталей.');
                }
            } else {
                // Ответ OK, но не JSON — скорее всего сервер вернул HTML (например, View(updatedUser))
                const txt = await response.text();
                // Если это HTML со строкой формы/ошибками — можно показать предупреждение и вывести в консоль
                console.log('Non-JSON success response:', txt.slice(0, 1000));
                alert('Сервер вернул HTML-ответ. Если вы ожидаете JSON для AJAX — измените поведение сервера или уберите перехват формы в JS.');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            alert('Произошла ошибка при отправке данных. Проверьте консоль.');
        } finally {
            if (submitBtn) { submitBtn.textContent = originalText; submitBtn.disabled = false; }
        }
    });
}

// 2FA toggle
function setup2FAToggle() {
    const toggle2FABtn = document.getElementById('toggle2FA');
    let is2FAEnabled = false;

    toggle2FABtn.addEventListener('click', function () {
        if (is2FAEnabled) {
            // Disable 2FA
            if (confirm('Вы уверены, что хотите отключить двухфакторную аутентификацию?')) {
                is2FAEnabled = false;
                this.textContent = 'Включить 2FA';
                this.classList.remove('danger');
                alert('Двухфакторная аутентификация отключена');
            }
        } else {
            // Enable 2FA
            showModal('twoFAModal');
        }
    });
}

// Security form handler (if needed)
function setupSecurityForm() {
    const securityForm = document.getElementById('securityForm');

    if (securityForm) {
        securityForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const currentPassword = document.getElementById('currentPassword')?.value;
            const newPassword = document.getElementById('newPassword')?.value;
            const confirmPassword = document.getElementById('confirmPassword')?.value;

            // Validation
            if (!currentPassword) {
                alert('Введите текущий пароль');
                return;
            }

            if (!newPassword || newPassword.length < 6) {
                alert('Новый пароль должен содержать не менее 6 символов');
                return;
            }

            if (newPassword !== confirmPassword) {
                alert('Пароли не совпадают!');
                return;
            }

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            try {
                submitBtn.textContent = 'Сохранение...';
                submitBtn.disabled = true;

                const formData = new FormData();
                formData.append('CurrentPassword', currentPassword);
                formData.append('NewPassword', newPassword);
                formData.append('ConfirmPassword', confirmPassword);

                // Get anti-forgery token
                const tokenInput = this.querySelector('input[name="__RequestVerificationToken"]');
                if (tokenInput) {
                    formData.append('__RequestVerificationToken', tokenInput.value);
                }

                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                const result = await response.json();

                if (result.success) {
                    alert('Настройки безопасности обновлены!');
                    this.reset();
                } else {
                    alert(result.message || 'Произошла ошибка при обновлении пароля');
                }

            } catch (error) {
                console.error('Error:', error);
                alert('Произошла ошибка при отправке данных');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Initialize all functionality
function initializeForms() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            setupAvatarPreview();
            setupProfileForm();
            setup2FAToggle();
            setupSecurityForm();
        });
    } else {
        setupAvatarPreview();
        setupProfileForm();
        setup2FAToggle();
        setupSecurityForm();
    }

    // Show history modal
    document.getElementById('showHistoryBtn').addEventListener('click', function () {
        showModal('historyModal');
    });

    // Close modals on outside click
    window.addEventListener('click', function (e) {
        const modals = document.querySelectorAll('.profile-modal');
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
}

// Auto-initialize
initializeForms();