const db = require('../db');

// GET /api/lands - Get all lands for logged-in farmer
exports.getLands = async (req, res) => {
  try {
    const farmerId = req.user.id;

    const selectQuery = `
      SELECT 
        l.id,
        l.farmer_id,
        l.land_name,
        l.location,
        l.area,
        l.soil_type,
        l.created_at,
        l.updated_at,
        ph.predicted_crop AS latest_crop,
        ph.created_at AS latest_reading_time
      FROM lands l
      LEFT JOIN LATERAL (
        SELECT predicted_crop, created_at
        FROM prediction_history
        WHERE land_id = l.id
        ORDER BY created_at DESC
        LIMIT 1
      ) ph ON true
      WHERE l.farmer_id = $1
      ORDER BY l.created_at DESC;
    `;

    const dbResult = await db.query(selectQuery, [farmerId]);

    let lands = [];
    if (dbResult && dbResult.rows) {
      lands = dbResult.rows;
    } else {
      // In-memory fallback mode
      lands = db.inMemoryLands
        .filter((l) => l.farmer_id === farmerId)
        .map((l) => {
          const latestPred = db.inMemoryHistory
            .filter((p) => p.land_id === l.id)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

          return {
            ...l,
            latest_crop: latestPred ? latestPred.predicted_crop : null,
            latest_reading_time: latestPred ? latestPred.created_at : null
          };
        });
    }

    return res.status(200).json({
      success: true,
      count: lands.length,
      lands
    });
  } catch (error) {
    console.error('[Get Lands Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve land records.'
    });
  }
};

// GET /api/lands/:id - Get a single land owned by logged-in farmer
exports.getLandById = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const landId = parseInt(req.params.id, 10);

    if (isNaN(landId)) {
      return res.status(400).json({ success: false, error: 'Invalid land ID.' });
    }

    const selectQuery = `
      SELECT 
        l.id,
        l.farmer_id,
        l.land_name,
        l.location,
        l.area,
        l.soil_type,
        l.created_at,
        l.updated_at,
        ph.predicted_crop AS latest_crop,
        ph.created_at AS latest_reading_time
      FROM lands l
      LEFT JOIN LATERAL (
        SELECT predicted_crop, created_at
        FROM prediction_history
        WHERE land_id = l.id
        ORDER BY created_at DESC
        LIMIT 1
      ) ph ON true
      WHERE l.id = $1 AND l.farmer_id = $2;
    `;

    const dbResult = await db.query(selectQuery, [landId, farmerId]);

    let land = null;
    if (dbResult && dbResult.rows && dbResult.rows.length > 0) {
      land = dbResult.rows[0];
    } else if (!dbResult) {
      // In-memory fallback
      const found = db.inMemoryLands.find((l) => l.id === landId && l.farmer_id === farmerId);
      if (found) {
        const latestPred = db.inMemoryHistory
          .filter((p) => p.land_id === found.id)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

        land = {
          ...found,
          latest_crop: latestPred ? latestPred.predicted_crop : null,
          latest_reading_time: latestPred ? latestPred.created_at : null
        };
      }
    }

    if (!land) {
      return res.status(404).json({
        success: false,
        error: 'Land record not found or access denied.'
      });
    }

    return res.status(200).json({
      success: true,
      land
    });
  } catch (error) {
    console.error('[Get Land By ID Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve land details.'
    });
  }
};

// POST /api/lands - Create a new land record
exports.createLand = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { land_name, location, area, soil_type } = req.body;

    if (!land_name || !land_name.trim()) {
      return res.status(400).json({ success: false, error: 'Land name is required.' });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({ success: false, error: 'Location is required.' });
    }

    const trimmedName = land_name.trim();
    const trimmedLocation = location.trim();
    const cleanArea = area ? area.trim() : null;
    const cleanSoilType = soil_type ? soil_type.trim() : null;

    const insertQuery = `
      INSERT INTO lands (farmer_id, land_name, location, area, soil_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const queryParams = [farmerId, trimmedName, trimmedLocation, cleanArea, cleanSoilType];
    const dbResult = await db.query(insertQuery, queryParams);

    let newLand = null;
    if (dbResult && dbResult.rows && dbResult.rows.length > 0) {
      newLand = dbResult.rows[0];
    } else {
      // Memory fallback insertion
      newLand = {
        id: db.landMemoryIdCounter.get(),
        farmer_id: farmerId,
        land_name: trimmedName,
        location: trimmedLocation,
        area: cleanArea,
        soil_type: cleanSoilType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.landMemoryIdCounter.inc();
      db.inMemoryLands.unshift(newLand);
    }

    return res.status(201).json({
      success: true,
      message: 'Land created successfully.',
      land: newLand
    });
  } catch (error) {
    console.error('[Create Land Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create land record.'
    });
  }
};

// PUT /api/lands/:id - Update land details
exports.updateLand = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const landId = parseInt(req.params.id, 10);
    const { land_name, location, area, soil_type } = req.body;

    if (isNaN(landId)) {
      return res.status(400).json({ success: false, error: 'Invalid land ID.' });
    }

    if (!land_name || !land_name.trim()) {
      return res.status(400).json({ success: false, error: 'Land name is required.' });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({ success: false, error: 'Location is required.' });
    }

    const trimmedName = land_name.trim();
    const trimmedLocation = location.trim();
    const cleanArea = area ? area.trim() : null;
    const cleanSoilType = soil_type ? soil_type.trim() : null;

    const updateQuery = `
      UPDATE lands
      SET land_name = $1, location = $2, area = $3, soil_type = $4, updated_at = NOW()
      WHERE id = $5 AND farmer_id = $6
      RETURNING *;
    `;

    const dbResult = await db.query(updateQuery, [
      trimmedName,
      trimmedLocation,
      cleanArea,
      cleanSoilType,
      landId,
      farmerId
    ]);

    let updatedLand = null;
    if (dbResult && dbResult.rows && dbResult.rows.length > 0) {
      updatedLand = dbResult.rows[0];
    } else if (!dbResult) {
      // Memory fallback
      const foundIdx = db.inMemoryLands.findIndex((l) => l.id === landId && l.farmer_id === farmerId);
      if (foundIdx !== -1) {
        db.inMemoryLands[foundIdx] = {
          ...db.inMemoryLands[foundIdx],
          land_name: trimmedName,
          location: trimmedLocation,
          area: cleanArea,
          soil_type: cleanSoilType,
          updated_at: new Date().toISOString()
        };
        updatedLand = db.inMemoryLands[foundIdx];
      }
    }

    if (!updatedLand) {
      return res.status(404).json({
        success: false,
        error: 'Land record not found or access denied.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Land updated successfully.',
      land: updatedLand
    });
  } catch (error) {
    console.error('[Update Land Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update land record.'
    });
  }
};

// DELETE /api/lands/:id - Delete land and associated predictions
exports.deleteLand = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const landId = parseInt(req.params.id, 10);

    if (isNaN(landId)) {
      return res.status(400).json({ success: false, error: 'Invalid land ID.' });
    }

    const deleteQuery = 'DELETE FROM lands WHERE id = $1 AND farmer_id = $2 RETURNING id;';
    const dbResult = await db.query(deleteQuery, [landId, farmerId]);

    let deleted = false;
    if (dbResult && dbResult.rows && dbResult.rows.length > 0) {
      deleted = true;
    } else if (!dbResult) {
      // Memory fallback
      const foundIdx = db.inMemoryLands.findIndex((l) => l.id === landId && l.farmer_id === farmerId);
      if (foundIdx !== -1) {
        db.inMemoryLands.splice(foundIdx, 1);
        // Remove associated prediction history records in memory
        for (let i = db.inMemoryHistory.length - 1; i >= 0; i--) {
          if (db.inMemoryHistory[i].land_id === landId) {
            db.inMemoryHistory.splice(i, 1);
          }
        }
        deleted = true;
      }
    }

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Land record not found or access denied.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Land and linked data deleted successfully.'
    });
  } catch (error) {
    console.error('[Delete Land Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete land record.'
    });
  }
};
