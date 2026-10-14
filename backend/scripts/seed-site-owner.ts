/**
 * Creates (or updates) the single Site Owner account — the platform-level
 * SUPER_ADMIN who oversees every restaurant on the software, as distinct
 * from any individual restaurant's Owner.
 *
 * Run once: npm run seed:site-owner
 * Reads credentials from env if set, otherwise falls back to the defaults
 * below. Change SITE_OWNER_PASSWORD before running this against a real
 * production database — don't ship the default password.
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const LOGIN_ID = process.env.SITE_OWNER_LOGIN_ID || 'tomsiteowner';
const PASSWORD = process.env.SITE_OWNER_PASSWORD || 'tom_owner';
const NAME = process.env.SITE_OWNER_NAME || 'Site Owner';

async function main() {
  if (PASSWORD.length < 6) {
    throw new Error('Site owner password must be at least 6 characters');
  }

  let role = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  if (!role) {
    role = await prisma.role.create({
      data: { name: 'SUPER_ADMIN', description: 'Platform-level Site Owner — oversees every restaurant' },
    });
  }

  const hashedPassword = await bcrypt.hash(PASSWORD, 10);
  const existing = await prisma.user.findUnique({ where: { email: LOGIN_ID } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { password: hashedPassword, roleId: role.id, isVerified: true, name: NAME },
    });
    console.log(`Updated existing Site Owner account: ${LOGIN_ID}`);
  } else {
    await prisma.user.create({
      data: {
        email: LOGIN_ID,
        password: hashedPassword,
        name: NAME,
        roleId: role.id,
        isVerified: true,
      },
    });
    console.log(`Created Site Owner account: ${LOGIN_ID}`);
  }

  console.log('You can now log in with:');
  console.log(`  Login ID: ${LOGIN_ID}`);
  console.log(`  Password: ${PASSWORD}`);
  console.log('This account is NOT tied to any restaurant — it is platform-wide.');
}

main()
  .catch((e) => {
    console.error('Failed to seed Site Owner:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
