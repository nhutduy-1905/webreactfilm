const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const genres = await prisma.genre.findMany();
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const genre = await prisma.genre.create({ data: { name } });
    res.status(201).json(genre);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
