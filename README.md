# AdGenius

An AI-powered creative tool that transforms how retail advertisements are made.

---

## The Problem We Solve

Every day, thousands of advertisers want to promote their products through retail media networks like Tesco, Sainsbury's, and ASDA. But there's a disconnect: creating a single compliant advertisement typically requires:

- **3-5 days** of back-and-forth with design agencies
- **£500-2000** per creative asset
- **Multiple revision cycles** for brand compliance approval
- **Separate exports** for each platform (Instagram, Facebook, in-store displays)

This means small advertisers are effectively locked out of retail media. Large advertisers face bottlenecks that slow their campaigns. And retail media networks miss revenue from advertisers who simply cannot afford professional creative production.

AdGenius changes this equation. An advertiser enters a product name, and sixty seconds later, they have a professionally designed, brand-compliant advertisement ready for export to multiple platforms.

---

## How It Works

The system operates through a conversational AI interface. Rather than learning complex design software, advertisers describe what they want in plain language:

> "Create a coffee shop ad with a warm aesthetic"

The AI interprets this request and generates a complete advertisement:

1. **Selects an appropriate color palette** based on the "warm" aesthetic request
2. **Fetches relevant imagery** from stock photo databases using keyword understanding
3. **Composes a layout** following proven retail advertising patterns
4. **Writes headline and call-to-action copy** matching the brand voice
5. **Positions all elements** according to platform-specific safe zones

The advertiser sees the result appear on their canvas in real-time. They can refine it through natural conversation:

> "Make the headline bigger"  
> "Add a 20% off badge in the corner"  
> "Change the background to use this image instead"

Each instruction is interpreted and executed immediately on the canvas.

---

## The Technical Innovation

### Why Existing Solutions Fall Short

Most automated design tools use rule-based systems. They encode brand guidelines as specific values: "logo must be at least 100 pixels," "text must use Helvetica," "primary color is #E41C2A."

This approach breaks down when guidelines are subjective. Consider a real brand guideline: "The logo must be prominent and clearly visible." What does "prominent" mean? 10% of canvas area? 15%? Does visibility depend on background color? On the clutter of other elements?

Human brand reviewers handle this ambiguity naturally. They look at the advertisement as a whole and make a judgment. Rule-based systems cannot.

### Our Approach: Adaptive Compliance

AdGenius uses a Vision-Language Model (Google Gemini Pro Vision) as a brand compliance auditor. Rather than checking rules, it examines the advertisement visually and reasons about it:

```
The system receives:
- The rendered advertisement as an image
- The brand's compliance guidelines in natural language
- Context about the platform and intended audience

It returns:
- A 0-100 compliance score
- Specific observations about each guideline
- Actionable improvements ("Move the logo 20px up to clear the safe zone")
- Identification of critical issues that must be fixed
```

This approach handles edge cases that rules cannot express. It provides feedback in human terms. And it adapts to new brands without reprogramming—just provide their guidelines in plain text.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Canvas Editor│  │ AI Chat      │  │ Export Controls      │   │
│  │ (Fabric.js)  │  │ Interface    │  │ (Multi-format)       │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │    Backend API      │
                    │    (Express.js)     │
                    │  - Project Storage  │
                    │  - Brand Guidelines │
                    │  - Image Uploads    │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴───────────┐
                    │    AI Engine         │
                    │    (Port 3001)       │
                    │                      │
                    │  ┌────────────────┐  │
                    │  │ Chat Agent     │──┼── Natural language understanding
                    │  └────────────────┘  │
                    │  ┌────────────────┐  │
                    │  │ Layout Agent   │──┼── Design pattern generation
                    │  └────────────────┘  │
                    │  ┌────────────────┐  │
                    │  │ Copy Agent     │──┼── Headline/CTA writing
                    │  └────────────────┘  │
                    │  ┌────────────────┐  │
                    │  │ Compliance     │──┼── Vision-based auditing
                    │  │ Agent          │  │
                    │  └────────────────┘  │
                    └──────────────────────┘
```

### AI Agent Responsibilities

**Chat Agent**: The central coordinator. It interprets natural language requests and determines which actions to take. When a user says "add chocolate to the canvas," it recognizes this as an image request, generates appropriate search terms, fetches the image, and adds it to the canvas with sensible default positioning.

**Layout Agent**: Understands design principles—rule of thirds, visual hierarchy, breathing space, platform-specific safe zones. When generating a layout, it produces responsive coordinates (0.0 to 1.0) that scale to any screen size. It has learned from patterns in successful retail advertisements.

**Copy Agent**: Writes in brand voices. For Tesco, it's "helpful, simple, value-driven." For Sainsbury's, "taste-focused and quality-oriented." For Aldi, "confident and no-nonsense." It adapts headline length to platform constraints—punchy for Instagram Stories, informational for Facebook Feed.

**Compliance Agent**: The visual auditor. It receives the rendered advertisement as an image and evaluates it against brand guidelines. Unlike rule checkers, it can interpret subjective guidelines and provide nuanced feedback.

---

## Supported Capabilities

The AI understands a range of commands:

| Request Type     | Example                              | What Happens                              |
|------------------|--------------------------------------|-------------------------------------------|
| Add imagery      | "Add a coffee cup"                   | Searches stock photos, adds to canvas    |
| Set background   | "Add coffee beans as background"     | Fetches image, scales to fill canvas     |
| Generate layouts | "Create a fitness gym ad"            | Produces complete layout with all elements|
| Add text         | "Add text saying Fresh Brewed Daily" | Adds styled text element                 |
| Modify elements  | "Make it bigger" / "Move it left"    | Transforms selected element              |
| Change colors    | "Make the background darker"         | Adjusts color values                     |
| Compliance check | (Automatic)                          | Validates against brand rules            |

---

## Getting Started

### Requirements

- Node.js 18 or later
- MongoDB (local or Atlas)
- API keys for Gemini, Pexels, and optionally Cloudinary

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/adgenius-innovation-hub.git
cd adgenius-innovation-hub

# Install dependencies for each service
cd ai-engine && npm install
cd ../backend && npm install
cd ../adgen-frontend-master && npm install
```

### Configuration

Create environment files in each service directory:

**ai-engine/.env**
```
GEMINI_API_KEY=your_gemini_key
GEMINI_API_KEY_2=optional_second_key
GEMINI_API_KEY_3=optional_third_key
GEMINI_MODEL=gemini-1.5-flash
PEXELS_API_KEY=your_pexels_key
```

Multiple Gemini keys enable automatic rotation when rate limits are hit.

**backend/.env**
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/adgenius
AI_ENGINE_URL=http://localhost:3001
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

**adgen-frontend-master/.env**
```
VITE_AI_URL=http://localhost:3000
```

### Running

Start each service in a separate terminal:

```bash
# AI Engine (port 3001)
cd ai-engine && npm run dev

# Backend (port 3000)
cd backend && npm run dev

# Frontend (port 5173)
cd adgen-frontend-master && npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Project Structure

```
adgenius-innovation-hub/
│
├── ai-engine/                    # AI orchestration service
│   └── src/
│       ├── index.js              # Express server, routes, image proxy
│       └── services/
│           ├── chatAgent.js      # Natural language to canvas actions
│           ├── layoutAgent.js    # Design-aware layout generation
│           ├── copyAgent.js      # Brand-voice-aware copywriting
│           ├── complianceAgent.js # Vision-based compliance checking
│           ├── exportService.js  # Multi-format rendering
│           └── apiKeyManager.js  # Gemini key rotation
│
├── backend/                      # Data and proxy layer
│   └── src/
│       ├── server.js
│       ├── models/               # MongoDB schemas
│       └── routes/               # REST endpoints
│
├── adgen-frontend-master/        # React application
│   └── src/
│       ├── pages/
│       │   └── Editor.jsx        # Main canvas editor (65KB)
│       ├── components/
│       │   ├── CanvasEditor.jsx  # Fabric.js wrapper
│       │   ├── RibbonToolbar.jsx # Office-style toolbar
│       │   └── ChatInterface.jsx # AI conversation panel
│       ├── context/
│       │   └── AuthContext.jsx   # Authentication state
│       └── services/
│           └── api.js            # Backend client
│
└── shared/                       # Common types
```

---

## Technology Choices

**Canvas rendering**: Fabric.js provides a mature, well-documented canvas abstraction with support for object selection, transformation, and serialization to JSON for persistence.

**AI model**: Google Gemini offers both text generation and vision capabilities in a single API, eliminating the need for separate services. The free tier is sufficient for development and moderate production use.

**Image sourcing**: Pexels provides a free API with genuine keyword search, unlike services that only offer random images.

**Image hosting**: Cloudinary handles upload, transformation, and CDN delivery. Background removal for product packshots is built-in.

---

## Pre-Configured Brands

Brand guidelines are pre-loaded for major UK retailers:

| Brand       | Voice                         | Primary Colors             |
|-------------|-------------------------------|----------------------------|
| Tesco       | Helpful, simple, value-driven | #E41C2A, #FFFFFF, #00539F  |
| Sainsbury's | Taste-focused, quality        | #F06C00, #FFFFFF, #4A4A4A  |
| ASDA        | Value-conscious, family       | #78BE20, #FDB813, #FFFFFF  |
| Morrisons   | Fresh, market-style           | #FFD100, #006F44, #FFFFFF  |
| Aldi        | Confident, no-nonsense        | #00205B, #EF7D00, #FFFFFF  |

New brands can be added by defining color palettes, voice keywords, and compliance rules.

---

## API Endpoints

### AI Engine (Port 3001)

| Endpoint                       | Purpose                               |
|--------------------------------|---------------------------------------|
| `POST /api/ai/chat`            | Natural language canvas control       |
| `POST /api/ai/generate-layout` | Platform-optimized layout generation  |
| `POST /api/ai/generate-copy`   | Headline and CTA creation             |
| `POST /api/ai/check-compliance`| Vision-based brand audit              |
| `GET /api/ai/fetch-image`      | Stock photo proxy with keyword search |

### Backend (Port 3000)

| Endpoint                           | Purpose                      |
|------------------------------------|------------------------------|
| `GET/POST /api/projects`           | Project listing and creation |
| `GET/PUT/DELETE /api/projects/:id` | Individual project operations|
| `GET /api/brands`                  | Available brand guidelines   |
| `POST /api/upload/image`           | Cloudinary image upload      |

---

## Performance Characteristics

Measured during development with standard hardware:

| Operation                  | Typical Time |
|----------------------------|--------------|
| Single element addition    | 1-3 seconds  |
| Complete layout generation | 5-8 seconds  |
| Compliance check           | 3-5 seconds  |
| Multi-format export        | 2-4 seconds  |

Rate limits depend on API tier. Free Gemini accounts allow approximately 15-20 requests per minute per key. Multiple keys can be configured for higher throughput.

---

## Limitations and Known Issues

- Gradient backgrounds are partially supported; Fabric.js renders them as solid colors from the first gradient stop
- Very long conversations may exceed context limits; the system uses recent history only
- Image search quality depends on Pexels database coverage
- Compliance checking requires clear brand guidelines; ambiguous rules produce inconsistent results

---

## Future Considerations

Areas for potential development:

1. **Video generation**: Animate static advertisements for short-form video platforms
2. **A/B variant generation**: Produce multiple versions for split testing
3. **Performance learning**: Incorporate click-through data to improve suggestions
4. **Extended platform support**: TikTok, Pinterest, retail-specific digital displays
5. **Enterprise authentication**: SSO, role-based access, approval workflows

---

## Background

This project was developed for the Tesco InnovAItion Jam hackathon. The goal was to demonstrate a practical application of generative AI in retail media that addresses real business constraints.

The core insight: compliance checking is the bottleneck in automated creative production. By solving compliance with vision AI rather than rules, the system handles the subjective guidelines that have historically required human judgment.

---

## License

Developed for the Tesco InnovAItion Jam 2024.
