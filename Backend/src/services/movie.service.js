import axios from "axios";
import { MovieModel } from "../models/movie.model.js";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/original";

export const MovieService = {
    /**
     * Fetch and store upcoming movies from TMDB
     */
    async fetchAndStoreMovies() {
        try {
            if (!process.env.TMDB_API_KEY) {
                throw new Error("TMDB_API_KEY not configured");
            }

            const url = `${TMDB_BASE_URL}/movie/upcoming?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1`;
            const response = await axios.get(url);
            const movies = response.data.results || [];

            let addedCount = 0;
            let skippedCount = 0;

            for (const movie of movies) {
                // Check if movie already exists by TMDB ID
                const { data: existing } = await MovieModel.getByTmdbId(movie.id);
                
                if (existing) {
                    skippedCount++;
                    continue;
                }

                // Store movie in database
                await MovieModel.create({
                    tmdb_id: movie.id,
                    title: movie.title,
                    banner: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
                    backdrop: movie.backdrop_path ? `${TMDB_IMAGE_BASE}${movie.backdrop_path}` : null,
                    genre: movie.genre_ids?.join(", ") || "Unknown",
                    rating: movie.vote_average || 0,
                    release_date: movie.release_date,
                    overview: movie.overview || "",
                });

                addedCount++;
            }

            return { 
                success: true,
                message: `Movies updated: ${addedCount} added, ${skippedCount} skipped`,
                addedCount,
                skippedCount
            };

        } catch (error) {
            console.error("MovieService Error:", error.message);
            throw new Error(`Failed to fetch movies: ${error.message}`);
        }
    },

    /**
     * Fetch trending movies from TMDB (doesn't store, just returns)
     */
    async getTrendingMovies() {
        try {
            if (!process.env.TMDB_API_KEY) {
                throw new Error("TMDB_API_KEY not configured");
            }

            const url = `${TMDB_BASE_URL}/trending/movie/week?api_key=${process.env.TMDB_API_KEY}`;
            const response = await axios.get(url);
            
            return response.data.results.map(movie => ({
                id: movie.id,
                title: movie.title,
                poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
                backdrop: movie.backdrop_path ? `${TMDB_IMAGE_BASE}${movie.backdrop_path}` : null,
                rating: movie.vote_average,
                release_date: movie.release_date,
                overview: movie.overview
            }));

        } catch (error) {
            console.error("Get Trending Movies Error:", error.message);
            throw new Error("Failed to fetch trending movies");
        }
    },

    /**
     * Fetch now playing movies from TMDB
     */
    async getNowPlayingMovies() {
        try {
            if (!process.env.TMDB_API_KEY) {
                throw new Error("TMDB_API_KEY not configured");
            }

            const url = `${TMDB_BASE_URL}/movie/now_playing?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1`;
            const response = await axios.get(url);
            
            return response.data.results.map(movie => ({
                id: movie.id,
                title: movie.title,
                poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
                backdrop: movie.backdrop_path ? `${TMDB_IMAGE_BASE}${movie.backdrop_path}` : null,
                rating: movie.vote_average,
                release_date: movie.release_date,
                overview: movie.overview
            }));

        } catch (error) {
            console.error("Get Now Playing Movies Error:", error.message);
            throw new Error("Failed to fetch now playing movies");
        }
    }
};