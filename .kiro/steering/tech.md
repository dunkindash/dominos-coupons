# Technology Stack

## Frontend Framework
- **React 19.1.0** with TypeScript
- **Vite** as build tool and dev server
- **Tailwind CSS** for styling with custom Domino's brand colors

## UI Components
- **shadcn/ui** component library with Radix UI primitives
- Custom components in `src/components/ui/` (Button, Card, Input)
- **class-variance-authority** and **clsx** for conditional styling

## Backend/API
- **Vercel Serverless Functions** for API endpoints
- **Node.js** runtime for API handlers
- Proxy configuration to Domino's public API

## Key Dependencies
- **dominos** (v3.3.1) - Official Domino's API client library
- **tailwind-merge** - Utility for merging Tailwind classes
- **crypto** (Node.js built-in) - For authentication and security

## Development Tools
- **ESLint** with TypeScript support
- **PostCSS** with Autoprefixer
- **TypeScript 5.8.3** with strict configuration

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Project Setup
```bash
npm install          # Install dependencies
```

## Build Configuration
- **Vite Config**: Path aliases (`@/` → `src/`), API proxy setup
- **TypeScript**: Project references with separate app and node configs
- **Tailwind**: Custom color scheme with Domino's branding
- **Vercel**: Configured for serverless deployment with API routes

## Environment
- **Development**: Uses Vite proxy to route `/api` to Domino's API
- **Production**: Uses Vercel serverless functions at `/api` endpoints
- **Authentication**: JWT-like tokens with HMAC signatures
- **Rate Limiting**: In-memory storage (resets on deployment)