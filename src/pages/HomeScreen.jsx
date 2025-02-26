import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react"; 
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"; 
import jupiter from "../assets/images/jupiterframework.jpg";

const Home = () => {
    const [expanded, setExpanded] = useState(false);
    const { connected } = useWallet(); 

    return (
        <div className="">
            <header className="py-4 md:py-6">
                <div className="container px-4 mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h2> JUP Exh </h2>

                        {/* Mobile Menu Toggle */}
                        <button 
                            type="button" 
                            className="text-gray-900 lg:hidden" 
                            onClick={() => setExpanded(!expanded)} 
                            aria-expanded={expanded}
                        >
                            {!expanded ? (
                                <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>

                       
                        {/* Wallet Connect Button */}
                        <div className="hidden lg:flex lg:ml-auto">
                            <WalletMultiButton />
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-12 bg-gray-50 sm:pt-16 text-center">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <h1 className="text-lg text-gray-600">The Future of Global Payments</h1>
                    <p className="mt-5 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
                        Fast, Secure, and Reliable  
                        <span className="relative inline-flex">
                            <span className="bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] blur-lg opacity-30 absolute inset-0"></span>
                            <span className="relative"> Payment Exchange </span>
                        </span>
                    </p>

                    {/* Connect Wallet Section */}
                    <div className="mt-9">
                        <WalletMultiButton />
                        {connected ? (
                            <p className="mt-4 text-green-600">Wallet Connected ✅</p>
                        ) : (
                            <p className="mt-4 text-red-600">Wallet Not Connected ❌</p>
                        )}
                    </div>

                    {/* Send Token Button (Opens in New Tab) */}
                    {connected && (
                        <button 
                            onClick={() => window.open("/send-token", "_blank")} 
                            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Send Token
                        </button>
                    )}
                </div>

                {/* Image Section */}
                <div className="pb-12 bg-white flex justify-center">
                    <img className="w-[900px] mt-12 scale-110" src={jupiter} alt="Jupiter Payment Exchange" />
                </div>
            </section>
        </div>
    );
};

export default Home;
