export default function ChatBubble({ side, text }) {
  return (
    <div className={`flex ${side === "right" ? "justify-end" : "justify-start"}`}>
      <div className="bg-gray-300 rounded-full px-6 py-3 max-w-md">
        {text}
      </div>
    </div>
  );
}
