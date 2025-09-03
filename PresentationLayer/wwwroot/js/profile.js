
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

    if (profileForm) {
        profileForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            // Validate required fields
            const userName = document.getElementById('userName').value.trim();
            const userEmail = document.getElementById('userEmail').value.trim();

            if (!userName) {
                alert('Пожалуйста, введите имя');
                document.getElementById('userName').focus();
                return;
            }

            if (!userEmail) {
                alert('Пожалуйста, введите email');
                document.getElementById('userEmail').focus();
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userEmail)) {
                alert('Пожалуйста, введите корректный email');
                document.getElementById('userEmail').focus();
                return;
            }

            try {
                // Show loading state
                submitBtn.textContent = 'Сохранение...';
                submitBtn.disabled = true;

                // Prepare FormData for ASP.NET
                const formData = new FormData();
                formData.append('UserName', userName);
                formData.append('UserEmail', userEmail);

                // Add avatar file if selected
                const avatarFile = document.getElementById('avatar').files[0];
                if (avatarFile) {
                    formData.append('Avatar', avatarFile);
                }

                // Get anti-forgery token if present
                const tokenInput = this.querySelector('input[name="__RequestVerificationToken"]');
                if (tokenInput) {
                    formData.append('__RequestVerificationToken', tokenInput.value);
                }

                // Send request to ASP.NET controller
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                if (response.ok) {
                    const result = await response.json();

                    if (result.success) {
                        alert('Профиль успешно обновлен!');

                        // Update UI if needed
                        if (result.avatarUrl) {
                            const imagePreview = document.getElementById('imagePreview');
                            if (imagePreview && imagePreview.querySelector('img')) {
                                // Avatar preview is already updated by the file input handler
                            }
                        }
                    } else {
                        alert(result.message || 'Произошла ошибка при сохранении');
                    }
                } else {
                    // Handle HTTP errors
                    if (response.status === 400) {
                        const errorData = await response.json();
                        let errorMessage = 'Ошибка валидации:\n';

                        if (errorData.errors) {
                            Object.keys(errorData.errors).forEach(key => {
                                errorMessage += `${key}: ${errorData.errors[key].join(', ')}\n`;
                            });
                        } else {
                            errorMessage = errorData.message || 'Некорректные данные';
                        }

                        alert(errorMessage);
                    } else if (response.status === 413) {
                        alert('Файл слишком большой. Пожалуйста, выберите файл меньшего размера.');
                    } else {
                        alert('Произошла ошибка сервера. Пожалуйста, попробуйте позже.');
                    }
                }

            } catch (error) {
                console.error('Error:', error);
                alert('Произошла ошибка при отправке данных. Проверьте интернет-соединение.');
            } finally {
                // Restore button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
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