import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const session = await getSession({ req });
    if (!session) return res.status(401).json({ error: 'Unauthorized' });
    const { movieId } = req.body;
    const user = await prisma.user.findUnique({ where: { email: session.user?.email || '' } });
    await prisma.favorite.create({ data: { userId: user?.id || '', movieId } });
    res.json({ message: 'Added to favorites' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add favorite' });
  }
}
