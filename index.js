require('dotenv').config()

const express = require('express');
const axios = require('axios');
const serverless = require('serverless-http');
const app = express();

// Configuration for whitelisted domains through environment variables
const WHITELISTED_ORIGINS = process.env.WHITELISTED_ORIGINS.split(',')
const PROXY_ALLOWED_DOMAINS = process.env.PROXY_ALLOWED_DOMAINS.split(',')

// Parse JSON bodies
app.use(express.json());

// Helper function to check hostname against patterns
function hostnameMatchesPattern(hostname, pattern) {
    const regexPattern = pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*');
    return new RegExp(`^${regexPattern}$`).test(hostname);
}

// CORS headers middleware
app.use((req, res, next) => {
    const origin = req.headers.origin;

    // Check if origin is whitelisted
    let allowedOrigin = 'null';
    if (origin) {
        const originHostname = new URL(origin).hostname;
        const isWhitelisted = WHITELISTED_ORIGINS.some(pattern =>
            hostnameMatchesPattern(originHostname, pattern)
        );
        if (isWhitelisted) {
            allowedOrigin = origin;
        }
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.append('Vary', 'Origin');

    // Handle preflight
    if (req.method === 'OPTIONS') return res.status(200).end();

    next();
});

// Proxy middleware
app.all('/proxy', async (req, res) => {
    try {
        // Extract the target URL from query parameter
        const targetUrl = req.query.url;

        if (!targetUrl) {
            return res.status(400).json({ error: 'Target URL is required as a query parameter' });
        }

        // Simple URL validation
        let urlObj;
        try {
            urlObj = new URL(targetUrl);
        } catch (error) {
            return res.status(400).json({ error: 'Invalid URL provided' });
        }

        // Check if the domain is allowed for proxying
        const targetHostname = urlObj.hostname;
        const isDomainAllowed = PROXY_ALLOWED_DOMAINS.some(pattern =>
            hostnameMatchesPattern(targetHostname, pattern)
        );

        if (!isDomainAllowed) {
            return res.status(403).json({ error: 'Domain not allowed for proxying' });
        }

        // Prepare headers to forward
        const headers = { ...req.headers };

        // Remove headers that might cause issues
        delete headers.host;
        delete headers['origin'];
        delete headers['referer'];
        delete headers['content-length'];

        // Make the request to the target
        const response = await axios({
            method: req.method,
            url: targetUrl,
            data: req.method !== 'GET' ? req.body : undefined,
            headers,
            responseType: 'arraybuffer',
            validateStatus: () => true // Accept any status code to pass through
        });

        // Forward the response headers
        Object.entries(response.headers).forEach(([key, value]) => {
            // Skip CORS headers, we already handled those
            if (!key.toLowerCase().startsWith('access-control-')) {
                res.setHeader(key, value);
            }
        });

        // Send the response with the original status code
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Proxy request failed', message: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`CORS proxy server running on port ${PORT}`);
    });
}

// Wrap the Express app for AWS Lambda
module.exports.handler = serverless(app);
