// Vercel serverless handler — wraps the Express app
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const { app, connectDB } = require('../server/app.js');

// Ensure MongoDB is connected before handling requests
export default async function handler(req, res) {
    try {
        await connectDB();
        return app(req, res);
    } catch (err) {
        console.error('Serverless handler error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
