# CORS Proxy

A secure CORS proxy server built with Express.js and designed for AWS Lambda deployment. This proxy allows whitelisted domains to make cross-origin requests while maintaining security through domain validation.

## Features

- Domain whitelisting through environment variables
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
WHITELISTED_DOMAINS=https://example.com,https://other-example.com
```

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
To proxy a request, use the /proxy/ endpoint followed by the target URL:

```sh
curl -i http://localhost:3000/proxy/https://example.com
```

## API Endpoints
GET /health - Health check endpoint  
ALL /proxy/* - Proxy endpoint that handles all HTTP methods
