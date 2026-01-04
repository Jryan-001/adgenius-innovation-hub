import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ChatInterface from "../components/ChatInterface";
import { generateAd } from "../services/api";
import { Loader2, ArrowLeft } from "lucide-react";

export default function PromptChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);
  // Initialize prompt from navigation state (from TrendCard) or empty
  const [prompt, setPrompt] = useState(() => location.state?.prompt || "");
  const [aspectRatio, setAspectRatio] = useState("1:1");

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateAd({
        brand: "Tesco",
        product: prompt || "New product launch",
        platform: aspectRatio === "9:16" ? "instagram_story" : "facebook_feed"
      });

      // Add aspect ratio to the result
      const dataToSave = {
        ...result,
        aspectRatio: aspectRatio
      };
      sessionStorage.setItem('generatedAd', JSON.stringify(dataToSave));
      navigate("/editor");
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleActionsReceived = (actions) => {
    console.log("Actions received:", actions);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-700">AdGen AI</h1>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 px-3 py-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            ✨ Imagine with AI Power
          </h2>
          <p className="text-gray-600 mt-2">
            Describe your ad and let AI create it for you
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Chat Panel - TALL height to push input to bottom */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3">
              <h3 className="font-semibold">💬 Chat with AdGenius</h3>
            </div>
            <ChatInterface
              onActionsReceived={handleActionsReceived}
              height={550}
            />
          </div>

          {/* Options Panel */}
          <div className="flex flex-col justify-end h-full space-y-4">
            {/* Prompt Input */}
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to create?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., A promotional poster for a summer sale..."
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20"
              />
            </div>

            {/* Aspect Ratio */}
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose aspect ratio
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["1:1", "16:9", "9:16"].map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`p-3 rounded-xl border-2 transition ${aspectRatio === ratio
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className={`mx-auto bg-gray-300 ${ratio === "1:1" ? "w-8 h-8" :
                      ratio === "16:9" ? "w-10 h-6" : "w-6 h-10"
                      }`} />
                    <p className="text-xs text-center mt-2 text-gray-700">{ratio}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>✨ Generate Poster</>
              )}
            </button>
          </div>
        </div>

        {/* Templates Section */}
        <div className="mt-10">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">📋 Start from a Template</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                name: "Summer Sale",
                emoji: "☀️",
                color: "bg-yellow-400",
                palette: { primary: '#f59e0b', secondary: '#ea580c', background: '#fef3c7', text: '#78350f' },
                elements: [
                  { id: 'logo', type: 'logo', x: 0.05, y: 0.05, width: 0.2, height: 0.08 },
                  { id: 'headline', type: 'headline', x: 0.1, y: 0.15, width: 0.8, height: 0.15, text: '☀️ SUMMER SALE' },
                  { id: 'packshot', type: 'packshot', x: 0.2, y: 0.35, width: 0.6, height: 0.35 },
                  { id: 'subtext', type: 'subtext', x: 0.15, y: 0.72, width: 0.7, height: 0.08, text: 'Up to 50% OFF!' },
                  { id: 'cta', type: 'cta', x: 0.25, y: 0.85, width: 0.5, height: 0.1, text: 'Shop Now →' }
                ]
              },
              {
                name: "Product Launch",
                emoji: "🚀",
                color: "bg-blue-500",
                palette: { primary: '#3b82f6', secondary: '#8b5cf6', background: '#1e1b4b', text: '#ffffff' },
                elements: [
                  { id: 'logo', type: 'logo', x: 0.4, y: 0.05, width: 0.2, height: 0.08 },
                  { id: 'headline', type: 'headline', x: 0.1, y: 0.15, width: 0.8, height: 0.12, text: '🚀 NEW LAUNCH' },
                  { id: 'packshot', type: 'packshot', x: 0.15, y: 0.3, width: 0.7, height: 0.4 },
                  { id: 'subtext', type: 'subtext', x: 0.1, y: 0.72, width: 0.8, height: 0.08, text: 'Innovation meets design' },
                  { id: 'cta', type: 'cta', x: 0.3, y: 0.85, width: 0.4, height: 0.1, text: 'Discover' }
                ]
              },
              {
                name: "Holiday Promo",
                emoji: "🎄",
                color: "bg-green-500",
                palette: { primary: '#16a34a', secondary: '#dc2626', background: '#fef2f2', text: '#166534' },
                elements: [
                  { id: 'headline', type: 'headline', x: 0.1, y: 0.08, width: 0.8, height: 0.15, text: '🎄 HOLIDAY SPECIAL' },
                  { id: 'packshot', type: 'packshot', x: 0.2, y: 0.28, width: 0.6, height: 0.4 },
                  { id: 'subtext', type: 'subtext', x: 0.15, y: 0.7, width: 0.7, height: 0.08, text: 'Spread the joy!' },
                  { id: 'cta', type: 'cta', x: 0.25, y: 0.82, width: 0.5, height: 0.1, text: 'Gift Now 🎁' }
                ]
              },
              {
                name: "Flash Sale",
                emoji: "⚡",
                color: "bg-pink-500",
                palette: { primary: '#ec4899', secondary: '#ef4444', background: '#fdf2f8', text: '#831843' },
                elements: [
                  { id: 'headline', type: 'headline', x: 0.05, y: 0.1, width: 0.9, height: 0.15, text: '⚡ FLASH SALE ⚡' },
                  { id: 'subtext', type: 'subtext', x: 0.2, y: 0.28, width: 0.6, height: 0.1, text: 'ENDS TONIGHT!' },
                  { id: 'packshot', type: 'packshot', x: 0.2, y: 0.4, width: 0.6, height: 0.35 },
                  { id: 'cta', type: 'cta', x: 0.2, y: 0.8, width: 0.6, height: 0.12, text: 'Grab Deal →' }
                ]
              },
              {
                name: "New Arrival",
                emoji: "✨",
                color: "bg-purple-500",
                palette: { primary: '#a855f7', secondary: '#ec4899', background: '#faf5ff', text: '#581c87' },
                elements: [
                  { id: 'headline', type: 'headline', x: 0.1, y: 0.08, width: 0.8, height: 0.12, text: '✨ NEW ARRIVAL ✨' },
                  { id: 'packshot', type: 'packshot', x: 0.15, y: 0.25, width: 0.7, height: 0.45 },
                  { id: 'subtext', type: 'subtext', x: 0.15, y: 0.72, width: 0.7, height: 0.08, text: 'Just dropped!' },
                  { id: 'cta', type: 'cta', x: 0.3, y: 0.84, width: 0.4, height: 0.1, text: 'Explore' }
                ]
              },
              {
                name: "Clearance",
                emoji: "🏷️",
                color: "bg-gray-500",
                palette: { primary: '#6b7280', secondary: '#374151', background: '#f3f4f6', text: '#111827' },
                elements: [
                  { id: 'headline', type: 'headline', x: 0.1, y: 0.1, width: 0.8, height: 0.15, text: '🏷️ CLEARANCE' },
                  { id: 'subtext', type: 'subtext', x: 0.15, y: 0.27, width: 0.7, height: 0.08, text: 'Everything must go!' },
                  { id: 'packshot', type: 'packshot', x: 0.2, y: 0.4, width: 0.6, height: 0.35 },
                  { id: 'cta', type: 'cta', x: 0.25, y: 0.8, width: 0.5, height: 0.12, text: 'Shop Sale' }
                ]
              },
              {
                name: "Event Invite",
                emoji: "🎉",
                color: "bg-indigo-500",
                palette: { primary: '#6366f1', secondary: '#3b82f6', background: '#eef2ff', text: '#3730a3' },
                elements: [
                  { id: 'headline', type: 'headline', x: 0.1, y: 0.08, width: 0.8, height: 0.12, text: "🎉 YOU'RE INVITED!" },
                  { id: 'subtext', type: 'subtext', x: 0.15, y: 0.22, width: 0.7, height: 0.08, text: 'Join us for something special' },
                  { id: 'packshot', type: 'packshot', x: 0.2, y: 0.35, width: 0.6, height: 0.35 },
                  { id: 'cta', type: 'cta', x: 0.25, y: 0.78, width: 0.5, height: 0.12, text: 'RSVP Now' }
                ]
              },
              {
                name: "Minimalist",
                emoji: "◻️",
                color: "bg-gray-200",
                palette: { primary: '#1f2937', secondary: '#6b7280', background: '#ffffff', text: '#111827' },
                elements: [
                  { id: 'logo', type: 'logo', x: 0.4, y: 0.08, width: 0.2, height: 0.06 },
                  { id: 'packshot', type: 'packshot', x: 0.25, y: 0.25, width: 0.5, height: 0.45 },
                  { id: 'headline', type: 'headline', x: 0.2, y: 0.75, width: 0.6, height: 0.08, text: 'Simply Beautiful' },
                  { id: 'cta', type: 'cta', x: 0.35, y: 0.86, width: 0.3, height: 0.08, text: 'Learn More' }
                ]
              },
            ].map((template, i) => (
              <button
                key={i}
                onClick={() => {
                  // Save template data to session and go to editor
                  const templateData = {
                    layout: {
                      elements: template.elements,
                      palette: template.palette
                    }
                  };
                  sessionStorage.setItem('generatedAd', JSON.stringify(templateData));
                  navigate('/editor');
                }}
                className={`p-4 ${template.color} rounded-xl text-white hover:scale-105 transition-transform shadow-lg`}
              >
                <span className="text-3xl block mb-2">{template.emoji}</span>
                <span className="font-semibold">{template.name}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
