import { MovieService } from "../services/movie.service.js";
import { MovieModel } from "../models/movie.model.js";

export const MovieController = {
    /**
     * Get all movies from database
     */
    async getMovies(req, res) {
        try {
            const { data, error } = await MovieModel.getAll();

            if (error) {
                console.error("Get Movies Error:", error);
                return res.status(500).json({
                    message: "Failed to fetch movies",
                    error: error.message
                });
            }

            res.json(data || []);
        } catch (err) {
            console.error("Get Movies Controller Error:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    /**
     * Fetch and store upcoming movies from TMDB API
     */
    async autoUpdateMovies(req, res) {
        try {
            const result = await MovieService.fetchAndStoreMovies();
            res.json(result);
        } catch (error) {
            console.error("Auto Update Movies Error:", error);
            res.status(500).json({
                message: "Failed to update movies",
                error: error.message
            });
        }
    },

    /**
     * Get trending movies (live from TMDB)
     */
    async getTrendingMovies(req, res) {
        try {
            const movies = await MovieService.getTrendingMovies();
            res.json(movies);
        } catch (error) {
            console.error("Get Trending Movies Error:", error);
            res.status(500).json({
                message: "Failed to fetch trending movies",
                error: error.message
            });
        }
    },

    /**
     * Get now playing movies (live from TMDB)
     */
    async getNowPlayingMovies(req, res) {
        try {
            const movies = await MovieService.getNowPlayingMovies();
            res.json(movies);
        } catch (error) {
            console.error("Get Now Playing Movies Error:", error);
            res.status(500).json({
                message: "Failed to fetch now playing movies",
                error: error.message
            });
        }
    }
};