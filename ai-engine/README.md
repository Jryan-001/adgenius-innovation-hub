# AdGenius AI Engine

The intelligent core of AdGenius - handles layout generation, copy creation, and compliance checking.

## Services

- **Layout Agent** - Generates smart ad layouts using implicit design learning
- **Copy Agent** - Creates headlines and CTAs following brand voice
- **Compliance Agent** - Vision-based guideline validation
- **Export Service** - Multi-format Cloudinary transformations

## Setup

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the service:
   ```bash
   npm run dev
   ```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/generate-layout` | POST | Generate smart ad layout |
| `/api/ai/generate-copy` | POST | Generate headlines & CTAs |
| `/api/ai/check-compliance` | POST | Vision-based compliance check |
| `/api/ai/export-formats` | POST | Generate multi-format URLs |

## Team Integration

The backend service should proxy requests to these endpoints.
Frontend should call backend, which then calls AI engine.
