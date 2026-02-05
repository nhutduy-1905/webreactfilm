import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const session = await getSession({ req });
    if (!session) return res.status(401).json({ error: 'Unauthorized' });
    const { movieId } = req.query;
    const user = await prisma.user.findUnique({ where: { email: session.user?.email || '' } });
    await prisma.favorite.deleteMany({ where: { userId: user?.id, movieId: movieId as string } });
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
}
