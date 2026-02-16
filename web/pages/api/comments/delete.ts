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
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const authResult = await serverAuth(req, res);
    if (!authResult) {
      return;
    }
    const { currentUser } = authResult;

    const { commentId } = req.query;

    // Validation
    if (!commentId || typeof commentId !== 'string') {
      return res.status(400).json({ error: 'Comment ID is required' });
    }

    const db = getPrisma();

    // Check if comment exists and belongs to user
    const comment = await db.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== currentUser.id) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    // Delete comment and all its replies
    await db.comment.deleteMany({
      where: {
        OR: [
          { id: commentId },
          { parentId: commentId }
        ]
      }
    });

    return res.status(200).json({ 
      message: 'Comment deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ error: 'Failed to delete comment' });
  }
}
