const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.users.findUnique({ where: { user_id: 5 } }).then(console.log).finally(() => prisma.$disconnect());
