export default function AspectRatioSelector() {
  return (
    <div className="flex gap-4">
      {["1:1", "3:4", "16:9", "7:3"].map(r => (
        <button key={r} className="border rounded-full px-4 py-2">
          {r}
        </button>
      ))}
    </div>
  );
}
