import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// ============================================
// CINEMA ROUTES
// ============================================

// GET /api/cinemas - Get all cinemas
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('cinemas')
            .select('*')
            .order('name');

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error('Error fetching cinemas:', err);
        res.status(500).json({ error: 'Failed to fetch cinemas' });
    }
});

// GET /api/cinemas/:id - Get cinema by ID
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('cinemas')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error('Error fetching cinema:', err);
        res.status(404).json({ error: 'Cinema not found' });
    }
});

// GET /api/cinemas/city/:city - Get cinemas by city
router.get('/city/:city', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('cinemas')
            .select('*')
            .eq('city', req.params.city)
            .order('name');

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error('Error fetching cinemas by city:', err);
        res.status(500).json({ error: 'Failed to fetch cinemas' });
    }
});

// POST /api/cinemas - Create new cinema (Admin only)
router.post('/', async (req, res) => {
    try {
        const { name, location, address, city, latitude, longitude, total_screens } = req.body;

        const { data, error } = await supabase
            .from('cinemas')
            .insert([{
                name,
                location,
                address,
                city,
                latitude,
                longitude,
                total_screens
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (err) {
        console.error('Error creating cinema:', err);
        res.status(500).json({ error: 'Failed to create cinema' });
    }
});

// PUT /api/cinemas/:id - Update cinema (Admin only)
router.put('/:id', async (req, res) => {
    try {
        const { name, location, address, city, latitude, longitude, total_screens } = req.body;

        const { data, error } = await supabase
            .from('cinemas')
            .update({
                name,
                location,
                address,
                city,
                latitude,
                longitude,
                total_screens
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error('Error updating cinema:', err);
        res.status(500).json({ error: 'Failed to update cinema' });
    }
});

// DELETE /api/cinemas/:id - Delete cinema (Admin only)
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('cinemas')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({ message: 'Cinema deleted successfully' });
    } catch (err) {
        console.error('Error deleting cinema:', err);
        res.status(500).json({ error: 'Failed to delete cinema' });
    }
});

export default router;
