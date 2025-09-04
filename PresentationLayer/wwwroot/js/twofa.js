// Скрипт для отправки кода 2FA на сервер

function verify2FA() {
    var code = $('#verificationCode').val();
    var button = $('.profile-button-2fa'); // Кнопка "Подтвердить" в модальном окне

    // Проверяем, что код введен
    if (!code || code.length !== 6) {
        $('#verifyMessage').removeClass('text-success').addClass('text-danger').text('Введите 6-значный код');
        return;
    }

    // Добавляем класс для пульсации, кнопка начинает пульсировать
    button.addClass('button-pulse');
    button.text("Подождите...");
    button.prop('disabled', true); // Отключаем кнопку на время запроса

    $.ajax({
        type: "POST",
        url: "/Profile/Verify2FACode",
        data: { code: code },
        success: function (response) {
            if (response.success) {
                // Показываем сообщение об успехе
                showMessage(response.message, 'success');

                setTimeout(function () {
                    closeModal('twoFAModal'); // Закрываем модальное окно
                    location.reload(); // Перезагружаем страницу
                }, 2000);
            } else {
                showMessage(response.message, 'error');
            }
        },
        error: function () {
            showMessage('Ошибка сервера. Повторите попытку.', 'error');
        },
        complete: function () {
            // Убираем анимацию пульсации, когда запрос завершен
            button.removeClass('button-pulse');
            button.text("Подтвердить");
            button.prop('disabled', false); // Включаем кнопку обратно
        }
    });
}

// Отключение 2FA (если нужно отдельное модальное окно или кнопка)
function disable2FA() {
    var button = $('.profile-button-cancel'); // Кнопка отмены, если есть

    // Добавляем класс для пульсации, кнопка начинает пульсировать
    button.addClass('button-pulse-invert');
    button.text("Подождите...");
    button.prop('disabled', true);

    $.ajax({
        type: "POST",
        url: "/Profile/Disable2FA", // URL метода отключения 2FA
        success: function (response) {
            if (response.success) {
                showMessage(response.message, 'success');
                setTimeout(function () {
                    closeModal('twoFAModal');
                    location.reload();
                }, 2000);
            } else {
                showMessage(response.message, 'error');
            }
        },
        error: function () {
            showMessage('Ошибка сервера. Повторите попытку.', 'error');
        },
        complete: function () {
            // Убираем анимацию пульсации, когда запрос завершен
            button.removeClass('button-pulse-invert');
            button.text("Отменить");
            button.prop('disabled', false);
        }
    });
}

// Функция для показа сообщений в модальном окне
function showMessage(message, type) {
    // Удаляем существующее сообщение, если есть
    $('.modal-message').remove();

    var messageClass = type === 'success' ? 'text-success' : 'text-danger';
    var messageHtml = '<div class="modal-message ' + messageClass + '" style="margin-top: 10px; text-align: center;">' + message + '</div>';

    // Добавляем сообщение после кнопки
    $('.profile-button-2fa').after(messageHtml);
}

// Функция для закрытия модального окна (если еще не определена)
function closeModal(modalId) {
    $('#' + modalId).hide();
    // Очищаем поле ввода при закрытии
    $('#verificationCode').val('');
    // Удаляем сообщение
    $('.modal-message').remove();
}

// Обработчик нажатия Enter в поле ввода кода
$(document).ready(function () {
    $('#verificationCode').on('keypress', function (e) {
        if (e.which === 13) { // Enter key
            verify2FA();
        }
    });

    // Автоматическое форматирование кода (только цифры, максимум 6 символов)
    $('#verificationCode').on('input', function () {
        var value = $(this).val().replace(/\D/g, ''); // Убираем все нецифровые символы
        if (value.length > 6) {
            value = value.substring(0, 6); // Ограничиваем до 6 символов
        }
        $(this).val(value);
    });
});