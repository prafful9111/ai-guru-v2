import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { userData } from './data';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
    const password = "qwerty";
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    console.log(`Starting import of ${userData.length} users...`);

    const failedUsers: { staffId: string | null, name: string, error: string }[] = [];
    let successCount = 0;

    for (const user of userData) {
        try {
            await prisma.user.create({
                data: {
                    email: user.email || '',
                    name: user.name,
                    phoneNumber: user.phoneNumber?.toString() || '',
                    staffId: user.staffId?.toString() || '',
                    department: user.department,
                    unit: user.unit,
                    city: user.city,
                    password: hashedPassword,
                    role: 'STAFF',
                },
            });
            successCount++;
            if (successCount % 100 === 0) {
                console.log(`Imported ${successCount} users...`);
            }
        } catch (error: any) {
            // Check if it's a unique constraint violation (P2002)
            if (error.code === 'P2002') {
                const target = error.meta?.target || [];
                failedUsers.push({
                    staffId: user.staffId?.toString() || '',
                    name: user.name,
                    error: `Duplicate field: ${target.join(', ')}`
                });
            } else {
                console.error(`Unexpected error for user ${user.name} (${user.staffId}):`, error.message);
                failedUsers.push({
                    staffId: user.staffId?.toString() || null,
                    name: user.name,
                    error: error.message
                });
            }
        }
    }

    console.log('\n--- Import Summary ---');
    console.log(`Total attempted: ${userData.length}`);
    console.log(`Successfully created: ${successCount}`);
    console.log(`Failed/Skipped: ${failedUsers.length}`);

    if (failedUsers.length > 0) {
        console.log('\n--- Failed Records (Duplicate staffId/email) ---');
        console.table(failedUsers);
    }

    console.log('\nImport completed.');
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });