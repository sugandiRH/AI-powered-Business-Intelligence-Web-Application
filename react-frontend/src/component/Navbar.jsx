import { useState } from 'react';
import { Menu } from 'lucide-react';
import { X } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Navbar() {
    const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-slate-950/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
                    <div className="flex items-center space-x-1 group cursor-pointer">
                        <div>
                            <img src={logo} 
                                alt="DataTalk Logo" 
                                className="w-6 h-6 sm:w-16 sm:h-16"/>
                        </div>

                        <span className="text-lg sm:text-xl md:text-2xl font-medium">
                            <span className="text-white">Data</span>
                            <span className="text-blue-400">Talk</span>
                        </span>
                    </div>

                    {/* Navigation Links */}
                    <div className=" hidden md:flex items-center space-x-6">
                        <a 
                            href="#productOverview" 
                            className="text-gray-300 hover:text-white text-sm lg:text-base">
                            Product Overview
                        </a>
                        <a 
                            href="#" 
                            className="text-gray-300 hover:text-white text-sm lg:text-base">
                            Features
                        </a>
                        <a 
                            href="#" 
                            className="text-gray-300 hover:text-white text-sm lg:text-base">
                            About
                        </a>
                        <a 
                            href="#" 
                            className="text-gray-300 hover:text-white text-sm lg:text-base">
                            How To
                        </a>
                    </div>

                    <button 
                        className='md:hidden items-center text-gray-300 hover:text-white' 
                        onClick={() => setMobileMenuIsOpen((prev) => !prev)}
                    >
                        {mobileMenuIsOpen ? (
                            <X className='w-5 h-5 sm:w-6 sm:h-6'/>
                        ) : (    
                            <Menu className='w-5 h-5 sm:w-6 sm:h-6'/>
                        )}
                    </button>
                </div>
            </div>
            {/* Mobile Menu */}
            {mobileMenuIsOpen && (
                <div className='md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 slide-in-from-top duration-300'>
                    <div className='px-4 py-4 sm:py-6 space-y-3 sm:space-y-4'>

                        <a 
                            href="#productOverview" 
                            onClick={() => setMobileMenuIsOpen(false)}
                            className="block text-gray-300 hover:text-white text-sm lg:text-base">
                            Product Overview
                        </a>
                        <a 
                            href="#" 
                            onClick={() => setMobileMenuIsOpen(false)}
                            className="block text-gray-300 hover:text-white text-sm lg:text-base">
                            Features
                        </a>
                        <a 
                            href="#" 
                            onClick={() => setMobileMenuIsOpen(false)}
                            className="block text-gray-300 hover:text-white text-sm lg:text-base">
                            About
                        </a>
                        <a 
                            href="#" 
                            onClick={() => setMobileMenuIsOpen(false)}
                            className="blocktext-gray-300 hover:text-white text-sm lg:text-base">
                            How To
                        </a>
                    </div>
                </div>

            )}

        </nav>
    );
}

