
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (user) {
        // Accessing the property to check if it's available in the type definition (for compilation check)
        // and logging it to verify runtime existence.
      console.log("Verified property exists:", user.isVerified);
    } else {
        console.log("No user found, but compilation check passed if this runs.");
    }
  } catch (e) {
      console.error(e);
  } finally {
      await prisma.$disconnect();
  }
}

main();
