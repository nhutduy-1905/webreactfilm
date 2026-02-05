import { create } from 'zustand';

interface Movie {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  rating?: number;
}

interface MovieStore {
  movies: Movie[];
  setMovies: (movies: Movie[]) => void;
  addMovie: (movie: Movie) => void;
}

export const useMovieStore = create<MovieStore>((set) => ({
  movies: [],
  setMovies: (movies) => set({ movies }),
  addMovie: (movie) => set((state) => ({ movies: [...state.movies, movie] })),
}));
