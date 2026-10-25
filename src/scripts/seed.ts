import { hashPassword } from "../middleware/auth.middleware";
import { db, pool } from "../drizzle/db";
import { user, artPiece, media } from "../drizzle/schema";
import { env } from "../config/env";
import { Subject } from "../types/enums/subject";

const subjects: Subject[] = [
  Subject.WERKPRAKTIJK_1,
  Subject.WERKPRAKTIJK_2,
  Subject.THEORIE,
  Subject.SKILLS,
  Subject.POSITIONERING,
];

async function main() {
  const dbHost = env.DB.HOST;

  if (
    env.NODE_ENV === "production" ||
    dbHost.includes("koyeb") ||
    dbHost.includes("ep-damp-dew")
  ) {
    throw new Error("❌ Seeding aborted: production database detected!");
  }

  await db.delete(media);
  await db.delete(artPiece);
  await db.delete(user);

  await db.insert(user).values({
    username: "testuser1",
    password: await hashPassword("password123"),
  });

  for (let year = 1; year <= 4; year++) {
    const moduleStart = (year - 1) * 4 + 1;
    const moduleEnd = moduleStart + 3;

    for (let module = moduleStart; module <= moduleEnd; module++) {
      for (const subject of subjects) {
        for (let i = 0; i < 3; i++) {
          const [insertedArtPiece] = await db
            .insert(artPiece)
            .values({
              title: "ArtPiece title " + (i + 1),
              description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer tempus, augue sit amet ullamcorper tempus, erat odio lobortis purus, eget auctor magna ligula vitae lectus. Nulla varius sagittis maximus. Sed sed rhoncus odio. Sed pellentesque risus ut ipsum malesuada, vel varius dolor volutpat. Curabitur blandit sem ut consectetur pellentesque. Maecenas a hendrerit augue. Praesent euismod ipsum nec maximus semper. Sed a sapien at enim placerat bibendum. Maecenas at lectus justo. Phasellus nec placerat ex. ",
              year,
              module,
              subject,
            })
            .returning();

          await db.insert(media).values([
            {
              artPieceId: insertedArtPiece.id,
              locationReference:
                "images/7a5f2b5f-78c9-434d-b612-5cd85b87fed7.jpg",
              order: 1,
            },
            {
              artPieceId: insertedArtPiece.id,
              locationReference:
                "images/7a5f2b5f-78c9-434d-b612-5cd85b87fed7.jpg",
              order: 2,
            },
            {
              artPieceId: insertedArtPiece.id,
              locationReference:
                "images/7a5f2b5f-78c9-434d-b612-5cd85b87fed7.jpg",
              order: 3,
            },
          ]);
        }
      }
    }
  }
}

main()
  .catch(async (e) => {
    console.error(e);
    await pool.end();
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    console.log("Database seeded!");
    process.exit(0);
  });
