const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Get all movies
 *     tags: [Movies]
 */
router.get('/', async (req, res) => {
  try {
    const movies = await prisma.movie.findMany({
      include: { genre: true },
    });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: Get movie by id
 *     tags: [Movies]
 */
router.get('/:id', async (req, res) => {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: req.params.id },
      include: { genre: true },
    });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Create new movie (Admin)
 *     tags: [Movies]
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, genreId, duration, releaseDate, rating, director, cast } = req.body;

    const movie = await prisma.movie.create({
      data: {
        title,
        description,
        videoUrl,
        thumbnailUrl,
        genreId,
        duration,
        releaseDate: new Date(releaseDate),
        rating: rating || null,
        director: director || null,
        cast: cast || [],
      },
    });

    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /movies/{id}:
 *   put:
 *     summary: Update movie (Admin)
 *     tags: [Movies]
 */
router.put('/:id', async (req, res) => {
  try {
    const movie = await prisma.movie.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Delete movie (Admin)
 *     tags: [Movies]
 */
router.delete('/:id', async (req, res) => {
  try {
    await prisma.movie.delete({ where: { id: req.params.id } });
    res.json({ message: 'Movie deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
