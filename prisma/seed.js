const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  const admin = await prisma.admin.upsert({
    where: { username: "AdminMansory" },
    update: {},
    create: {
      username: "AdminMansory",
      password: hashPassword("AdminMansory2026@"),
    },
  });
  console.log("✅ Admin creado:", admin.username);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
