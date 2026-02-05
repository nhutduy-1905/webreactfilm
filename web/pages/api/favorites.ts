import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const session = await getSession({ req });
    if (!session) return res.status(401).json({ error: 'Unauthorized' });
    const favorites = await prisma.favorite.findMany({
      where: { user: { email: session.user?.email || '' } },
      select: { movieId: true },
    });
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
}
