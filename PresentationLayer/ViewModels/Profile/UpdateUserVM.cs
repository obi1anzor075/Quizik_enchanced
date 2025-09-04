using System.ComponentModel.DataAnnotations;

namespace PresentationLayer.ViewModels.Profile
{
    public class UpdateUserVM
    {
        [Required]
        public string? Name { get; set; }
        [Required]
        public string? Email { get; set; }
    }
}
