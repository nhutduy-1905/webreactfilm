const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create genres
  const action = await prisma.genre.upsert({
    where: { name: 'Action' },
    update: {},
    create: { name: 'Action' },
  });

  const comedy = await prisma.genre.upsert({
    where: { name: 'Comedy' },
    update: {},
    create: { name: 'Comedy' },
  });

  // Create sample movies
  await prisma.movie.createMany({
    data: [
      {
        title: 'The Action Movie',
        description: 'An exciting action-packed film',
        videoUrl: 'https://example.com/video1.mp4',
        thumbnailUrl: 'https://via.placeholder.com/300x400?text=Action+Movie',
        genreId: action.id,
        duration: 120,
        releaseDate: new Date('2024-01-01'),
        rating: 8.5,
        director: 'John Doe',
        cast: ['Actor 1', 'Actor 2'],
      },
      {
        title: 'The Comedy Show',
        description: 'A hilarious comedy film',
        videoUrl: 'https://example.com/video2.mp4',
        thumbnailUrl: 'https://via.placeholder.com/300x400?text=Comedy+Movie',
        genreId: comedy.id,
        duration: 100,
        releaseDate: new Date('2024-02-01'),
        rating: 7.8,
        director: 'Jane Smith',
        cast: ['Actor 3', 'Actor 4'],
      },
    ],
    skipDuplicates: true,
  });

  console.log(' Database seeded successfully!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.\());
