# GraphQL API with Supabase

This project implements a GraphQL API for a database with assets, briefs, comments, tags, and media tables using Apollo Server and Supabase.

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and update with your Supabase credentials:
   ```
   cp .env.example .env
   ```
   Then edit the `.env` file with your Supabase URL and API key.

4. Build the project:
   ```
   npm run build
   ```

5. Start the server:
   ```
   npm start
   ```
   For development with auto-reload:
   ```
   npm run dev
   ```

## API Endpoints

The GraphQL API is available at: http://localhost:4000/graphql

You can use this endpoint to perform all CRUD operations on the following tables:
- Assets
- Asset Comments
- Asset Tags
- Briefs
- Brief Assets
- Brief Comments
- Brief Tags
- Comments
- Tags
- Media

## Example Queries

### Get All Assets

```graphql
query GetAssets {
  getAssets {
    id
    name
    description
    created_at
    media {
      id
      url
      type
    }
    thumbnail {
      id
      url
    }
    tags {
      id
      name
    }
  }
}
```

### Create an Asset

```graphql
mutation CreateAsset {
  createAsset(input: {
    media_id: 1,
    name: "New Asset",
    description: "Asset description"
  }) {
    id
    name
    description
    created_at
  }
}
```

### Get Brief with Related Data

```graphql
query GetBrief {
  getBrief(id: 1) {
    id
    title
    description
    created_at
    assets {
      id
      name
      description
    }
    comments {
      id
      text
    }
    tags {
      id
      name
    }
  }
}
```

## Database Schema

The API is designed to work with a PostgreSQL database with the following tables:
- assets
- asset_comments
- asset_tags
- briefs
- brief_assests (note: contains a typo in the name)
- brief_comments
- brief_tags
- comments
- tags
- media 