using BusinessLogicLayer.Services.Contracts;
using DataAccessLayer.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PresentationLayer.Models;
using PresentationLayer.ViewModels;
using System.Security.Claims;

namespace PresentationLayer.Controllers
{
    public class AccountController : Controller
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;

        private readonly IImageService _imageService;
        private readonly IAdminTokenService _adminTokenService;

        public AccountController(UserManager<User> userManager, SignInManager<User> signInManager,IImageService imageService, IAdminTokenService adminTokenService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _imageService = imageService;
            _adminTokenService = adminTokenService;
        }

        public IActionResult Login()
        {
            //var localizedStrings = _localizer.GetAllLocalizedStrings("Login");
            //ViewData["LocalizedStrings"] = localizedStrings;

            if (User.Identity.IsAuthenticated)
            {
                var user = _userManager.FindByNameAsync(User.Identity.Name).Result;
                if (user != null)
                {
                    if (user.TwoFactorEnabled && !_signInManager.IsSignedIn(User))
                    {
                        return RedirectToAction("Verify2FA", new { userId = user.Id });
                    }

                    SaveUserNameInCookie(user.Name);
                    return RedirectToAction("SelectMode","Home");
                }
            }

            return View();
        }


        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> LoginAsync(LoginVM model)
        {
            // Локализация
            //var localizedStrings = _localizer.GetAllLocalizedStrings("Login");
            //ViewData["LocalizedStrings"] = localizedStrings;

            if (ModelState.IsValid)
            {
                var user = await _userManager.FindByNameAsync(model.Email!);
                if (user == null)
                {
                    ModelState.AddModelError(string.Empty, "Неверное имя пользователя или пароль.");
                    return View(model);
                }

                var result = await _signInManager.PasswordSignInAsync(user, model.Password!, model.RememberMe, lockoutOnFailure: false);

                if (result.Succeeded)
                {
                    return RedirectToAction("SelectMode", "Home");
                }
                else if (result.RequiresTwoFactor)
                {
                    // Перенаправление на страницу 2FA
                    return RedirectToAction("Verify2FA", "Account", new { userId = ((IdentityUser)user).Id, rememberMe = model.RememberMe });
                }

                ModelState.AddModelError(string.Empty, "Неверное имя пользователя или пароль.");
            }

            return View(model);
        }

        public IActionResult Register()
        {
            // Локализация
            //var localizedStrings = _localizer.GetAllLocalizedStrings("Register");

            //// Передача строк в ViewData
            //ViewData["LocalizedStrings"] = localizedStrings;

            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Register(RegisterVM model)
        {
            // Локализация
            //var localizedStrings = _localizer.GetAllLocalizedStrings("Register");
            //ViewData["LocalizedStrings"] = localizedStrings;

            var token = model.Token;

            if (ModelState.IsValid)
            {
                // Деструктуризованный кортеж с данными изобрадения и его именем
                var (imageData, fileName) = await _imageService.GetRandomProfilePictureAsync();

                User user = new()
                {
                    UserName = model.Email,
                    Name = model.UserName,
                    Email = model.Email,
                    CreatedAt = DateTime.Now,
                    ProfilePicture = imageData,
                    ProfilePictureFileName = fileName // Сохраняем имя файла
                };

                var result = await _userManager.CreateAsync(user, model.Password!);

                if (result.Succeeded)
                {
                    bool isAdmin = await _adminTokenService.ValidateTokenAsync(token);

                    if (!string.IsNullOrEmpty(user.Name))
                    {
                        await _userManager.AddClaimAsync(user, new Claim(ClaimTypes.Name, user.Name));
                    }

                    SaveUserNameInCookie(model.UserName!);

                    if (isAdmin)
                    {
                        await _userManager.AddToRoleAsync(user, "Admin");
                        await _adminTokenService.InvalidateTokenAsync(token);
                    }
                    else
                    {
                        await _userManager.AddToRoleAsync(user, "User");
                    }

                    await _signInManager.SignInAsync(user, isPersistent: false);
                    return RedirectToAction("SelectMode", "Home");
                }

                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError("", error.Description);
                }
            }

            return View(model);
        }

        [AllowAnonymous]
        public IActionResult LoginGoogle()
        {
            string redirectUrl = Url.Action("GoogleResponse", "Account");
            var properties = _signInManager.ConfigureExternalAuthenticationProperties("Google", redirectUrl);
            return new ChallengeResult("Google", properties);
        }

       
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return RedirectToAction("Login", "Account");
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult Verify2FA(string userId, bool rememberMe)
        {
            return View(new Verify2FAModel { UserId = userId, RememberMe = rememberMe });
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Verify2FA(Verify2FAModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var user = await _userManager.FindByIdAsync(model.UserId);
            if (user == null) return NotFound();

            var result = await _signInManager.TwoFactorAuthenticatorSignInAsync(model.Code, model.RememberMe, rememberClient: false);
            if (result.Succeeded)
            {
                return Json(new { success = true, redirectUrl = Url.Action("SelectMode", "Home") });
            }

            ModelState.AddModelError(string.Empty, "Неверный код подтверждения.");
            return View(model);
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

        //[AllowAnonymous]
        //public async Task<IActionResult> GoogleResponse()
        //{
        //    //// Локализация
        //    //var localizedStrings = _localizer.GetAllLocalizedStrings("SelectMode");

        //    //// Передача строк в ViewData
        //    //ViewData["LocalizedStrings"] = localizedStrings;

        //    var info = await _signInManager.GetExternalLoginInfoAsync();
        //    if (info == null)
        //    {
        //        return RedirectToAction(nameof(Login));
        //    }

        //    var result = await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, isPersistent: false);
        //    if (result.Succeeded)
        //    {
        //        string userName = info.Principal.FindFirst(ClaimTypes.Name)?.Value.Split(' ')[0];
        //        SaveUserNameInCookie(userName);
        //        return RedirectToAction("SelectMode");
        //    }

        //    var email = info.Principal.FindFirst(ClaimTypes.Email)?.Value;
        //    var googleId = info.Principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        //    var name = info.Principal.FindFirst(ClaimTypes.Name)?.Value;

        //    if (string.IsNullOrEmpty(googleId) || string.IsNullOrEmpty(email))
        //    {
        //        return RedirectToAction(nameof(Login));
        //    }

        //    var user = await _userManager.FindByEmailAsync(email);
        //    if (user == null)
        //    {
        //        var fakePassword = "C0mpl3xP@ssw0rd!";

        //        user = new User
        //        {
        //            GoogleId = googleId,
        //            Email = email,
        //            UserName = email,
        //            Name = name.Split(' ')[0],
        //            CreatedAt = DateTime.UtcNow,
        //            EmailConfirmed = true
        //        };

        //        // Manually hash the placeholder password and set the PasswordHash property
        //        user.PasswordHash = _passwordHasher.HashPassword(user, fakePassword);

        //        var createResult = await _userManager.CreateAsync(user);
        //        if (!createResult.Succeeded)
        //        {
        //            return RedirectToAction(nameof(Login));
        //        }

        //        createResult = await _userManager.AddLoginAsync(user, info);
        //        if (!createResult.Succeeded)
        //        {
        //            return RedirectToAction(nameof(Login));
        //        }
        //    }
        //    else
        //    {
        //        user.GoogleId = googleId;
        //        user.Name = name.Split(' ')[0]; // Assume first name only
        //        await _userManager.UpdateAsync(user);
        //    }

        //    await _signInManager.SignInAsync(user, isPersistent: false);
        //    SaveUserNameInCookie(user.Name);

        //    return RedirectToAction("SelectMode");
        //}

    }
}
