using BusinessLogicLayer.Services.Contracts;
using DataAccessLayer.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PresentationLayer.Models;
using PresentationLayer.ViewModels.Profile;

namespace PresentationLayer.Controllers
{
    [Authorize]
    public class ProfileController : Controller
    {
        private readonly UserManager<User> _userManager;
        
        private readonly IUserService _userService;
        private readonly IQuizService _quizService;
        private readonly IImageService _imageService;
        private readonly IAuthService _authService;

        public ProfileController(UserManager<User> userManager, IUserService userService, IQuizService quizService, IImageService imageService, IAuthService authService)
        {
            _userManager = userManager;
            _userService = userService;
            _quizService = quizService;
            _imageService = imageService;
            _authService = authService;
        }

        [Authorize]
        public async Task<IActionResult> Profile()
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
                return RedirectToAction("Login", "Account");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return RedirectToAction("Login", " Account");

            ViewBag.Name = user.Name;
            ViewBag.Email = user.Email;

            // Получаем изображение профиля в формате Base64
            ViewBag.ProfilePicture = await _userService.GetProfilePictureBase64Async(user);

            // Генерация QR-кода для 2FA
            ViewBag.QrCodeImageUrl = await _userService.GenerateQRCodeForUserAsync(user);

            // Генерация секретного ключа
            ViewBag.SecretKey = await _userService.GenerateSecretKeyForUserAsync(user);

            // Получаем результаты викторин
            ViewBag.QuizResults = await _quizService.GetQuizResultsByUserAsync(user.Id);

            return View(user);
        }

        [HttpPost]
        [Authorize]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateProfile(UpdateUserVM updatedUser, IFormFile avatar)
        {
            if (!ModelState.IsValid)
                return View(updatedUser);

            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Email == updatedUser.Email);
            if (user == null) return NotFound();

            user.Name = updatedUser.Name;
            user.Email = updatedUser.Email;
            user.UserName = updatedUser.Email;
            user.NormalizedEmail = updatedUser.Email.ToUpper();

            if (avatar != null && avatar.Length > 0)
            {
                user.ProfilePictureFileName = avatar.FileName;

                var imageBytes = await _imageService.ProcessImageAsync(avatar);

                user.ProfilePicture = await _imageService.ResizeImageIfNecessaryAsync(imageBytes, maxWidth: 150, maxHeight: 150);
            }

            await _userManager.UpdateAsync(user);
            return RedirectToAction("Profile");
        }

        //Отключение 2FA
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Disable2FA()
        {
            var result = await _authService.Disable2FAAsync(User);
            if (result is OkObjectResult okResult)
            {
                return Json(new { success = true, message = "Двухфакторная аутентификация отключена." });
            }
            else if (result is BadRequestObjectResult badRequestResult)
            {
                // Обработка ошибки
                return Json(new { success = false, message = "Ошибка при отключении 2FA." });
            }
            return View("Error", new ErrorViewModel { ErrorMessage = "Unknown error" });
        }

        // Валидация кода из Google Authenticator
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Verify2FACode(string code)
        {
            var user = await _userManager.GetUserAsync(User);

            var isValid = await _userManager.VerifyTwoFactorTokenAsync(user, "Authenticator", code);
            if (isValid)
            {
                user.TwoFactorEnabled = true;
                await _userManager.UpdateAsync(user);
                return Json(new { success = true, message = "2FA успешно активирована!" });
            }

            return Json(new { success = false, message = "Неверный код. Повторите попытку." });
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> ChangePassword(string currentPassword, string newPassword)
        {
            var verifyResult = await _userService.VerifyCurrentPasswordAsync(User, currentPassword);

            if(verifyResult != true)
            {
                return Json(new { success = false, message = "Введите правильный пароль" });
            }

            var isPasswordChanged = await _userService.ChangePasswordAsync(User, currentPassword, newPassword);

            if (isPasswordChanged)
            {
                return Json(new { success = true, message = "Пароль успешно изменен." });
            }
            else
            {
                return Json(new { success = false, message = "Пароль не соответствует требованиям безопасности." });
            }
        }

    }
}
