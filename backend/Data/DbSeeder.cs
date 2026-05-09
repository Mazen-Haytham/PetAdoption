using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class DbSeeder
{
    public static async Task MigrateAndSeedAsync(AppDbContext db, CancellationToken ct = default)
    {
        await db.Database.MigrateAsync(ct);
        await SeedAsync(db, ct);
    }

    public static async Task SeedAsync(AppDbContext db, CancellationToken ct = default)
    {
        // Keep this idempotent: we only insert missing rows by unique keys (e.g. email).
        var hasher = new PasswordHasher<User>();

        async Task<User> EnsureUserAsync(string name, string email, string password, UserRole role, AccountStatus status)
        {
            var existing = await db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);
            if (existing is not null) return existing;

            var user = new User
            {
                Name = name,
                Email = email,
                Role = role,
                Status = status
            };

            user.Password = hasher.HashPassword(user, password);
            db.Users.Add(user);
            await db.SaveChangesAsync(ct);
            return user;
        }

        var admin = await EnsureUserAsync(
            name: "Admin",
            email: "admin@petpal.local",
            password: "Admin123!",
            role: UserRole.Admin,
            status: AccountStatus.Approved
        );

        var owner1 = await EnsureUserAsync(
            name: "Michael Brown",
            email: "michael.brown@example.com",
            password: "Owner123!",
            role: UserRole.Owner,
            status: AccountStatus.Approved
        );

        var owner2 = await EnsureUserAsync(
            name: "David Wilson",
            email: "david.wilson@example.com",
            password: "Owner123!",
            role: UserRole.Owner,
            status: AccountStatus.Approved
        );

        var adopter1 = await EnsureUserAsync(
            name: "Alice Johnson",
            email: "alice.johnson@example.com",
            password: "Adopter123!",
            role: UserRole.Adopter,
            status: AccountStatus.Approved
        );

        var adopter2 = await EnsureUserAsync(
            name: "Emily Davis",
            email: "emily.davis@example.com",
            password: "Adopter123!",
            role: UserRole.Adopter,
            status: AccountStatus.Approved
        );

        // Seed baseline pets/posts once (but always ensure interactions below).
        if (!await db.PetPosts.AnyAsync(ct))
        {
            var pets = new[]
            {
                new Pet { OwnerId = owner1.Id, Name = "Rocky", Type = "Dog", Breed = "Bulldog", Location = "Houston", Age = 5, Status = PetStatus.Available },
                new Pet { OwnerId = owner1.Id, Name = "Luna",  Type = "Cat", Breed = "Persian", Location = "San Diego", Age = 1, Status = PetStatus.Adopted },
                new Pet { OwnerId = owner2.Id, Name = "Max",   Type = "Dog", Breed = "German Shepherd", Location = "Dallas", Age = 3, Status = PetStatus.Available },
                new Pet { OwnerId = owner2.Id, Name = "Bella", Type = "Cat", Breed = "Maine Coon", Location = "San Jose", Age = 2, Status = PetStatus.Available },
                new Pet { OwnerId = owner2.Id, Name = "Coco",  Type = "Bird", Breed = "Parrot", Location = "Austin", Age = 4, Status = PetStatus.Available },
            };

            db.Pets.AddRange(pets);
            await db.SaveChangesAsync(ct);

            var posts = new[]
            {
                new PetPost { PetId = pets[0].Id, OwnerId = owner1.Id, Description = "Rocky is a strong and loyal bulldog, great with kids and families.", HealthStatus = "Healthy", Status = PetStatus.Available },
                new PetPost { PetId = pets[1].Id, OwnerId = owner1.Id, Description = "Luna is a calm Persian cat who has already found a loving home.", HealthStatus = "Healthy", Status = PetStatus.Adopted },
                new PetPost { PetId = pets[2].Id, OwnerId = owner2.Id, Description = "Max is an energetic German Shepherd, perfect for active owners.", HealthStatus = "Healthy", Status = PetStatus.Available },
                new PetPost { PetId = pets[3].Id, OwnerId = owner2.Id, Description = "Bella is a gentle Maine Coon who loves attention and indoor life.", HealthStatus = "Healthy", Status = PetStatus.Available },
                new PetPost { PetId = pets[4].Id, OwnerId = owner2.Id, Description = "Coco is a colorful parrot that enjoys interaction and can mimic sounds.", HealthStatus = "Healthy", Status = PetStatus.Available },
            };

            db.PetPosts.AddRange(posts);
            await db.SaveChangesAsync(ct);
        }

        // Grab a stable set of posts for interactions (works even if baseline was already seeded).
        var seededPosts = await db.PetPosts
            .OrderBy(p => p.Id)
            .Take(5)
            .Select(p => new { p.Id, p.OwnerId, p.Status })
            .ToListAsync(ct);

        if (seededPosts.Count < 4)
            return;

        var post0Id = seededPosts[0].Id;
        var post1Id = seededPosts[1].Id;
        var post2Id = seededPosts[2].Id;
        var post3Id = seededPosts[3].Id;

        // Optional: a couple of favourites for UI testing
        if (!await db.UserFavourites.AnyAsync(uf => uf.AdopterId == adopter1.Id && uf.PetPostId == post0Id, ct))
            db.UserFavourites.Add(new UserFavourite { AdopterId = adopter1.Id, PetPostId = post0Id });

        if (!await db.UserFavourites.AnyAsync(uf => uf.AdopterId == adopter2.Id && uf.PetPostId == post2Id, ct))
            db.UserFavourites.Add(new UserFavourite { AdopterId = adopter2.Id, PetPostId = post2Id });

        await db.SaveChangesAsync(ct);

        // Optional: seed adoption requests + adoption interactions
        async Task<Request> EnsureRequestAsync(int adopterId, int petPostId, string message, RequestStatus status)
        {
            var existing = await db.AdoptionRequests
                .FirstOrDefaultAsync(r => r.AdopterId == adopterId && r.PetPostId == petPostId, ct);
            if (existing is not null) return existing;

            var req = new Request
            {
                AdopterId = adopterId,
                PetPostId = petPostId,
                Message = message,
                Status = status,
                CreatedAt = DateTime.UtcNow
            };
            db.AdoptionRequests.Add(req);
            await db.SaveChangesAsync(ct);
            return req;
        }

        // One pending request (owner can respond in UI)
        _ = await EnsureRequestAsync(
            adopterId: adopter2.Id,
            petPostId: post3Id,
            message: "Hi! I’d love to adopt Bella. I have a quiet home and plenty of time.",
            status: RequestStatus.Pending
        );

        // One accepted request + completed adoption + review (for Reviews UI)
        var acceptedReq = await EnsureRequestAsync(
            adopterId: adopter1.Id,
            petPostId: post1Id,
            message: "I’d like to adopt Luna. I’ve had cats before and can provide vet references.",
            status: RequestStatus.Accepted
        );

        var adoptionExists = await db.Adoptions.AnyAsync(a => a.RequestId == acceptedReq.Id, ct);
        if (!adoptionExists)
        {
            var adoption = new Adoption
            {
                AdopterId = adopter1.Id,
                OwnerId = owner1.Id,
                PetPostId = post1Id,
                RequestId = acceptedReq.Id,
                Status = AdoptionStatus.Completed,
                AdoptedAt = DateTime.UtcNow.AddDays(-14),
            };
            db.Adoptions.Add(adoption);
            await db.SaveChangesAsync(ct);

            var hasReview = await db.Reviews.AnyAsync(r => r.AdoptionId == adoption.Id, ct);
            if (!hasReview)
            {
                db.Reviews.Add(new Review
                {
                    AdoptionId = adoption.Id,
                    AdopterId = adopter1.Id,
                    OwnerId = owner1.Id,
                    Rating = 5,
                    Comment = "Smooth process and great communication. Highly recommended!",
                    CreatedAt = DateTime.UtcNow.AddDays(-7)
                });
                await db.SaveChangesAsync(ct);
            }
        }

        // Adoption history (used by some UIs as “past experience”)
        var hasHistory = await db.AdoptionHistories.AnyAsync(h => h.AdopterId == adopter1.Id, ct);
        if (!hasHistory)
        {
            db.AdoptionHistories.Add(new AdoptionHistory
            {
                AdopterId = adopter1.Id,
                PetName = "Buddy",
                PetType = "Dog",
                Year = DateTime.UtcNow.Year - 3,
                Notes = "Adopted from a local shelter; friendly and well-trained."
            });
            await db.SaveChangesAsync(ct);
        }

        // Optional: seed approval requests to exercise admin flows
        var seedApprovalRequests = new[]
        {
            new PostApprovalRequest
            {
                PetPostId = post0Id,
                OwnerId = owner1.Id,
                Status = PostApprovalStatus.Approved,
                ReviewedByAdminId = admin.Id
            },
            new PostApprovalRequest
            {
                PetPostId = post2Id,
                OwnerId = owner2.Id,
                Status = PostApprovalStatus.Pending
            }
        };

        foreach (var req in seedApprovalRequests)
        {
            var exists = await db.PostApprovalRequests.AnyAsync(r => r.PetPostId == req.PetPostId, ct);
            if (!exists)
                db.PostApprovalRequests.Add(req);
        }

        await db.SaveChangesAsync(ct);
    }
}

