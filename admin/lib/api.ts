import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export interface Movie {
  id: string;
  code: string;
  title: string;
  slug: string;
  description: string;
  studio?: string;
  director?: string;
  cast: string[];
  categories: string[];
  status: string;
  ageRating?: string;
  releaseDate?: string;
  duration: number;
  language: string[];
  subtitles: string[];
  imageUrl?: string;
  trailerUrl?: string;
  videoUrl?: string;
  // backward compat aliases
  posterUrl?: string;
  backdropUrl?: string;
  thumbnailUrl?: string;
  tags: string[];
  genre?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse {
  data: Movie[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const movieApi = {
  getAll: (params?: Record<string, any>) =>
    api.get<PaginatedResponse>('/api/movies', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<Movie>(`/api/movies/${id}`).then((r) => r.data),

  create: (data: Partial<Movie>) =>
    api.post<Movie>('/api/movies', data).then((r) => r.data),

  update: (id: string, data: Partial<Movie>) =>
    api.patch<Movie>(`/api/movies/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/api/movies/${id}`).then((r) => r.data),

  updateStatus: (id: string, status: string) =>
    api.patch<Movie>(`/api/movies/${id}/status`, { status }).then((r) => r.data),

  search: (q: string) =>
    api.get<Movie[]>('/api/movies/search', { params: { q } }).then((r) => r.data),

  checkSlug: (slug: string, excludeId?: string) =>
    api.get<{ available: boolean; slug: string }>('/api/movies/check-slug', {
      params: { slug, ...(excludeId ? { excludeId } : {}) },
    }).then((r) => r.data),

  checkDuplicate: (title: string, year?: string, excludeId?: string) =>
    api.get<{ duplicate: boolean; movie?: { id: string; title: string; code: string } }>('/api/movies/check-duplicate', {
      params: { title, ...(year ? { year } : {}), ...(excludeId ? { excludeId } : {}) },
    }).then((r) => r.data),
};

export default api;
