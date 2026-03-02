const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// Get user's daily goals
router.get('/', auth, (req, res) => {
  try {
    const goals = db.prepare('SELECT * FROM daily_goals WHERE user_id = ?').get(req.userId);
    
    if (!goals) {
      // Create default goals if they don't exist
      const stmt = db.prepare(`
        INSERT INTO daily_goals (user_id, calories, protein, carbs, fat, fiber)
        VALUES (?, 2000, 150, 200, 65, 30)
      `);
      stmt.run(req.userId);
      
      const newGoals = db.prepare('SELECT * FROM daily_goals WHERE user_id = ?').get(req.userId);
      return res.json(newGoals);
    }
    
    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update daily goals
router.put('/', auth, (req, res) => {
  try {
    const { calories, protein, carbs, fat, fiber } = req.body;

    const stmt = db.prepare(`
      UPDATE daily_goals SET
        calories = ?, protein = ?, carbs = ?, fat = ?, fiber = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);

    const result = stmt.run(calories, protein, carbs, fat, fiber, req.userId);

    if (result.changes === 0) {
      // Create if doesn't exist
      const insertStmt = db.prepare(`
        INSERT INTO daily_goals (user_id, calories, protein, carbs, fat, fiber)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(req.userId, calories, protein, carbs, fat, fiber);
    }

    res.json({ message: 'Goals updated successfully' });
  } catch (error) {
    console.error('Error updating goals:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
