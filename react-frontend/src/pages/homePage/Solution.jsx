const solutions = [
    {
        title: "Upload Your Business Data",
        description: "Upload your Excel or CSV files in seconds with a simple drag-and-drop interface. The system automatically reads column types, dates, numbers, and categories, so you don’t need technical knowledge. Your raw spreadsheet is instantly prepared and structured, ready for intelligent analysis and visualization.",
        image: "../assets/logo.webp",
        imagePosition: "left",
    },

    {
        title: "AI Understands & Analyzes",
        description: "Our AI engine cleans the data, identifies trends, compares performance over time, and detects unusual patterns automatically. It evaluates relationships between variables and selects the most meaningful insights, turning raw numbers into understandable business information without requiring manual analysis or complex data skills.",
        image: "solution2.png",
        imagePosition: "right",
    },

    {
        title: "Smart Dashboard Generated",
        description: "Within moments, a personalized dashboard is created using the most suitable charts and KPIs. Each visualization includes AI-generated explanations, helping you understand performance changes and key patterns. The dashboard updates dynamically, giving you a clear, interactive view of your business data for faster decisions.",
        image: "solution3.png",
        imagePosition: "left",
    },
]

export default function Solution() {
    return (
        <section 
            id="solutions"
            className="py-16 sm:py-20 px-10 sm:px-6 lg:px-8 relative"
        >
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 sm:mb-16 lg:mb-20">
                    <h2 className="text-5xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                        <span className="bg-linear-to-b from-white to-gray-300 bg-clip-text text-transparent">AI Does the Thinking</span>
                        <br />
                        <span className="text-3xl bg-linear-to-b from-blue-400 to-cyan-400 bg-clip-text text-transparent">We Do the Work</span>
                    </h2>
                </div>
            </div>

            <div className="pt-16 max-w-6xl mx-auto space-y-16 sm:space-y-20 lg:space-y-32">
                {solutions.map((solution, key) => (
                    <div
                        key={key}
                        className={`flex flex-col lg:flex-row items-center gap-8 sm:gap-12 ${
                            solution.imagePosition === "right" ? "lg:flex-row-reverse" : ""
                        }`}>
                        {/* image section */}
                        <div className="flex-1 w-full">
                            <div className="relative group">
                                <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 
                                    rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden hover:shadow-2xl hover:border-blue-600/50
                                    group-hover:border-blue-600/50 transition-all duration-300">
                                    {/* card interface */}
                                    <div className="bg-gray-950 rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm">
                                        <div className="flex items-center sapce-x-1 sm:space-x-2 mb-3 sm:mb-4">
                                            <div className="flex items-center space-x-1 sm:space-x-2">
                                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                                            </div>
                                            <span className="text-gray-400 ml-2 sm:ml-4 text-xs sm:text-sm">{solution.title}</span>
                                        </div>

                                        <div className="w-100 h-50 bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xl border border-white/10">
                                            <img src={solution.image} alt={solution.title} className="w-1/2 h-auto rounded-lg shadow-lg" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* text section */}
                        <div className="flex-2 w-full">
                            <div className="max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                                <h3 className="text-4xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-white">
                                    {solution.title}
                                </h3>
                                <p className="text-gray-300 text-base lg:text-xl sm:text-lg leading-relaxed">
                                    {solution.description}
                                </p>
                            </div>
                        </div>
                    </div>    
                ))}
            </div>
        </section>
    )
}