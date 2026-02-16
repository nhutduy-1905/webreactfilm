import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../libs/prismadb';

const getPrisma = () => {
  if (!prisma) {
    throw new Error('Prisma client not initialized');
  }
  return prisma as any;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { movieId, sort } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    if (!movieId || typeof movieId !== 'string') {
      return res.status(200).json({ comments: [], total: 0, page: 1, totalPages: 1 });
    }

    const db = getPrisma();

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'top') {
      orderBy = { likes: 'desc' };
    } else if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }

    const whereTopLevel = {
      movieId: String(movieId),
      status: 'approved',
      parentId: null,
    };

    const [comments, total] = await Promise.all([
      db.comment.findMany({
        where: whereTopLevel,
        orderBy,
        skip,
        take: limit,
      }),
      db.comment.count({ where: whereTopLevel }),
    ]);

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment: any) => {
        const replies = await db.comment.findMany({
          where: {
            parentId: comment.id,
            status: 'approved',
          },
          orderBy: { createdAt: 'asc' },
        });

        return {
          ...comment,
          replies,
          replyCount: replies.length,
        };
      })
    );

    return res.json({
      comments: commentsWithReplies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }
}
