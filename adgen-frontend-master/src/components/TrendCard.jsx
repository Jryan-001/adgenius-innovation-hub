import { useNavigate } from "react-router-dom";

export default function TrendCard({
  type = "Design",
  title,
  image,
  prompt,
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to create page with the prompt
    navigate("/create", {
      state: {
        prompt: prompt || title,
        type,
      },
    });
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer bg-white border-2 border-gray-200 rounded-2xl p-4 hover:border-blue-500 hover:shadow-lg transition-all"
    >
      {/* Tag */}
      <span
        className={`text-xs font-semibold px-2 py-1 rounded-full ${type === "Design"
            ? "bg-purple-100 text-purple-600"
            : "bg-blue-100 text-blue-600"
          }`}
      >
        {type}
      </span>

      {/* Title */}
      <p className="mt-3 text-sm font-medium text-gray-800">
        {title}
      </p>

      {/* Image Preview Placeholder */}
      <div className="mt-3 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-2xl">✨</span>
        )}
      </div>
    </div>
  );
}
