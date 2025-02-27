import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react"; 
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"; 
import jupiter from "../assets/images/jupiterframework.jpg";
import final from "../assets/images/finally.png"; // Replace with your actual background image path

const Home = () => {
    const [expanded, setExpanded] = useState(false);
    const { connected } = useWallet(); 

    return (
        <div 
            className="bg-[#0B0F19] text-white min-h-screen"
            style={{
                backgroundImage: `url(${final})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <header className="py-4 md:py-6 bg-[#141A27] bg-opacity-90 shadow-md">
                <div className="container px-4 mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-[#70E1E7]"> JUP Exh </h2>

                        {/* Mobile Menu Toggle */}
                        <button 
                            type="button" 
                            className="text-[#70E1E7] lg:hidden" 
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
            <section className="pt-12 text-center">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <h1 className="text-lg text-[#70E1E7]">The Future of Global Payments</h1>
                    <p className="mt-5 text-4xl font-bold sm:text-5xl lg:text-6xl">
                        Fast, Secure, and Reliable  
                        <span className="relative inline-flex">
                            <span className="bg-gradient-to-r from-[#7733FF] via-[#33D7FF] to-[#00FFA3] blur-lg opacity-40 absolute inset-0"></span>
                            <span className="relative text-[#00FFA3]"> Payment Exchange </span>
                        </span>
                    </p>

                    {/* Connect Wallet Section */}
                    <div className="mt-9">
                        <WalletMultiButton />
                        {connected ? (
                            <p className="mt-4 text-[#00FFA3]">Wallet Connected ✅</p>
                        ) : (
                            <p className="mt-4 text-red-400">Wallet Not Connected ❌</p>
                        )}
                    </div>

                    {/* Send Token Button (Opens in New Tab) */}
                    {connected && (
                        <button 
                            onClick={() => window.open("/send-token", "_blank")} 
                            className="mt-6 px-6 py-3 bg-[#7733FF] text-white rounded-md hover:bg-[#5A27D9] transition duration-300"
                        >
                            Send Token
                        </button>
                    )}
                </div>

                {/* Image Section */}
                <div className="pb-12 flex justify-center">
                    <img className="w-[900px] mt-12 scale-110" src={jupiter} alt="Jupiter Payment Exchange" />
                </div>
            </section>
        </div>
    );
};

export default Home;
