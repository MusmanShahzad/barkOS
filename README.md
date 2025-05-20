# Brief Management System

A comprehensive application for managing briefs, assets, comments, and tags with a modern React frontend and GraphQL backend.

## Project Overview

This application consists of two main parts:

1. **Frontend (`brief-management`)**: A Next.js application with React, TypeScript, and Tailwind CSS
2. **Backend (`brief-management-be`)**: A Node.js GraphQL API server that connects to Supabase for data storage

## System Requirements

- Node.js 18+ 
- npm or pnpm
- PostgreSQL database (via Supabase)
- Git

## Getting Started

Clone this repository to get started with both the frontend and backend applications.

```bash
git clone <repository-url>
cd <repository-name>
```

### Setting Up the Backend

1. Navigate to the backend directory:

```bash
cd brief-management-be
```

2. Install dependencies:

```bash
npm install
```

3. Create an environment file:

```bash
cp .env.example .env
```

4. Update the `.env` file with your Supabase credentials:

```
# Supabase connection details
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key

# Server configuration
PORT=4000
```

5. Start the development server:

```bash
npm run dev
```

The GraphQL API server will run at `http://localhost:4000/graphql`.

### Setting Up the Frontend

1. Navigate to the frontend directory:

```bash
cd brief-management
```

2. Install dependencies:

```bash
npm install
# or if you prefer pnpm
pnpm install
```

3. Generate GraphQL types (ensure the backend is running):

```bash
npm run codegen
# or
pnpm run codegen
```

4. Start the development server:

```bash
npm run dev
# or
pnpm run dev
```

The frontend application will be available at `http://localhost:3000`.

## Demo

Watch our application demonstration:
[Brief Management System Demo](https://www.loom.com/share/dc6dff7e873f4be3b1db3fcc9222fe1a](https://brief-management.vercel.app/briefs)

## Deployment on Vercel

This project can be deployed on Vercel for both frontend and backend components.

### Synchronizing Frontend and Backend

For proper synchronization between frontend and backend:

1. Set up CORS in your backend:
   - Ensure your backend allows requests from your frontend domain
   - Add your Vercel frontend URL to the allowed origins

2. Set up environment variable in the frontend:
   - Create a `.env.production` file with:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/graphql
     ```

3. Use Vercel's GitHub Integration for automatic deployments:
   - Connect both projects to your GitHub repository
   - Configure automatic deployments on push
   - Use branch protection to control production deployments

4. Configure deployment hooks:
   - Set up a deployment hook in your backend project
   - Trigger this hook when frontend code that affects the API is updated

5. Consider Vercel Teams or Vercel for Enterprise:
   - For better project linking and management
   - Enables sharing environment variables between projects

## Database Schema

The application uses a PostgreSQL database with the following tables:

- `assets`: Stores file assets with metadata
- `asset_comments`: Links comments to assets
- `asset_tags`: Links tags to assets
- `briefs`: Stores brief information including title, description, status, etc.
- `brief_assets`: Links assets to briefs
- `brief_comments`: Links comments to briefs
- `brief_tags`: Links tags to briefs
- `comments`: Stores user comments
- `tags`: Stores tag metadata
- `media`: Stores file metadata
- `objectives`: Stores objectives for briefs
- `products`: Stores product information
- `users`: Stores user information

## Features

- **Asset Management**: Upload, view, edit, and delete digital assets
- **Brief Creation and Management**: Create and manage briefs with related assets and comments
- **Tagging System**: Add tags to assets and briefs for better organization
- **Comment System**: Add comments to briefs and assets for collaboration
- **Responsive UI**: Modern interface that works across devices
- **Infinite Scroll**: Efficient loading of large datasets
- **GraphQL API**: Strong typing and efficient data fetching

## Development

### Frontend Development

The frontend uses Next.js with TypeScript and Tailwind CSS for styling. Components follow the shadcn/ui pattern and are generated using the CLI.

Key directories:
- `/components`: UI components
- `/app`: Next.js App Router pages
- `/src/graphql`: GraphQL operations and generated types
- `/hooks`: Custom React hooks

Code generation:
- Run `npm run codegen` to generate TypeScript types from the GraphQL schema
- Run `npm run codegen:watch` to continuously update types during development

### Backend Development

The backend uses Apollo Server with GraphQL and connects to Supabase for data storage.

Key directories:
- `/src`: Source code
- `/src/schema.ts`: GraphQL schema definitions
- `/migrations`: Database migrations

## Building for Production

### Backend

```bash
cd brief-management-be
npm run build
npm start
```

### Frontend

```bash
cd brief-management
npm run build
npm start
```

## API Documentation

The GraphQL API provides comprehensive operations for all entities in the system:

- Query assets, briefs, comments, tags, and media
- Create, update, and delete operations
- Filter, sort, and paginate results
- Upload and manage files

Access the GraphQL playground at `http://localhost:4000/graphql` when running the backend server.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
