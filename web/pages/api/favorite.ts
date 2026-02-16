import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../libs/prismadb";
import serverAuth from "../../libs/serverAuth";

const isObjectId = (value: unknown): value is string =>
  typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).end();
    }

    const authResult = await serverAuth(req, res);
    if (!authResult) return;
    const { currentUser } = authResult;

    const { movieId } = req.body as { movieId?: string };
    if (!isObjectId(movieId)) {
      return res.status(400).json({ message: "movieId is invalid" });
    }

    const existingMovie = await prisma.movie.findUnique({
      where: { id: movieId },
      select: { id: true },
    });

    if (!existingMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const favoriteIds = Array.isArray(currentUser.favoriteIds)
      ? currentUser.favoriteIds
      : [];

    const hasMovie = favoriteIds.includes(movieId);
    const nextFavoriteIds = hasMovie ? favoriteIds : [...favoriteIds, movieId];

    const user = await prisma.user.update({
      where: { email: currentUser.email ?? "" },
      data: { favoriteIds: { set: nextFavoriteIds } },
    });

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
