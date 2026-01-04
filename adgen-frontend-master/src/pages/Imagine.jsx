import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Scissors, Maximize, ArrowRight, Upload, Loader2, Download, Image as ImageIcon } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function Imagine() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' | 'remove_bg' | 'upscale'
  const fileInputRef = useRef(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      // Using a high-quality placeholder for demo
      setGeneratedImage(`https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop`);
      setIsGenerating(false);
    }, 2000);
  };

  const handleUseInEditor = () => {
    if (generatedImage) {
      // Save to session and navigate to editor
      sessionStorage.setItem('editor_external_image', generatedImage);
      navigate('/editor');
    }
  };

  return (
    <div className="flex min-h-screen bg-blue-700">
      <Sidebar />

      <main className="flex-1 bg-gray-50 rounded-l-3xl p-10 flex flex-col overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">AI Image Studio</h1>
          <p className="text-gray-500">Transform and create assets for your ads</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 bg-gray-200/50 p-1 rounded-2xl w-fit">
          {[
            { id: 'generate', label: 'Generate', icon: Sparkles },
            { id: 'remove_bg', label: 'Remove BG', icon: Scissors },
            { id: 'upscale', label: 'Upscale', icon: Maximize },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition ${activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 flex-1">
          {/* Controls Panel */}
          <div className="space-y-6">
            {activeTab === 'generate' && (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-full">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Creative Generator
                </h2>
                <p className="text-gray-600 mb-6 font-light">
                  Describe the image you want to create. Our AI will craft high-fidelity assets for your campaign.
                </p>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A vibrant product shot of a juice bottle with splashes of water and tropical fruits in the background..."
                  className="w-full h-40 p-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none mb-6"
                />

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Style</p>
                    <select className="bg-transparent w-full font-medium text-gray-700 border-none p-0 focus:ring-0">
                      <option>Photorealistic</option>
                      <option>Digital Art</option>
                      <option>3D Render</option>
                      <option>Minimalist</option>
                    </select>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Format</p>
                    <select className="bg-transparent w-full font-medium text-gray-700 border-none p-0 focus:ring-0">
                      <option>Square (1:1)</option>
                      <option>Portrait (4:5)</option>
                      <option>Landscape (16:9)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {isGenerating ? 'Generating...' : 'Generate Asset'}
                </button>
              </div>
            )}

            {activeTab === 'remove_bg' && (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                  <Scissors className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Background Remover</h2>
                <p className="text-gray-500 mb-8 max-w-sm">
                  Instantly remove backgrounds from your product shots to create transparent PNGs for your ads.
                </p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-4 bg-gray-800 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-gray-700 transition shadow-lg"
                >
                  <Upload className="w-5 h-5" />
                  Upload Product Shot
                </button>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" />
                <p className="mt-4 text-xs text-gray-400">Supported: JPG, PNG, WebP (Max 10MB)</p>
              </div>
            )}

            {activeTab === 'upscale' && (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-6">
                  <Maximize className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Image Upscaler</h2>
                <p className="text-gray-500 mb-8 max-w-sm">
                  Enhance low-resolution images up to 4x while maintaining sharp details and removing noise.
                </p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-4 bg-gray-800 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-gray-700 transition shadow-lg"
                >
                  <Upload className="w-5 h-5" />
                  Select Image to Enhance
                </button>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" />
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="bg-gray-200 rounded-3xl overflow-hidden relative border-4 border-white shadow-xl min-h-[500px] flex items-center justify-center">
            {isGenerating ? (
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">AI is crafting your masterpiece...</p>
              </div>
            ) : generatedImage ? (
              <div className="w-full h-full flex flex-col">
                <img src={generatedImage} alt="Generated" className="w-full flex-1 object-cover" />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 w-full px-6">
                  <button
                    onClick={handleUseInEditor}
                    className="flex-1 py-4 bg-white/90 backdrop-blur text-blue-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white transition shadow-lg"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Use in Editor
                  </button>
                  <button className="p-4 bg-white/90 backdrop-blur text-gray-700 rounded-2xl hover:bg-white transition shadow-lg">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-10">
                <ImageIcon className="w-20 h-20 text-gray-400 mx-auto mb-6 opacity-20" />
                <p className="text-gray-400 font-medium">Your generated image will appear here</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
