import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { createUser, findUserByEmail } from '../models/User.js';

const SALT_ROUNDS = 10;

// ── POST /api/auth/register  (also aliased to /api/auth/signup) ───────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // ── Input validation ────────────────────────────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'Name must be a non-empty string' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // ── Duplicate check (pre-insert) ────────────────────────────────────────
    // Model normalizes email (trim + lowercase) before querying.
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // ── Hash and insert ─────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const userRole = role && ['USER', 'ADMIN'].includes(role) ? role : 'USER';

    // Model normalizes name and email before inserting.
    const user = await createUser({
      name,
      email,
      passwordHash,
      role: userRole,
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

  } catch (err) {
    // Log the REAL Supabase error so Render logs are actionable.
    console.error('[register] error:', {
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint,
    });

    // 23505 = unique_violation — duplicate email inserted concurrently
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Email already in use' });
    }

    return res.status(500).json({
      message: 'Internal server error',
      // Expose detail only outside production to aid debugging on Render
      ...(process.env.NODE_ENV !== 'production' && {
        detail: err.message,
        code: err.code,
      }),
    });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Model normalizes email before querying and returns `status` field.
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // `user.password` is the bcrypt hash stored in the `password` column.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Enforce BLOCKED status — status is now always selected by the model.
    if (user.status === 'BLOCKED') {
      return res.status(403).json({ message: 'Account is blocked. Contact support.' });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error('[login] error:', {
      message: err.message,
      code: err.code,
      details: err.details,
    });
    return res.status(500).json({ message: 'Internal server error' });
  }
};
