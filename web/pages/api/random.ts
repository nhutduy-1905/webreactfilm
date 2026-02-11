import {NextApiRequest, NextApiResponse} from "next";
import {prisma} from "../../libs/prismadb";
import serverAuth from "../../libs/serverAuth";


export default async function handler(req: NextApiRequest, res: NextApiResponse){
    if(req.method !== "GET"){
        return res.status(405).end();
    }
    try {
        await serverAuth(req, res);
        const movieCount = await prisma.movie.count({ where: { status: "published" } });
        const randomIndex = Math.floor(Math.random() * movieCount);

        const randomMovies = await prisma.movie.findMany({
            where: { status: "published" },
            take: 1,
            skip: randomIndex
        });

        const movie = randomMovies[0];
        return res.status(200).json({
            ...movie,
            genre: movie?.categories?.join(', ') || '',
            thumbnailUrl: movie?.imageUrl || (movie as any)?.thumbnailUrl,
            posterUrl: movie?.imageUrl || (movie as any)?.posterUrl,
            backdropUrl: movie?.imageUrl || (movie as any)?.backdropUrl,
        });


    } catch (error) {
        console.log(error);
        return res.status(400).end();
        
    }
}