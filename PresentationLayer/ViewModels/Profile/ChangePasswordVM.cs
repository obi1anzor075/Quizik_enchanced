using System.ComponentModel.DataAnnotations;

namespace PresentationLayer.ViewModels.Profile
{
    public class ChangePasswordVM
    {
        [Required]
        public string CurrentPassword { get; set; }
        [Required]
        public string NewPassword { get; set; }
        [Required]
        public string ConfirmPassword { get; set; }
    }
}
