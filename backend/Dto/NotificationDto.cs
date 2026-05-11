namespace backend.Dto
{
    public class NotificationDto
    {
        
        public string Message { get; set; } = string.Empty;
        public int PostId { get; set; }
        public int OwnerId { get; set; } 
        public DateTime CreatedAt { get; set; }
        
    }
}