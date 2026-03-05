// Vercel serverless handler — wraps the Express app
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { app, connectDB } = require('../server/app.js');

// Ensure MongoDB is connected before handling requests
export default async function handler(req, res) {
    await connectDB();
    return app(req, res);
}
