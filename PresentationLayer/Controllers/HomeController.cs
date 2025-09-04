using Microsoft.AspNetCore.Mvc;
using PresentationLayer.Models;
using System.Diagnostics;
using DataAccessLayer.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using PresentationLayer.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.StaticFiles;
using System.Text.Encodings.Web;
using BusinessLogicLayer.Services.Contracts;
using DataAccessLayer.Repositories.Contracts;


namespace PresentationLayer.Controllers
{
    public class HomeController : Controller
    {
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;

        //private readonly SharedViewLocalizer _localizer;

        public HomeController(SignInManager<User> signInManager, UserManager<User> userManager)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            //_localizer = localizer;
        }

       

        [Authorize]
        public async Task<IActionResult> SelectMode()
        {
            //// Локализация
            //var localizedStrings = _localizer.GetAllLocalizedStrings("SelectMode");

            //// Передача строк в ViewData
            //ViewData["LocalizedStrings"] = localizedStrings;

            await ClearCookies();
            
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
                return RedirectToAction("Login", "Home");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound();

            string base64ProfilePicture = string.Empty;

            if (user.ProfilePicture != null && user.ProfilePicture.Length > 0)
            {
                // Определение MIME-типа на основе расширения файла
                var provider = new FileExtensionContentTypeProvider();
                string contentType = "application/octet-stream"; // Тип по умолчанию

                if (provider.TryGetContentType(user.ProfilePictureFileName, out string detectedContentType))
                {
                    contentType = detectedContentType;
                }

                base64ProfilePicture = $"data:{contentType};base64,{Convert.ToBase64String(user.ProfilePicture)}";
            }

            ViewBag.ProfilePicture = base64ProfilePicture;
            ViewBag.Name = user.Name;
            ViewBag.Email = user.Email;

            return View();
        }

        // Страница политики конфиденциальности
        public IActionResult PrivacyPolicy()
        {
            return View();
        }

        // Страница политики использования Cookies
        public IActionResult CookiesPolicy()
        {
            return View();
        }

        // Страница правила использования
        public IActionResult TermsofUse()
        {
            return View();
        }

        // Удалить куки
        private async Task ClearCookies()
        {
            // Удаляем куки с именем "CurrentQuestionIndex"
            Response.Cookies.Delete("CurrentQuestionIndex");

            // Если требуется асинхронная обработка, можно ожидать завершения задачи
            await Task.CompletedTask;
        }

        // получить имя пользователя
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetUserName()
        {
            var user = await _userManager.GetUserAsync(User);
            var name = user?.Name ?? user?.UserName;
            if (name != null)
            {
                SaveUserNameInCookie(name);
                return Json(new { userName = name });
            }

            HttpContext.Request.Cookies.TryGetValue("userName", out name);
            return Json(new { userName = name });
        }

        [HttpPost]
        [Authorize]
        public IActionResult SetLanguage(string culture, string returnUrl)
        {
            if (!string.IsNullOrEmpty(culture))
            {
                Response.Cookies.Append(
                    CookieRequestCultureProvider.DefaultCookieName,
                    CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture)),
                    new CookieOptions { Expires = DateTimeOffset.UtcNow.AddYears(1) }
                );
            }

            return LocalRedirect(returnUrl);
        }

        [Authorize]
        private void SaveUserNameInCookie(string userName)
        {
            var cookieOptions = new CookieOptions
            {
                Expires = DateTime.UtcNow.AddDays(30),
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict
            };

            if (HttpContext.Request.Cookies.ContainsKey("UserName"))
            {
                HttpContext.Response.Cookies.Delete("UserName");
            }

            HttpContext.Response.Cookies.Append("UserName", userName, cookieOptions);
        }


        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}