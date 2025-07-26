# Project Structure

## Root Directory
```
├── api/                    # Vercel serverless API functions
├── src/                    # React application source code
├── public/                 # Static assets
├── dist/                   # Build output (generated)
├── node_modules/           # Dependencies (generated)
└── config files            # Various configuration files
```

## API Structure (`/api`)
```
api/
├── auth.js                 # Authentication endpoint
├── store/
│   └── [storeId]/
│       └── menu.js         # Store-specific menu/coupons API
└── stores/
    └── nearby.js           # Store location search API
```

**API Conventions:**
- Use Vercel serverless function format
- Include CORS headers for all endpoints
- Implement rate limiting and authentication
- Export default async handler function
- Use `req.query` for URL parameters, `req.body` for POST data

## Source Code Structure (`/src`)
```
src/
├── components/             # React components
│   ├── ui/                # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   ├── PasswordProtection.tsx
│   └── StoreFinder.tsx
├── lib/
│   └── utils.ts           # Utility functions (cn helper)
├── types/
│   └── dominos.ts         # TypeScript type definitions
├── assets/                # Static assets (images, etc.)
├── App.tsx                # Main application component
├── main.tsx               # React app entry point
├── App.css                # Component-specific styles
└── index.css              # Global styles with Tailwind
```

## Component Organization
- **UI Components**: Reusable base components in `src/components/ui/`
- **Feature Components**: Business logic components in `src/components/`
- **Main App**: Single-page application structure in `App.tsx`

## File Naming Conventions
- **Components**: PascalCase (e.g., `PasswordProtection.tsx`)
- **API Routes**: kebab-case with `.js` extension
- **Types**: camelCase with `.ts` extension
- **Utilities**: camelCase with `.ts` extension

## Import Patterns
- Use `@/` alias for src imports: `import { Button } from "@/components/ui/button"`
- Relative imports for same-directory files
- Group imports: React hooks first, then components, then utilities

## State Management
- **Local State**: React useState for component-level state
- **Persistence**: localStorage for user preferences, sessionStorage for auth
- **No Global State**: Application uses prop drilling and local state only

## Styling Approach
- **Tailwind CSS**: Utility-first styling with custom Domino's color palette
- **Component Variants**: Use `class-variance-authority` for component variations
- **Responsive Design**: Mobile-first approach with Tailwind responsive utilities