import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { movieId } = req.query;
    const movie = await prisma.movie.findUnique({ where: { id: movieId as string }, include: { genre: true } });
    res.json(movie);
  } else if (req.method === 'POST') {
    const movie = await prisma.movie.create({ data: req.body });
    res.status(201).json(movie);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
