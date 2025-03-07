# CORS Proxy

A secure CORS proxy server built with Express.js and designed for AWS Lambda deployment. This proxy allows whitelisted domains to make cross-origin requests while maintaining security through domain validation.

## Features

- Separate CORS and proxy domain whitelisting
- CORS headers management
- Request proxying with header forwarding
- Support for all HTTP methods (GET, POST, PUT, PATCH, DELETE)
- AWS Lambda compatible
- Health check endpoint

## Requirements

- Node.js >= 18.0.0
- npm

## Installation

1. Clone the repository
2. Install dependencies:
```sh
npm install
```

## Configuration
Create a .env file in the root directory:

```
WHITELISTED_ORIGINS=example.com,*.test.com
PROXY_ALLOWED_DOMAINS=api.example.com,*.api.test.com
```

The configuration uses two separate domain lists:
- `WHITELISTED_ORIGINS`: Hostnames allowed to make requests to the proxy (CORS)
- `PROXY_ALLOWED_DOMAINS`: Hostnames that the proxy is allowed to forward requests to

Both lists support wildcard subdomains using `*`. For example:
- `*.example.com` matches any subdomain of example.com
- `*.api.example.com` matches any subdomain of api.example.com
- `example.com` matches only example.com exactly

## Usage
### Local Development
Start the development server with hot reload:

```sh
npm run dev
```

Start without hot reload:

```sh
npm start
```

The server will run on port 3000 by default.

## Making Requests
To proxy a request, use the /proxy endpoint with a `url` query parameter:

```sh
curl -i "http://localhost:3000/proxy?url=https://example.com"
```

Or with additional path and query parameters in the target URL (make sure to properly encode the URL):

```sh
curl -i "http://localhost:3000/proxy?url=https://example.com/api/data?id=123"
```

## API Endpoints
GET /health - Health check endpoint  
ALL /proxy - Proxy endpoint that handles all HTTP methods (requires url query parameter)
