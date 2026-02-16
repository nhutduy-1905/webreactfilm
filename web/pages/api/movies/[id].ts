import type { NextApiRequest, NextApiResponse } from "next";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:5000";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { id } = req.query;
    const movieId = Array.isArray(id) ? id[0] : id;
    if (!movieId) {
      return res.status(400).json({ error: "Movie id is required" });
    }

    const response = await fetch(`${BACKEND_API_URL}/api/movies/${movieId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Error fetching movie detail:", error);
    return res.status(500).json({
      error: "Failed to fetch movie detail",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
