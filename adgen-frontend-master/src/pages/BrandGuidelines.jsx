import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Palette, Type } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function BrandGuidelines() {
    const navigate = useNavigate();

    // Load saved brand guidelines
    const [guidelines, setGuidelines] = useState(() => {
        const saved = localStorage.getItem('adgen_brand_guidelines');
        return saved ? JSON.parse(saved) : {
            primaryColor: '#E41C2A',
            secondaryColor: '#00539F',
            accentColor: '#FFD700',
            backgroundColor: '#FFFFFF',
            textColor: '#333333',
            fontFamily: 'Arial',
            logoUrl: null,
            brandName: 'My Brand'
        };
    });

    const [colorPalettes] = useState([
        { name: 'Tesco', colors: ['#E41C2A', '#00539F', '#FFD700'] },
        { name: 'Modern Blue', colors: ['#3B82F6', '#1E40AF', '#93C5FD'] },
        { name: 'Forest Green', colors: ['#10B981', '#065F46', '#34D399'] },
        { name: 'Sunset Orange', colors: ['#F97316', '#EA580C', '#FED7AA'] },
        { name: 'Royal Purple', colors: ['#8B5CF6', '#6D28D9', '#C4B5FD'] },
        { name: 'Coral Pink', colors: ['#F472B6', '#EC4899', '#FBCFE8'] },
    ]);

    const [fonts] = useState([
        'Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Verdana',
        'Trebuchet MS', 'Courier New', 'Impact', 'Comic Sans MS'
    ]);

    const handleSave = () => {
        localStorage.setItem('adgen_brand_guidelines', JSON.stringify(guidelines));
        alert('Brand guidelines saved!');
    };

    const applyPalette = (palette) => {
        setGuidelines(prev => ({
            ...prev,
            primaryColor: palette.colors[0],
            secondaryColor: palette.colors[1],
            accentColor: palette.colors[2]
        }));
    };

    return (
        <div className="flex min-h-screen bg-blue-700">
            <Sidebar />

            <main className="flex-1 bg-gray-50 rounded-l-3xl p-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Brand Guidelines</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Brand Colors */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Palette className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-800">Brand Colors</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Primary Color */}
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    value={guidelines.primaryColor}
                                    onChange={(e) => setGuidelines(prev => ({ ...prev, primaryColor: e.target.value }))}
                                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                                />
                                <div>
                                    <p className="font-medium text-gray-800">Primary Color</p>
                                    <p className="text-sm text-gray-500">{guidelines.primaryColor}</p>
                                </div>
                            </div>

                            {/* Secondary Color */}
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    value={guidelines.secondaryColor}
                                    onChange={(e) => setGuidelines(prev => ({ ...prev, secondaryColor: e.target.value }))}
                                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                                />
                                <div>
                                    <p className="font-medium text-gray-800">Secondary Color</p>
                                    <p className="text-sm text-gray-500">{guidelines.secondaryColor}</p>
                                </div>
                            </div>

                            {/* Accent Color */}
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    value={guidelines.accentColor}
                                    onChange={(e) => setGuidelines(prev => ({ ...prev, accentColor: e.target.value }))}
                                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                                />
                                <div>
                                    <p className="font-medium text-gray-800">Accent Color</p>
                                    <p className="text-sm text-gray-500">{guidelines.accentColor}</p>
                                </div>
                            </div>

                            {/* Background Color */}
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    value={guidelines.backgroundColor}
                                    onChange={(e) => setGuidelines(prev => ({ ...prev, backgroundColor: e.target.value }))}
                                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                                />
                                <div>
                                    <p className="font-medium text-gray-800">Background</p>
                                    <p className="text-sm text-gray-500">{guidelines.backgroundColor}</p>
                                </div>
                            </div>

                            {/* Text Color */}
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    value={guidelines.textColor}
                                    onChange={(e) => setGuidelines(prev => ({ ...prev, textColor: e.target.value }))}
                                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                                />
                                <div>
                                    <p className="font-medium text-gray-800">Text Color</p>
                                    <p className="text-sm text-gray-500">{guidelines.textColor}</p>
                                </div>
                            </div>
                        </div>

                        {/* Preset Palettes */}
                        <h3 className="font-medium text-gray-700 mt-6 mb-3">Quick Palettes</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {colorPalettes.map((palette) => (
                                <button
                                    key={palette.name}
                                    onClick={() => applyPalette(palette)}
                                    className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition text-left"
                                >
                                    <p className="text-sm font-medium text-gray-700 mb-2">{palette.name}</p>
                                    <div className="flex gap-1">
                                        {palette.colors.map((color, i) => (
                                            <div
                                                key={i}
                                                className="w-6 h-6 rounded"
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Typography & Brand Info */}
                    <div className="space-y-6">
                        {/* Typography */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <Type className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-semibold text-gray-800">Typography</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Primary Font
                                    </label>
                                    <select
                                        value={guidelines.fontFamily}
                                        onChange={(e) => setGuidelines(prev => ({ ...prev, fontFamily: e.target.value }))}
                                        className="w-full p-3 border border-gray-200 rounded-xl"
                                    >
                                        {fonts.map(font => (
                                            <option key={font} value={font} style={{ fontFamily: font }}>
                                                {font}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Font Preview */}
                                <div
                                    className="p-4 bg-gray-50 rounded-xl"
                                    style={{ fontFamily: guidelines.fontFamily }}
                                >
                                    <p className="text-2xl font-bold" style={{ color: guidelines.primaryColor }}>
                                        Headline Text
                                    </p>
                                    <p className="text-lg" style={{ color: guidelines.textColor }}>
                                        Body text looks like this
                                    </p>
                                    <p className="text-sm" style={{ color: guidelines.secondaryColor }}>
                                        Secondary text style
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Brand Info */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Brand Info</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Brand Name
                                    </label>
                                    <input
                                        type="text"
                                        value={guidelines.brandName}
                                        onChange={(e) => setGuidelines(prev => ({ ...prev, brandName: e.target.value }))}
                                        className="w-full p-3 border border-gray-200 rounded-xl"
                                        placeholder="Your Brand Name"
                                    />
                                </div>

                                {/* Color Preview Card */}
                                <div
                                    className="p-6 rounded-xl"
                                    style={{ backgroundColor: guidelines.primaryColor }}
                                >
                                    <p
                                        className="text-xl font-bold mb-2"
                                        style={{ color: guidelines.backgroundColor, fontFamily: guidelines.fontFamily }}
                                    >
                                        {guidelines.brandName}
                                    </p>
                                    <p
                                        className="text-sm opacity-90"
                                        style={{ color: guidelines.backgroundColor }}
                                    >
                                        Preview of your brand colors
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                    >
                        <Save className="w-5 h-5" />
                        Save Guidelines
                    </button>
                </div>
            </main>
        </div>
    );
}
