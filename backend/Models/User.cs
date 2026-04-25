// User.cs
using backend.Data;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace backend.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }

        [Required]
        public UserRole Role { get; set; }

        public AccountStatus Status { get; set; } = AccountStatus.Pending;

        // ── Navigation ─────────────────────────────────
        public ICollection<UserFavourite> UserFavourites { get; set; } = new List<UserFavourite>();
    }
}