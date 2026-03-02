const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// Get all food entries for user
router.get('/', auth, (req, res) => {
  try {
    const entries = db.prepare(`
      SELECT * FROM food_entries 
      WHERE user_id = ? 
      ORDER BY date DESC, created_at DESC
    `).all(req.userId);

    res.json(entries);
  } catch (error) {
    console.error('Error fetching food entries:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get food entries for a specific date range
router.get('/range', auth, (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const entries = db.prepare(`
      SELECT * FROM food_entries 
      WHERE user_id = ? AND date >= ? AND date <= ?
      ORDER BY date DESC, created_at DESC
    `).all(req.userId, startDate, endDate);

    res.json(entries);
  } catch (error) {
    console.error('Error fetching food entries:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new food entry
router.post('/', auth, (req, res) => {
  try {
    const entry = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO food_entries (
        id, user_id, date, name, brand, category, meal_type,
        serving_size, serving_unit, servings,
        calories, protein, carbs, fat, fiber, sugar, sodium
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      entry.id,
      req.userId,
      entry.date,
      entry.name,
      entry.brand || null,
      entry.category || null,
      entry.mealType,
      entry.servingSize,
      entry.servingUnit,
      entry.servings,
      entry.calories,
      entry.protein,
      entry.carbs,
      entry.fat,
      entry.fiber || 0,
      entry.sugar || 0,
      entry.sodium || 0
    );

    res.status(201).json({ message: 'Food entry created', entry });
  } catch (error) {
    console.error('Error creating food entry:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update food entry
router.put('/:id', auth, (req, res) => {
  try {
    const { id } = req.params;
    const entry = req.body;

    const stmt = db.prepare(`
      UPDATE food_entries SET
        date = ?, name = ?, brand = ?, category = ?, meal_type = ?,
        serving_size = ?, serving_unit = ?, servings = ?,
        calories = ?, protein = ?, carbs = ?, fat = ?,
        fiber = ?, sugar = ?, sodium = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);

    const result = stmt.run(
      entry.date,
      entry.name,
      entry.brand || null,
      entry.category || null,
      entry.mealType,
      entry.servingSize,
      entry.servingUnit,
      entry.servings,
      entry.calories,
      entry.protein,
      entry.carbs,
      entry.fat,
      entry.fiber || 0,
      entry.sugar || 0,
      entry.sodium || 0,
      id,
      req.userId
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Food entry not found' });
    }

    res.json({ message: 'Food entry updated' });
  } catch (error) {
    console.error('Error updating food entry:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete food entry
router.delete('/:id', auth, (req, res) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM food_entries WHERE id = ? AND user_id = ?');
    const result = stmt.run(id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Food entry not found' });
    }

    res.json({ message: 'Food entry deleted' });
  } catch (error) {
    console.error('Error deleting food entry:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk sync food entries
router.post('/sync', auth, (req, res) => {
  try {
    const { entries } = req.body;

    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO food_entries (
        id, user_id, date, name, brand, category, meal_type,
        serving_size, serving_unit, servings,
        calories, protein, carbs, fat, fiber, sugar, sodium
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const syncMany = db.transaction((entries) => {
      for (const entry of entries) {
        insertStmt.run(
          entry.id,
          req.userId,
          entry.date,
          entry.name,
          entry.brand || null,
          entry.category || null,
          entry.mealType,
          entry.servingSize,
          entry.servingUnit,
          entry.servings,
          entry.calories,
          entry.protein,
          entry.carbs,
          entry.fat,
          entry.fiber || 0,
          entry.sugar || 0,
          entry.sodium || 0
        );
      }
    });

    syncMany(entries);

    res.json({ message: `${entries.length} entries synced successfully` });
  } catch (error) {
    console.error('Error syncing food entries:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
