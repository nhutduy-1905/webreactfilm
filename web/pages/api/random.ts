import type { NextApiRequest, NextApiResponse } from "next";

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const response = await fetch(`${BACKEND_API_URL}/api/movies/random`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching random movie:', error);
    res.status(500).json({ 
      error: 'Failed to fetch random movie',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
