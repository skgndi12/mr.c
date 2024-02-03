import { PrismaClient } from '@prisma/client';

import { extension } from '@src/infrastructure/prisma/prisma.client';

const extendedPrisma = new PrismaClient().$extends(extension);

export default extendedPrisma;
