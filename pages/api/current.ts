<<<<<<< HEAD
import { NextApiRequest, NextApiResponse } from "next";
import serverAuth from "../../libs/serverAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).end();
    }

    const { currentUser } = await serverAuth(req, res);

    return res.status(200).json(currentUser);
  } catch (error) {
    console.log(error);
    return res.status(500).end();
=======
import type { NextApiRequest, NextApiResponse } from "next";
import serverAuth from "../../libs/serverAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    const { currentUser } = await serverAuth(req, res);
    return res.status(200).json(currentUser);
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
  }
}
