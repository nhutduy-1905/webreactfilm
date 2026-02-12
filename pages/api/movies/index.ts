import {NextApiRequest, NextApiResponse} from "next";
<<<<<<< HEAD
import prismadb from "../../../libs/prismadb";
=======
import {prisma} from "../../../libs/prismadb";
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
import serverAuth from "../../../libs/serverAuth";


export default async function handler(req: NextApiRequest, res: NextApiResponse){
    if(req.method !== "GET"){
<<<<<<< HEAD
        return res.status(405).end;
    }
    try {
        await serverAuth(req, res);
        const movies = await prismadb.movie.findMany();
=======
        return res.status(405).end();
    }
    try {
        await serverAuth(req, res);
        const movies = await prisma.movie.findMany();
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)

        return res.status(200).json(movies);


    } catch (error) {
        console.log(error);
<<<<<<< HEAD
        return res.status(400).end;
        
=======
        return res.status(400).json({ error: "Bad request" });
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
    }
}