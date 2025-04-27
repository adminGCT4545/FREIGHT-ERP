const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Import the database query function

// GET /api/transport/fleet - Fetch fleet status from database
router.get('/fleet', async (req, res, next) => {
  try {
    // Query to get the latest status for each truck
    const queryText = `
      SELECT DISTINCT ON (t.truckid)
             t.truckid AS id,
             t.truckname AS name,
             -- Determine status based on latest delivery (simplified logic)
             CASE
               WHEN fds.deliverydate = CURRENT_DATE AND fds.isontime = true THEN 'En Route'
               WHEN fds.deliverydate < CURRENT_DATE THEN 'Idle' -- Assuming idle if last delivery is past
               ELSE 'Scheduled' -- Default or future deliveries
             END AS status,
             fds.originstate AS last_origin,
             fds.destinationstate AS last_destination,
             -- Placeholder for maintenance, driver, load - not in schema
             'N/A' as maintenanceDue,
             'Unknown' as driver,
             0 as currentLoad
      FROM   (SELECT DISTINCT truckid, truckname FROM freightdeliverystats) t
      LEFT JOIN freightdeliverystats fds ON t.truckid = fds.truckid
      ORDER BY t.truckid, fds.deliverydate DESC;
    `;
    const { rows } = await db.query(queryText);

    // Map data slightly for frontend consistency (e.g., location context)
    const fleetData = rows.map(row => ({
        ...row,
        location: `Last: ${row.last_origin} to ${row.last_destination}` // Simplified location context
    }));

    res.status(200).json({
      success: true,
      data: fleetData,
    });
  } catch (err) {
    console.error('Error fetching fleet status:', err);
    next(err); // Pass error to the global error handler
  }
});

// GET /api/transport/deliveries - Fetch recent deliveries from database
router.get('/deliveries', async (req, res, next) => {
  try {
    // Query for deliveries in the last 7 days
    const queryText = `
      SELECT deliveryid AS id,
             truckid AS vehicleId,
             destinationstate AS destination,
             CASE
               WHEN isontime = true AND deliverydate >= CURRENT_DATE THEN 'In Transit'
               WHEN isontime = false THEN 'Delayed'
               ELSE 'Completed' -- Assuming past on-time deliveries are completed
             END AS status,
             deliverydate,
             delaydays,
             originstate
      FROM   freightdeliverystats
      WHERE  deliverydate >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY deliverydate DESC;
    `;
    const { rows } = await db.query(queryText);

     // Map data - Note: currentLocation and eta are not directly available
    const deliveryData = rows.map(row => ({
        id: `DEL${row.id}`, // Prefix ID for clarity
        vehicleId: `TRK${row.vehicleid}`,
        destination: row.destination,
        status: row.status,
        eta: row.delaydays ? `Delayed by ${row.delaydays} days` : (row.status === 'In Transit' ? 'ETA TBD' : 'N/A'), // Simplified ETA
        currentLocation: { // Placeholder - No live coordinates in schema
            lat: null, // Replace with geocoding if needed
            lon: null,
            description: `From ${row.originstate} to ${row.destination}`
        }
    }));


    res.status(200).json({
      success: true,
      data: deliveryData,
    });
  } catch (err) {
    console.error('Error fetching deliveries:', err);
    next(err);
  }
});

// POST /api/transport/plan-route - Plan a new route (placeholder)
router.post('/plan-route', (req, res, next) => {
  try {
    const { origin, destination } = req.body;
    if (!origin || !destination) {
      // Use APIError class if available, otherwise standard error
      const error = new Error('Origin and destination are required');
      error.statusCode = 400;
      throw error;
    }
    console.log(`Route planning request from ${origin} to ${destination}`);
    // Placeholder response - replace with actual route planning logic/API call
    res.status(200).json({
      success: true,
      data: {
        distance: `${Math.floor(Math.random() * 200) + 50} miles`,
        duration: `${Math.floor(Math.random() * 4) + 1} hours ${Math.floor(Math.random() * 60)} mins`,
        waypoints: ['Calculated Waypoint 1', 'Calculated Waypoint 2'],
        estimatedCost: Math.floor(Math.random() * 300) + 50,
      },
    });
  } catch (err) {
    next(err);
  }
});


module.exports = router;