import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../libs/prismadb";
import serverAuth from "../../libs/serverAuth";

const isObjectId = (s: unknown) => typeof s === "string" && /^[a-fA-F0-9]{24}$/.test(s);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authResult = await serverAuth(req, res);
    if (!authResult) return;
    const { currentUser } = authResult;

    if (req.method === "GET") {
      const ids = (currentUser.favoriteIds ?? []).filter(isObjectId);
      const movies = await prisma.movie.findMany({ where: { id: { in: ids } } });
      return res.status(200).json(movies);
    }
    if (req.method === "DELETE") {
  const movieId = (req.query.movieId as string) || "";
  if (!isObjectId(movieId)) return res.status(400).json({ message: "movieId invalid" });

  const user = await prisma.user.update({
    where: { email: currentUser.email ?? "" },
    data: {
      favoriteIds: { set: (currentUser.favoriteIds ?? []).filter((id) => id !== movieId) },
    },
  });

  return res.status(200).json(user);
}


    if (req.method === "POST") {
      const { movieId } = req.body as { movieId?: string };
      if (!isObjectId(movieId)) return res.status(400).json({ message: "movieId invalid" });

      const existing = await prisma.movie.findUnique({ where: { id: movieId } });
      if (!existing) return res.status(404).json({ message: "Invalid ID" });

      const user = await prisma.user.update({
        where: { email: currentUser.email ?? "" },
        data: { favoriteIds: { push: movieId } },
      });

      return res.status(200).json(user);
    }

    return res.status(405).end();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
