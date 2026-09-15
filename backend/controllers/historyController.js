const db = require('../db');

exports.getHistory = async (req, res) => {
  try {
    const farmerId = req.user ? req.user.id : null;
    const landIdParam = req.query.land_id ? parseInt(req.query.land_id, 10) : null;

    let history = [];
    let dbResult = null;

    if (landIdParam) {
      const selectQuery = `
        SELECT ph.* 
        FROM prediction_history ph
        JOIN lands l ON ph.land_id = l.id
        WHERE ph.land_id = $1 AND l.farmer_id = $2
        ORDER BY ph.created_at DESC;
      `;
      dbResult = await db.query(selectQuery, [landIdParam, farmerId]);
    } else {
      const selectQuery = `
        SELECT ph.* 
        FROM prediction_history ph
        JOIN lands l ON ph.land_id = l.id
        WHERE l.farmer_id = $1
        ORDER BY ph.created_at DESC;
      `;
      dbResult = await db.query(selectQuery, [farmerId]);
    }

    if (dbResult && dbResult.rows) {
      history = dbResult.rows;
    } else {
      // Memory fallback mode
      const farmerLandIds = db.inMemoryLands
        .filter((l) => l.farmer_id === farmerId)
        .map((l) => l.id);

      history = db.inMemoryHistory.filter((item) => {
        const belongsToFarmer = farmerLandIds.includes(item.land_id);
        if (landIdParam) {
          return item.land_id === landIdParam && belongsToFarmer;
        }
        return belongsToFarmer;
      });
    }

    return res.status(200).json({
      success: true,
      count: history.length,
      history
    });

  } catch (error) {
    console.error('[Get History Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve prediction history.'
    });
  }
};

exports.deleteHistory = async (req, res) => {
  try {
    const farmerId = req.user ? req.user.id : null;
    const landIdParam = req.query.land_id ? parseInt(req.query.land_id, 10) : null;

    if (landIdParam) {
      const deleteQuery = `
        DELETE FROM prediction_history
        WHERE land_id = $1 AND land_id IN (SELECT id FROM lands WHERE farmer_id = $2);
      `;
      await db.query(deleteQuery, [landIdParam, farmerId]);

      // Memory fallback deletion
      for (let i = db.inMemoryHistory.length - 1; i >= 0; i--) {
        if (db.inMemoryHistory[i].land_id === landIdParam) {
          db.inMemoryHistory.splice(i, 1);
        }
      }
    } else {
      const deleteQuery = `
        DELETE FROM prediction_history
        WHERE land_id IN (SELECT id FROM lands WHERE farmer_id = $1);
      `;
      await db.query(deleteQuery, [farmerId]);

      const farmerLandIds = db.inMemoryLands
        .filter((l) => l.farmer_id === farmerId)
        .map((l) => l.id);

      for (let i = db.inMemoryHistory.length - 1; i >= 0; i--) {
        if (farmerLandIds.includes(db.inMemoryHistory[i].land_id)) {
          db.inMemoryHistory.splice(i, 1);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Prediction history cleared successfully.'
    });

  } catch (error) {
    console.error('[Delete History Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete prediction history.'
    });
  }
};
