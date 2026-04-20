// AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Data;

namespace backend.Data
{
      public class AppDbContext : DbContext
      {
            public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

            // ── Tables ─────────────────────────────────────
            public DbSet<User> Users { get; set; }
            public DbSet<Pet> Pets { get; set; }
            public DbSet<PetPost> PetPosts { get; set; }
            public DbSet<PetImage> PetImages { get; set; }
            public DbSet<UserFavourite> UserFavourites { get; set; }
            public DbSet<Request> AdoptionRequests { get; set; }
            public DbSet<Adoption> Adoptions { get; set; }
            public DbSet<AdoptionHistory> AdoptionHistories { get; set; }
            public DbSet<Review> Reviews { get; set; }
            public DbSet<PostApprovalRequest> PostApprovalRequests { get; set; }
            protected override void OnModelCreating(ModelBuilder modelBuilder)
            {
                  base.OnModelCreating(modelBuilder);

                  // ── User ────────────────────────────────────
                  modelBuilder.Entity<User>(entity =>
                  {
                        entity.HasIndex(u => u.Email).IsUnique();

                        entity.Property(u => u.Role)
                        .HasConversion<string>();

                        entity.Property(u => u.Status)
                        .HasConversion<string>()
                        .HasDefaultValue(AccountStatus.Pending);
                  });

                  // ── Pet ─────────────────────────────────────
                  modelBuilder.Entity<Pet>(entity =>
                  {
                        entity.Property(p => p.Status)
                        .HasConversion<string>()
                        .HasDefaultValue(PetStatus.Available);

                        entity.HasOne(p => p.Owner)
                        .WithMany()
                        .HasForeignKey(p => p.OwnerId)
                        .OnDelete(DeleteBehavior.Restrict);
                  });

                  // ── PetPost ─────────────────────────────────
                  modelBuilder.Entity<PetPost>(entity =>
                  {
                        entity.Property(p => p.Status)
                        .HasConversion<string>()
                        .HasDefaultValue(PetStatus.Available);

                        entity.HasOne(p => p.Pet)
                        .WithMany()
                        .HasForeignKey(p => p.PetId)
                        .OnDelete(DeleteBehavior.Restrict);

                        entity.HasOne(p => p.Owner)
                        .WithMany()
                        .HasForeignKey(p => p.OwnerId)
                        .OnDelete(DeleteBehavior.Restrict);

                        // One post → one adoption
                        entity.HasOne(p => p.Adoptions)
                        .WithOne(a => a.PetPost)
                        .HasForeignKey<Adoption>(a => a.PetPostId)
                        .OnDelete(DeleteBehavior.Restrict);
                  });

                  // ── PetImage ────────────────────────────────
                  modelBuilder.Entity<PetImage>(entity =>
                  {
                        entity.HasOne(pi => pi.PetPost)
                        .WithMany(p => p.Images)
                        .HasForeignKey(pi => pi.PetPostId)
                        .OnDelete(DeleteBehavior.Cascade);
                  });

                  // ── UserFavourite ───────────────────────────
                  modelBuilder.Entity<UserFavourite>(entity =>
                  {
                        // Adopter can favourite a post only once
                        entity.HasIndex(uf => new { uf.AdopterId, uf.PetPostId }).IsUnique();

                        entity.HasOne(uf => uf.Adopter)
                        .WithMany(u => u.UserFavourites)
                        .HasForeignKey(uf => uf.AdopterId)
                        .OnDelete(DeleteBehavior.Cascade);

                        entity.HasOne(uf => uf.PetPost)
                        .WithMany(p => p.UserFavourite)
                        .HasForeignKey(uf => uf.PetPostId)
                        .OnDelete(DeleteBehavior.Cascade);
                  });

                  // ── AdoptionRequest ─────────────────────────
                  modelBuilder.Entity<Request>(entity =>
                  {
                        entity.Property(r => r.Status)
                        .HasConversion<string>()
                        .HasDefaultValue(RequestStatus.Pending);

                        entity.HasOne(r => r.PetPost)
                        .WithMany(p => p.Requests)
                        .HasForeignKey(r => r.PetPostId)
                        .OnDelete(DeleteBehavior.Cascade);

                        entity.HasOne(r => r.Adopter)
                        .WithMany()
                        .HasForeignKey(r => r.AdopterId)
                        .OnDelete(DeleteBehavior.Restrict);

                        // One request → one adoption
                        entity.HasOne(r => r.Adoption)
                        .WithOne(a => a.Request)
                        .HasForeignKey<Adoption>(a => a.RequestId)
                        .OnDelete(DeleteBehavior.Restrict);
                  });

                  // ── Adoption ────────────────────────────────
                  modelBuilder.Entity<Adoption>(entity =>
                  {
                        entity.Property(a => a.Status)
                        .HasConversion<string>()
                        .HasDefaultValue(AdoptionStatus.Completed);

                        entity.HasOne(a => a.Adopter)
                        .WithMany()
                        .HasForeignKey(a => a.AdopterId)
                        .OnDelete(DeleteBehavior.Restrict);

                        entity.HasOne(a => a.Owner)
                        .WithMany()
                        .HasForeignKey(a => a.OwnerId)
                        .OnDelete(DeleteBehavior.Restrict);
                  });

                  // ── AdoptionHistory ─────────────────────────
                  modelBuilder.Entity<AdoptionHistory>(entity =>
                  {
                        entity.HasOne(ah => ah.Adopter)
                        .WithMany()
                        .HasForeignKey(ah => ah.AdopterId)
                        .OnDelete(DeleteBehavior.Restrict);
                  });

                  // ── Review ──────────────────────────────────
                  modelBuilder.Entity<Review>(entity =>
                  {
                        entity.HasOne(r => r.Adoption)
                        .WithOne()
                        .HasForeignKey<Review>(r => r.AdoptionId)
                        .OnDelete(DeleteBehavior.Restrict);

                        entity.HasOne(r => r.Adopter)
                        .WithMany()
                        .HasForeignKey(r => r.AdopterId)
                        .OnDelete(DeleteBehavior.Restrict);

                        entity.HasOne(r => r.Owner)
                        .WithMany()
                        .HasForeignKey(r => r.OwnerId)
                        .OnDelete(DeleteBehavior.Restrict);
                  });
                  modelBuilder.Entity<PostApprovalRequest>(entity =>
                  {
                        entity.Property(p => p.Status)
                                    .HasConversion<string>()
                                    .HasDefaultValue(PostApprovalStatus.Pending);

                        entity.HasOne(p => p.PetPost)
                                    .WithOne(pp => pp.PostApprovalRequest)
                                    .HasForeignKey<PostApprovalRequest>(p => p.PetPostId)
                                    .OnDelete(DeleteBehavior.Cascade);

                        entity.HasOne(p => p.Owner)
                                    .WithMany()
                                    .HasForeignKey(p => p.OwnerId)
                                    .OnDelete(DeleteBehavior.Restrict);

                        entity.HasOne(p => p.ReviewedByAdmin)
                                    .WithMany()
                                    .HasForeignKey(p => p.ReviewedByAdminId)
                                    .OnDelete(DeleteBehavior.Restrict);
                  });

            }

      }
}