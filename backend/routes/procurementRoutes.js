const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Import the database query function

// GET /api/procurement/orders - Fetch purchase orders from database
router.get('/orders', async (req, res, next) => {
  try {
    const queryText = `
      SELECT
        po.po_id,
        po.po_number AS id, -- Use po_number as the main identifier for frontend
        s.name AS supplier,
        po.status,
        po.expected_delivery_date AS eta,
        po.total_amount
      FROM PurchaseOrders po
      JOIN Suppliers s ON po.supplier_id = s.supplier_id
      ORDER BY po.order_date DESC;
    `;
    const { rows } = await db.query(queryText);
    // Note: Item details per order are not included here for simplicity,
    // could be fetched in a separate request if needed by clicking an order.
    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error('Error fetching purchase orders:', err);
    next(err); // Pass error to the global error handler
  }
});

// GET /api/procurement/suppliers - Fetch suppliers from database
router.get('/suppliers', async (req, res, next) => {
  try {
    const queryText = `
      SELECT
        supplier_id,
        name,
        contact_person,
        contact_email AS contact,
        phone,
        address,
        performance_rating AS rating -- Map to 'rating' for frontend
        -- Map performance_rating to a descriptive 'performance' string if needed
        -- CASE WHEN performance_rating >= 4.5 THEN 'Excellent' ... END AS performance
      FROM Suppliers
      ORDER BY name;
    `;
    const { rows } = await db.query(queryText);
     // Add a simple performance description based on rating
    const suppliersData = rows.map(s => ({
        ...s,
        id: `SUP${s.supplier_id}`, // Prefix ID
        performance: s.rating >= 4.5 ? 'Excellent' : (s.rating >= 4.0 ? 'Good' : 'Average')
    }));
    res.status(200).json({
      success: true,
      data: suppliersData,
    });
  } catch (err) {
    console.error('Error fetching suppliers:', err);
    next(err);
  }
});

// GET /api/procurement/inventory - Fetch inventory levels from database
router.get('/inventory', async (req, res, next) => {
  try {
    const queryText = `
      SELECT name, stock_level
      FROM InventoryItems
      WHERE stock_level > 0 -- Optionally filter for items in stock
      ORDER BY name;
    `;
    const { rows } = await db.query(queryText);

    // Format data for the chart
    const inventoryData = {
      labels: rows.map(item => item.name),
      datasets: [
        {
          label: 'Stock Level',
          data: rows.map(item => item.stock_level),
          // Add default styling or fetch from config if needed
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };

    res.status(200).json({
      success: true,
      data: inventoryData,
    });
  } catch (err) {
    console.error('Error fetching inventory levels:', err);
    next(err);
  }
});

// --- Purchase Requisitions ---

// GET /api/procurement/requisitions - Fetch purchase requisitions
router.get('/requisitions', async (req, res, next) => {
  try {
    // Join with other tables to get more descriptive data
    const queryText = `
      SELECT
        pr.pr_id,
        pr.item_id,
        i.name AS item_name,
        pr.supplier_id,
        s.name AS supplier_name,
        pr.quantity,
        pr.status,
        pr.requested_by,
        u.username AS requested_by_username,
        pr.request_date,
        pr.approval_date,
        pr.created_at
      FROM PurchaseRequisitions pr
      JOIN InventoryItems i ON pr.item_id = i.item_id
      JOIN Suppliers s ON pr.supplier_id = s.supplier_id
      JOIN Users u ON pr.requested_by = u.user_id
      ORDER BY pr.request_date DESC, pr.created_at DESC;
    `;
    const { rows } = await db.query(queryText);
    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error('Error fetching purchase requisitions:', err);
    next(err);
  }
});

// POST /api/procurement/requisitions - Create a new purchase requisition
router.post('/requisitions', async (req, res, next) => {
  const { item_id, supplier_id, quantity } = req.body;
  const requested_by = req.user?.userId; // Get user ID from authenticated user

  // Basic validation
  if (!item_id || !supplier_id || !quantity || quantity <= 0) {
    return next(new APIError('Item ID, Supplier ID, and a positive Quantity are required', 400));
  }
  if (!requested_by) {
     // Should be caught by 'protect' middleware, but good to double-check
    return next(new APIError('User not authenticated', 401));
  }

  try {
    const queryText = `
      INSERT INTO PurchaseRequisitions (item_id, supplier_id, quantity, status, requested_by, request_date)
      VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
      RETURNING *; -- Return the created record
    `;
    // Default status to 'Pending'
    const values = [item_id, supplier_id, quantity, 'Pending', requested_by];
    const { rows } = await db.query(queryText, values);

    // Fetch the newly created requisition with joined data for response consistency
     const createdReqQuery = `
      SELECT
        pr.pr_id, pr.item_id, i.name AS item_name, pr.supplier_id, s.name AS supplier_name,
        pr.quantity, pr.status, pr.requested_by, u.username AS requested_by_username,
        pr.request_date, pr.approval_date, pr.created_at
      FROM PurchaseRequisitions pr
      JOIN InventoryItems i ON pr.item_id = i.item_id
      JOIN Suppliers s ON pr.supplier_id = s.supplier_id
      JOIN Users u ON pr.requested_by = u.user_id
      WHERE pr.pr_id = $1;
    `;
    const createdResult = await db.query(createdReqQuery, [rows[0].pr_id]);


    res.status(201).json({
      success: true,
      message: 'Purchase requisition created successfully',
      data: createdResult.rows[0], // Return the newly created requisition with details
    });
  } catch (err) {
    console.error('Error creating purchase requisition:', err);
    // Handle potential foreign key constraint errors, etc.
    if (err.code === '23503') { // Foreign key violation
        return next(new APIError('Invalid Item ID, Supplier ID, or User ID provided.', 400));
    }
    next(err);
  }
});


// --- End Purchase Requisitions ---


module.exports = router;