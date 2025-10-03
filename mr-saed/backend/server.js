import app from "./app.js";
const PORT = process.env.PORT || 4029;
// Set default environment variables if not provided
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '100d';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mrsaed';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'https://mrsaed.fikra.solutions'; 
process.env.BACKEND_URL = process.env.BACKEND_URL || 'https://api.mrsaed.fikra.solutions';

const server = app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
    console.log(`production backend URL: ${process.env.BACKEND_URL}`);
    console.log(`production client URL: ${process.env.CLIENT_URL}`);
    console.log(`📊 Server configured for large payloads: 50MB limit`);
});

// Configure server timeouts for large payloads
server.timeout = 300000; // 5 minutes timeout for large requests
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // 66 seconds