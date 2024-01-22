import { ITXClientDenyList } from '@prisma/client/runtime/library';

import { generatePrismaClient } from '@src/infrastructure/prisma/prisma.client';

export type ExtendedPrismaClient = ReturnType<typeof generatePrismaClient>;

export type ExtendedPrismaTransactionClient = Omit<
  ExtendedPrismaClient,
  ITXClientDenyList
>;
