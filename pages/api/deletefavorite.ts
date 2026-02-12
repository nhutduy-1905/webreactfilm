import {NextApiRequest, NextApiResponse} from "next";
import {without} from "lodash"

<<<<<<< HEAD
import prismadb from "../../libs/prismadb";
=======
import {prisma} from "../../libs/prismadb";
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
import serverAuth from "../../libs/serverAuth";


export default async function handler(req: NextApiRequest, res: NextApiResponse){
    try {
        

          if (req.method === 'POST') {
            const { currentUser } = await serverAuth(req, res);
      
            const { movieId } = req.body;
            
<<<<<<< HEAD
            const existingMovie = await prismadb.movie.findUnique({
=======
            const existingMovie = await prisma.movie.findUnique({
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
              where: {
                id: movieId,
              }
            });
      
            if (!existingMovie) {
              throw new Error('Invalid ID');
            }
      
            const updatedFavoriteIds = without(currentUser.favoriteIds, movieId);
      
<<<<<<< HEAD
            const updatedUser = await prismadb.user.update({
=======
            const updatedUser = await prisma.user.update({
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
              where: {
                email: currentUser.email || '',
              },
              data: {
                favoriteIds: updatedFavoriteIds,
              }
            });
      
            return res.status(200).json(updatedUser);
          }
          
<<<<<<< HEAD
          return res.status(405).end();
=======
          return res.status(405).json({ error: "Method not allowed" });
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
          

    } catch (error) {
        console.log(error);
<<<<<<< HEAD
        return res.status(400).end();
        
=======
        return res.status(400).json({ error: "Bad request" });
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
    }
}