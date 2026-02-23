import { Link } from "react-router-dom";

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-16 sm:pt-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="max-w-7xl mx-auto text-center relative w-full">
                <div className="max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-2 text-center lg:text-left gap-6 sm:gap-8 lg:gap-12 items-center relative">

                    <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
                            <span className="text-white">Data</span>
                            <span className="text-blue-400">Talk</span>
                        </h1>
                        <p className="text-shadow-md sm:text-xl text-gray-300 max-w-lg mx-auto mb-8">
                            Transform your data into actionable insights with our AI-powered business intelligence platform.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
                            <Link to="/login" >
                                <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-300">
                                    Get Started
                                </button>
                            </Link>

                            <Link to="/how-to-use">
                                <button className="p-2 bg-white/10 hover:bg-white/20 font-semibold py-2 px-6 rounded-lg transition duration-300 ">
                                    How To Use
                                </button>
                            </Link>
                        </div>
        
                    </div>

                    <div className="relative order-2 w-full">
                        <div className="relative bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xl border border-white/10">
                            <div className="bg-linear-to-tr from-gray-900/20 to-gray-800/20 backdrop-blur-sm rounded-lg overflow-hidden h-70 lg:h-112.5 border border-white/5">
                                {/* IDE header */}
                                <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-white/5 backdrop-blur-sm border-b border-white/10">
                                    <div className="flex items-center space-x-2 ">
                                        <div className="flex items-center space-x-1 sm:space-x-2">
                                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                                        </div>
                                        <span className="text-xs sm:text-sm text-gray-300">DataTalk BI</span>
                                    </div>    
                                </div>
                            </div>

                            {/* card */}
                            <div className="hidden lg:block absolute bottom-4 right-4 transform translate-x-8 translate-y-8 w-72 bg-blue-500/20 backdrop-blur-xl rounded-lg p-4 shadow-2xl">
                                <div className="flex items-center space-x-2 mb-2">
                                    <div>
                                        <h6 className="text-white text-sm sm:text-base">DataTalk BI</h6>
                                        <p className="text-gray-400 text-xs sm:text-sm">AI-Powered Business Intelligence Platform</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
}