import jwt from 'jsonwebtoken';
export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access Denied: Log in required' });
    }
    // Safely extract the token string chunk
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access Denied: Token structure malformed' });
    }
    try {
        // Fallback or explicit check prevents crash if environment variable is missing
        const secret = process.env['JWT_SECRET'] ?? '';
        if (!secret) {
            console.error('CRITICAL ERROR: JWT_SECRET environment variable is not defined.');
            return res.status(500).json({ error: 'Internal configuration validation error' });
        }
        const decoded = jwt.verify(token, secret);
        req.userId = decoded.userId;
        return next(); // Explicit return satisfies strict functional pathways
    }
    catch (err) {
        return res.status(403).json({ error: 'Invalid or expired session token' });
    }
}
//# sourceMappingURL=auth.js.map