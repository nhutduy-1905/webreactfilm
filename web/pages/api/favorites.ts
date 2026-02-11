import { NextApiRequest, NextApiResponse } from "next";

import {prisma} from '../../libs/prismadb';
import serverAuth from "../../libs/serverAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).end();
    }

    const result = await serverAuth(req, res);
    if (!result) return; // already sent 401
    const { currentUser } = result;
    const favoritedMovies = await prisma.movie.findMany({
      where: {
        id: {
          in: currentUser?.favoriteIds,
        }
      }
    });
    return res.status(200).json(favoritedMovies);
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
}
