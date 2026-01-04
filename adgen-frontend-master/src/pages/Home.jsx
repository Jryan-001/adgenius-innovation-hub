import Sidebar from "../components/Sidebar";
import TrendCard from "../components/TrendCard";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-blue-700">
      <Sidebar />

      <main className="flex-1 bg-white rounded-l-3xl p-10 flex flex-col">
        {/* Centered Header */}
        <div className="flex flex-col items-center justify-center pt-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-blue-700" />
            <h1 className="text-4xl font-bold text-blue-700">AdGen AI</h1>
          </div>
          <p className="text-center text-lg text-gray-600">
            Build professional-quality creatives for your brand
          </p>

          <button
            onClick={() => navigate("/create")}
            className="mt-8 w-2/3 max-w-lg rounded-full border-2 border-blue-700 p-6 text-xl hover:bg-blue-50 transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Write a prompt and start generating
          </button>
        </div>

        {/* Trends Section */}
        <div className="mt-16 flex-1">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Latest trends</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <TrendCard title="Promote my bakery opening" />
            <TrendCard title="A city skyline at dusk" />
            <TrendCard title="Minimal skincare product" />
            <TrendCard title="Invitation poster" />
          </div>
        </div>
      </main>
    </div>
  );
}
