import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../libs/prismadb';
import serverAuth from '../../../libs/serverAuth';
import { isAdminEmail } from '../../../libs/adminAuth';

const getPrisma = () => {
  if (!prisma) {
    throw new Error('Prisma client not initialized');
  }
  return prisma as any;
};

const ALLOWED_ORIGINS = new Set(['http://localhost:3000', 'http://localhost:3001']);

const setCors = (req: NextApiRequest, res: NextApiResponse) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const authResult = await serverAuth(req, res);
    if (!authResult) {
      return;
    }

    if (!isAdminEmail(authResult.currentUser.email)) {
      const hasAdminConfig = Boolean(process.env.ADMIN_EMAILS?.trim());
      return res.status(403).json({
        error: hasAdminConfig
          ? 'Admin access required'
          : 'Admin access is not configured. Set ADMIN_EMAILS in web/.env',
      });
    }

    const db = getPrisma();

    if (req.method === 'GET') {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;
      const status = (req.query.status as string) || 'all';

      const whereClause: any = {};
      if (status !== 'all') {
        whereClause.status = status;
      }

      const [comments, total, allCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
        db.comment.findMany({
          where: whereClause,
          include: {
            movie: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        db.comment.count({ where: whereClause }),
        db.comment.count(),
        db.comment.count({ where: { status: 'pending' } }),
        db.comment.count({ where: { status: 'approved' } }),
        db.comment.count({ where: { status: 'rejected' } }),
      ]);

      const transformedComments = comments.map((comment: any) => ({
        ...comment,
        userName: comment.userName || 'Anonymous',
        userEmail: comment.userEmail || '',
        userAvatar: comment.userAvatar || '',
      }));

      return res.json({
        comments: transformedComments,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        stats: {
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          all: allCount,
        },
      });
    }

    if (req.method === 'PATCH') {
      const { id } = req.body as { id?: string };

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Comment ID is required' });
      }

      const comment = await db.comment.findUnique({ where: { id } });
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      const updatedComment = await db.comment.update({
        where: { id },
        data: { status: 'approved' },
      });

      return res.json({
        ...updatedComment,
        message: 'Comment approved successfully',
      });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Comment ID is required' });
      }

      const comment = await db.comment.findUnique({ where: { id } });
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      const hardDelete = req.query.hard === '1' || req.query.hard === 'true';

      if (hardDelete) {
        await db.comment.deleteMany({
          where: {
            OR: [
              { id },
              { parentId: id },
            ],
          },
        });

        return res.json({
          id,
          message: 'Comment deleted permanently',
        });
      }

      const updated = await db.comment.update({
        where: { id },
        data: { status: 'rejected' },
      });

      return res.json({
        ...updated,
        message: 'Comment rejected successfully',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in admin comments API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
