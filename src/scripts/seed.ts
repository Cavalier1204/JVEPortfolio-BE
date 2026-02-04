import { hashPassword } from "../middleware/auth";
import prisma from "../config/prisma";
import { env } from "../config/env";
import { Subject } from "../generated/prisma/enums";

const subjects: Subject[] = [
  Subject.WERKPRAKTIJK_1,
  Subject.WERKPRAKTIJK_2,
  Subject.THEORIE,
  Subject.SKILLS,
  Subject.POSITIONERING,
];

async function main() {
  const dbUrl = env.DATABASE_URL ?? "";

  if (
    env.NODE_ENV === "production" ||
    dbUrl.includes("koyeb") ||
    dbUrl.includes("ep-damp-dew")
  ) {
    throw new Error("❌ Seeding aborted: production database detected!");
  }

  await prisma.user.create({
    data: {
      username: "testuser1",
      password: await hashPassword("password123"),
    },
  });

  for (let year = 1; year <= 4; year++) {
    const moduleStart = (year - 1) * 4 + 1;
    const moduleEnd = moduleStart + 3;

    for (let module = moduleStart; module <= moduleEnd; module++) {
      for (const subject of subjects) {
        for (let i = 0; i < 3; i++) {
          await prisma.artPiece.create({
            data: {
              title: "Artpiece title " + (i + 1),
              description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer tempus, augue sit amet ullamcorper tempus, erat odio lobortis purus, eget auctor magna ligula vitae lectus. Nulla varius sagittis maximus. Sed sed rhoncus odio. Sed pellentesque risus ut ipsum malesuada, vel varius dolor volutpat. Curabitur blandit sem ut consectetur pellentesque. Maecenas a hendrerit augue. Praesent euismod ipsum nec maximus semper. Sed a sapien at enim placerat bibendum. Maecenas at lectus justo. Phasellus nec placerat ex. ",
              year,
              module,
              subject,
            },
          });
        }
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Database seeded!");
  });
