# AdGenius Backend

Main backend API for AdGenius. Orchestrates AI services, handles image uploads, and manages data.

## Setup

1. Copy `.env.example` to `.env` and fill in values
2. Install dependencies: `npm install`
3. Start MongoDB (local or Atlas)
4. Run: `npm run dev`

## API Endpoints

### Uploads
- `POST /api/upload/image` - Upload general image
- `POST /api/upload/packshot` - Upload product image (with BG removal)
- `POST /api/upload/logo` - Upload logo

### AI (proxied to AI Engine)
- `POST /api/ai/generate-layout` - Generate smart ad layout
- `POST /api/ai/generate-copy` - Generate headlines & CTAs
- `POST /api/ai/check-compliance` - Full compliance check
- `POST /api/ai/generate-ad` - Generate complete ad

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Brands
- `GET /api/brands` - List brands
- `GET /api/brands/:slug` - Get brand guidelines

## Required Services
- MongoDB (local or Atlas)
- AI Engine running on :3001
- Cloudinary account
