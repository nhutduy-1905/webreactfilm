import type { NextApiRequest, NextApiResponse } from "next";
import serverAuth from "../../libs/serverAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") return res.status(405).end();

    const authResult = await serverAuth(req, res);
    if (!authResult) return;
    const { currentUser } = authResult;

    return res.status(200).json(currentUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
