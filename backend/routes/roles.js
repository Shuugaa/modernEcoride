const express = require('express');
const router = express.Router();

// Predefined roles
const predefinedRoles = ['administrateur', 'conducteur', 'passager'];

// Get the pool from the server.js file
const pool = require('../db');

// Get all users with their roles
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nom, prenom, roles FROM utilisateurs');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users and roles' });
    }
});

// Add a role to a user
router.post('/:id/add-role', async (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;

    if (!predefinedRoles.includes(role)) {
        return res.status(400).json({ error: `Invalid role. Allowed roles are: ${predefinedRoles.join(', ')}` });
    }

    try {
        const result = await pool.query(
            'UPDATE utilisateurs SET roles = array_append(roles, $1) WHERE id = $2 AND NOT ($1 = ANY(roles)) RETURNING id, roles',
            [role, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found or role already assigned' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add role to user' });
    }
});

// Remove a role from a user
router.post('/:id/remove-role', async (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;

    if (!predefinedRoles.includes(role)) {
        return res.status(400).json({ error: `Invalid role. Allowed roles are: ${predefinedRoles.join(', ')}` });
    }

    try {
        const result = await pool.query(
            'UPDATE utilisateurs SET roles = array_remove(roles, $1) WHERE id = $2 RETURNING id, roles',
            [role, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found or role not assigned' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove role from user' });
    }
});

module.exports = router;