/**
 * authController.ts
 * Handles user registration, login, and profile retrieval.
 * Passwords are hashed with bcrypt (10 rounds). Never stored plain.
 * JWT tokens expire in 7 days by default.
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/database';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config';
import type { AuthRequest } from '../middleware/auth';

/** Register a new user with email and password */
export async function register(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;
    const db = getDatabase();

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Insert user
    db.prepare(`
      INSERT INTO users (id, email, password, name)
      VALUES (?, ?, ?, ?)
    `).run(userId, email.toLowerCase().trim(), hashedPassword, name.trim());

    // Generate token
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: userId, email, name },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

/** Login with email and password */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const db = getDatabase();

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    db.prepare('UPDATE users SET last_login = datetime("now") WHERE id = ?').run(user.id);

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);

    return res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
}

/** Get current user profile */
export function getProfile(req: AuthRequest, res: Response) {
  try {
    const db = getDatabase();
    const user = db.prepare('SELECT id, email, name, created_at, last_login FROM users WHERE id = ?').get(req.userId) as any;
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
}
