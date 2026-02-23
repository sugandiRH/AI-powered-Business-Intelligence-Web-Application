import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    name: "Smart Insights in Seconds",
    description: "Our AI scans your data to detect trends, patterns, and unusual changes automatically. Instead of manually searching through spreadsheets, you instantly receive clear summaries such as sales growth, performance drops, and key business changes.",
    features: [
      "Detect trends, patterns, and anomalies",
      "Get instant data summaries",
      "Understand performance changes quickly",
    ],
    mostPopular: false,
  },
  {
    name: "Ask Questions Like You Talk",
    description: "No SQL or technical commands needed. Simply type questions like “Why did sales drop last month?” or “Show top products by revenue”. The system understands your language, analyzes the data, and shows the answer visually.",
    features: [
      "Ask questions in plain English",
      "AI converts your words into data queries",
      "Get answers with charts and explanations",
    ],
    mostPopular: true,
  },
  {
    name: "Dashboards Built for You",
    description: "After uploading your data, the system automatically creates a personalized dashboard. AI selects the most suitable chart types and organizes them into a clear, easy-to-understand layout based on your business data.",
    features: [
      "AI chooses the best visualizations",
      "Personalized dashboard layout",
      "No manual report building",
    ],
    mostPopular: false,
  },
];

export default function Feature() {
  return (
    <section
      id="features"
      className="py-16 sm:py-20 px-10 sm:px-6 lg:px-8 relative"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-5xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            <span className="bg-linear-to-b from-white to-gray-300 bg-clip-text text-transparent">
              AI That Understands
            </span>
            <br />
            <span className="bg-linear-to-b from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Your Business Data
            </span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Our intelligent BI engine analyzes your data, explains insights in simple language, and builds dashboards automatically — no technical skills required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-6">
          {features.map((feature, key) => (
            <div
              key={key}
              className={`relative bg-slate-900/50 backdrop-blur-sm border rounded-xl sm:rounded-2xl p-6 sm:p-8 transition-all duration-300 overflow-visible group flex flex-col h-full ${
                feature.mostPopular
                  ? "border-blue-500 shadow-2xl shadow-blue-500/20 lg:scale-105"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full -translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 pointer-events-none rounded-lg" />
              {feature.mostPopular && (
                <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="flex items-center space-x-1 px-3 sm:px-4 py-1 sm:py-1.5 bg-linear-to-b from-blue-500 to-cyan-500 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                    <Star className="w-3 h-3 sm:w-3 sm:h-3 fill-white" />
                    <span>Specially</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
                  {feature.description}
                </p>
                
              </div>

              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-row">
                {feature.features.map((feature, featureKey) => (
                  <li
                    key={featureKey}
                    className="flex items-start space-x-2 sm:space-x-3"
                  >
                    <div className="shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" />
                    </div>
                    <span className="text-gray-300 text-sm sm:text-base">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-gray-400 text-base lg:text-xl mb-6">
            Built to make business intelligence simple, fast, and accessible for everyone.
          </p>

          <Link to="/features">
            <button className="w-50 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-300 mt-auto hover:scale-102 cursor-pointer text-sm sm:text-base bg-white/5 border border-white/10 hover:bg-white/10">
              Explore More
            </button>
          </Link>
          
        </div>
      </div>
    </section>
  );
}