const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { APIError } = require('../utils/errors'); // Import from the new location

const router = express.Router();
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRATION || '24h';

if (!jwtSecret) {
  console.error("FATAL ERROR: JWT_SECRET environment variable is not set.");
  process.exit(1); // Exit if JWT secret is not configured
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  const { username, password, role } = req.body;

  // Basic validation
  if (!username || !password || !role) {
    return next(new APIError('Username, password, and role are required', 400));
  }
  // Add more robust validation as needed (e.g., password complexity, role validation)
  const validRoles = ['admin', 'executive', 'operations']; // Match schema
  if (!validRoles.includes(role)) {
      return next(new APIError(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400));
  }

  try {
    // Check if user already exists
    const userExists = await db.query('SELECT 1 FROM Users WHERE username = $1', [username]);
    if (userExists.rows.length > 0) {
      return next(new APIError('Username already exists', 409)); // 409 Conflict
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const newUser = await db.query(
      'INSERT INTO Users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id, username, role, created_at',
      [username, hashedPassword, role]
    );

    // Exclude password_hash from the response
    const userResponse = { ...newUser.rows[0] };
    delete userResponse.password_hash; // Ensure hash isn't sent back

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userResponse,
    });
  } catch (err) {
    console.error('Registration error:', err);
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new APIError('Username and password are required', 400));
  }

  try {
    // Find user by username
    const result = await db.query('SELECT user_id, username, role, password_hash FROM Users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return next(new APIError('Invalid username or password', 401)); // Unauthorized
    }

    // Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return next(new APIError('Invalid username or password', 401));
    }

    // Passwords match, generate JWT
    const payload = {
      userId: user.user_id,
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

    // Update last_login timestamp (optional, run async without waiting)
    db.query('UPDATE Users SET last_login = NOW() WHERE user_id = $1', [user.user_id])
      .catch(err => console.error('Failed to update last_login:', err));

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token: token,
        user: { // Send back some user info (excluding sensitive details)
          userId: user.user_id,
          username: user.username,
          role: user.role
        }
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    next(err);
  }
});

module.exports = router;