import { Router } from 'express';
import { PrismaClient } from "../../prisma/generated/client/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const router = Router();
const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
// 1. REGISTER NEW USER ACCOUNT
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        // Check if account already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'An account with this email already exists' });
        }
        // Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        // Create user in Neon database
        const newUser = await prisma.user.create({
            data: { email, passwordHash }
        });
        // Generate session JWT token
        const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({ success: true, token, userId: newUser.id });
    }
    catch (error) {
        return res.status(500).json({ error: 'Server registration error' });
    }
});
// 2. USER LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        // Find the user row
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password credentials' });
        }
        // Compare hashed password values
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password credentials' });
        }
        // Generate fresh session token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.status(200).json({ success: true, token, userId: user.id });
    }
    catch (error) {
        return res.status(500).json({ error: 'Server login error' });
    }
});
export default router;
//# sourceMappingURL=auth.js.map