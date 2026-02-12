import { NextApiRequest, NextApiResponse } from "next";

<<<<<<< HEAD
import prismadb from '../../libs/prismadb';
=======
import {prisma} from '../../libs/prismadb';
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
import serverAuth from "../../libs/serverAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).end();
    }

    const { currentUser } = await serverAuth(req, res);

<<<<<<< HEAD
    const favoritedMovies = await prismadb.movie.findMany({
=======
    const favoritedMovies = await prisma.movie.findMany({
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
      where: {
        id: {
          in: currentUser?.favoriteIds,
        }
      }
    });

    return res.status(200).json(favoritedMovies);
  } catch (error) {
    console.log(error);
<<<<<<< HEAD
    return res.status(500).end();
=======
    return res.status(500).json({ error: "Internal server error" });
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
  }
}
