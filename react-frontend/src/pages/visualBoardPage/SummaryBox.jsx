export default function SummaryBox({ text }) {
  return (
    <div className="border-l-4 border-blue-500 bg-blue-50 px-3 py-2 mt-3">
      <p className="text-xs text-gray-500 leading-relaxed">{text}</p>
    </div>
  );
}