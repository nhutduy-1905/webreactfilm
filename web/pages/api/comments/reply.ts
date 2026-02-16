import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../libs/prismadb';
import serverAuth from '../../../libs/serverAuth';

// Type assertion to handle Prisma client
const getPrisma = () => {
  if (!prisma) {
    throw new Error('Prisma client not initialized');
  }
  return prisma as any;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authResult = await serverAuth(req, res);
    if (!authResult) {
      return;
    }
    const { currentUser } = authResult;

    const { content, movieId, parentId } = req.body;

    if (!content || !movieId || !parentId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({ error: 'Reply content cannot be empty' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ error: 'Reply must be 1000 characters or less' });
    }

    const db = getPrisma();

    // Check if parent comment exists
    const parentComment = await db.comment.findUnique({
      where: { id: parentId }
    });

    if (!parentComment) {
      return res.status(404).json({ error: 'Parent comment not found' });
    }

    // Create reply
    const reply = await db.comment.create({
      data: {
        content: content.trim(),
        movieId,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email || null,
        userAvatar: currentUser.image || null,
        parentId,
        status: 'approved',
        likes: 0,
        dislikes: 0,
        likedBy: [],
        dislikedBy: []
      }
    });

    return res.status(201).json(reply);
  } catch (error: any) {
    console.error('Error creating reply:', error);
    return res.status(500).json({ error: 'Failed to create reply' });
  }
}
