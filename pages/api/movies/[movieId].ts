import { NextApiRequest, NextApiResponse } from "next";
<<<<<<< HEAD
import prismadb from '../../../libs/prismadb';
=======
import {prisma} from '../../../libs/prismadb';
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
import serverAuth from "../../../libs/serverAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'GET') {
<<<<<<< HEAD
          return res.status(405).end();
=======
          return res.status(405).json({ error: "Method not allowed" });
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
        }
    
        await serverAuth(req, res);
    
        const { movieId } = req.query;
    
        if (typeof movieId !== 'string') {
          throw new Error('Invalid Id');
        }
    
        if (!movieId) {
          throw new Error('Missing Id');
        }
    
<<<<<<< HEAD
        const movies = await prismadb.movie.findUnique({
=======
        const movies = await prisma.movie.findUnique({
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
          where: {
            id: movieId
          }
        });
    
        return res.status(200).json(movies);
      } catch (error) {
    console.log(error);
<<<<<<< HEAD
    return res.status(500).end();
=======
    return res.status(500).json({ error: "Internal server error" });
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
  }
}
