import express from "express";
import { MovieController } from "../controllers/movie.controller.js";

const router = express.Router();

// Get all movies from database
router.get("/", MovieController.getMovies);

// Update movies from TMDB API
router.get("/update", MovieController.autoUpdateMovies);

// Get trending movies (live from TMDB)
router.get("/trending", MovieController.getTrendingMovies);

// Get now playing movies (live from TMDB)
router.get("/now-playing", MovieController.getNowPlayingMovies);

export default router;

