import {NextApiRequest, NextApiResponse} from "next";
<<<<<<< HEAD
import prismadb from "../../libs/prismadb";
=======
import {prisma} from "../../libs/prismadb";
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
import serverAuth from "../../libs/serverAuth";


export default async function handler(req: NextApiRequest, res: NextApiResponse){
    if(req.method !== "GET"){
<<<<<<< HEAD
        return res.status(405).end();
    }
    try {
        await serverAuth(req, res);
        const movieCount = await prismadb.movie.count();
        const randomIndex = Math.floor(Math.random() * movieCount);

        const randomMovies = await prismadb.movie.findMany({
=======
        return res.status(405).json({ error: "Method not allowed" });
    }
    try {
        await serverAuth(req, res);
        const movieCount = await prisma.movie.count();
        const randomIndex = Math.floor(Math.random() * movieCount);

        const randomMovies = await prisma.movie.findMany({
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
            take: 1,
            skip: randomIndex
        });

        return res.status(200).json(randomMovies[0]);


    } catch (error) {
        console.log(error);
<<<<<<< HEAD
        return res.status(400).end();
        
=======
        return res.status(400).json({ error: "Bad request" });
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
    }
}