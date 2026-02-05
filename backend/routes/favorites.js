const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany();
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    const { userId } = req.body;

    const favorite = await prisma.favorite.create({
      data: { userId, movieId },
    });
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    const { userId } = req.body;

    await prisma.favorite.deleteMany({
      where: { userId, movieId },
    });
    res.json({ message: 'Favorite removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
