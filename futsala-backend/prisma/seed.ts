import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../src/config/prismaClient';

async function main() {
  console.log('🌱 Starting database seed...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@futsal.com' },
    update: {},
    create: {
      email: 'admin@futsal.com',
      password: hashedPassword,
      fullName: 'Super Admin',
      phoneNumber: '+977-9800000000',
      role: 'SUPERADMIN',
    },
  });

  console.log('✅ Admin user created:', {
    email: admin.email,
    role: admin.role,
    password: 'admin123 (change this in production!)',
  });

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
