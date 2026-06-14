# Nuxt Payload Analysis

## Overview
The `_payload.json` file contains the Nuxt 3 hydration data that powers the portfolio. This is the structured data layer that feeds the Vue components.

## Data Structure

### Root Level
- `data`: Project metadata and content
- `prerenderedAt`: Timestamp of static generation
- `sourceMap`: Build-time source mapping

### Content Sections

1. **Email**: Contact information
2. **Projects**: Array of portfolio projects
3. **Showreel**: Video showcase data
4. **Social Links**: Social media profiles
5. **Title**: Site branding

### Project Schema

Each project contains:
- `title`: Project name
- `slug`: URL-friendly identifier
- `year`: Release year
- `shortDescription`: Brief overview
- `behanceUrl`: Link to Behance portfolio
- `thumbnail`: Featured image reference
- `styleframes`: Array of preview images
- `video`: Mux video hosting data

### Video Data Structure

Projects use Mux for video hosting:
- `assetId`: Mux asset identifier
- `playbackId`: Mux playback identifier
- `filename`: Original filename

### Image References

Images are stored as Sanity.io references:
- `_ref`: Image asset ID
- `_type`: "reference"
- Asset format: `image-{hash}-{dimensions}-{format}`

## Key Insights

### Data Source
- **CMS**: Sanity.io (headless CMS)
- **Video Hosting**: Mux
- **Image CDN**: Sanity's image delivery network

### Content Organization
- Projects are indexed sequentially
- Each project has multiple styleframes (3-4 preview images)
- Videos use Mux for adaptive bitrate streaming
- Metadata includes year and external links

### Performance Implications
- Pre-rendered static payload reduces runtime queries
- Structured data enables efficient filtering/sorting
- Image references support lazy loading
- Video playback IDs enable streaming optimization

## Integration Pattern

This payload is loaded by Nuxt during hydration:
1. Server pre-renders the site with payload data
2. Client receives HTML + payload.json
3. Vue components hydrate with this data
4. No additional API calls needed for initial render

## Building Similar Sites

To replicate this architecture:
1. Use a headless CMS (Sanity, Contentful, Strapi)
2. Structure content with clear schemas
3. Use Mux or similar for video delivery
4. Generate static payloads during build
5. Hydrate Vue/React components client-side

