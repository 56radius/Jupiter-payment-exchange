import React, { useState, useEffect } from "react";
import axios from "axios";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useNavigate } from "react-router-dom";

import final from "../assets/images/finally.png";

const HELIUS_API_KEY = "3b6e8462-9388-41d0-8af9-7b4c838bed44"; // Replace with your API key
const HELIUS_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const connection = new Connection(HELIUS_URL, "confirmed");

const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price";

const SendToken = () => {
    const { connected, publicKey } = useWallet();
    const [tokens, setTokens] = useState([]);
    const [balance, setBalance] = useState("Loading...");
    const [walletValue, setWalletValue] = useState("Loading...");
    const [recipient, setRecipient] = useState("");
    const [selectedToken, setSelectedToken] = useState("");
    const [amount, setAmount] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBalances = async () => {
            if (!connected || !publicKey) {
                setBalance("Wallet Not Connected ❌");
                setTokens([]);
                setWalletValue("N/A");
                return;
            }

            try {
                console.log("Fetching balances for:", publicKey.toBase58());

                const solBalance = await connection.getBalance(publicKey);
                const solBalanceFormatted = (solBalance / 1e9).toFixed(4);
                let totalUSD = 0;

                let tokenList = [{ mint: "SOL", balance: solBalanceFormatted, symbol: "SOL", usdValue: 0 }];

                const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
                    programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
                });

                const splTokens = tokenAccounts.value.map((token) => {
                    const accountData = token.account.data.parsed.info;
                    return {
                        mint: accountData.mint,
                        balance: parseInt(accountData.tokenAmount.amount) / 10 ** accountData.tokenAmount.decimals,
                        symbol: accountData.mint.substring(0, 6) + "...",
                        usdValue: 0
                    };
                });

                tokenList = [...tokenList, ...splTokens];

                const priceResponse = await axios.get(`${COINGECKO_API}?ids=solana&vs_currencies=usd`);
                const solPrice = priceResponse.data.solana.usd;

                tokenList = tokenList.map(token => {
                    if (token.mint === "SOL") {
                        token.usdValue = solPrice * parseFloat(token.balance);
                    }
                    totalUSD += token.usdValue;
                    return token;
                });

                console.log("Tokens found:", tokenList);
                setTokens(tokenList);
                setBalance(`${solBalanceFormatted} SOL`);
                setWalletValue(`$${totalUSD.toFixed(2)} USD`);
                setSelectedToken(tokenList.length > 0 ? tokenList[0].mint : "");

            } catch (error) {
                console.error("Error fetching tokens:", error);
                setBalance("Error fetching balance ❌");
                setTokens([]);
                setWalletValue("Error ❌");
            }
        };

        fetchBalances();
    }, [connected, publicKey]);

    const sendToken = async () => {
        if (!recipient || !selectedToken || !amount) {
            alert("Please fill all fields before sending.");
            return;
        }

        alert(`Sending ${amount} ${selectedToken} to: ${recipient}`);
    };

    return (
        <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{
            backgroundImage: `url(${final})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            width: "100%",
            height: "100vh",
        }}
    > <hw>dchdcjdc</hw>
            <div className="w-full max-w-lg bg-[#1E1E3F] border border-gray-700 rounded-2xl shadow-xl p-6 text-white bg-opacity-90">
                <h2 className="text-3xl font-bold text-center text-blue-400">Send Token</h2>

                <div className="mt-6 flex flex-col items-center">
                    <WalletMultiButton className="!bg-gradient-to-r from-purple-500 to-blue-500 !text-white !rounded-lg !py-2 !px-6" />
                    {connected ? (
                        <p className="mt-2 text-lg text-green-400">✅ Wallet Connected</p>
                    ) : (
                        <p className="mt-2 text-lg text-red-400">❌ Wallet Not Connected</p>
                    )}
                </div>

                {connected && (
                    <div className="mt-4 text-center">
                        <p className="text-lg font-semibold">SOL Balance: <span className="text-yellow-400">{balance}</span></p>
                        <p className="mt-2 text-lg font-bold text-blue-400">Total Wallet Value: {walletValue}</p>
                    </div>
                )}

                <input
                    type="text"
                    placeholder="Recipient Address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="mt-6 px-4 py-3 border border-gray-600 rounded-lg w-full bg-[#2E2E5A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="mt-4 px-4 py-3 border border-gray-600 rounded-lg w-full bg-[#2E2E5A] text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    {tokens.length > 0 ? (
                        tokens.map((token, index) => (
                            <option key={index} value={token.mint}>
                                {token.symbol} ({token.balance})
                            </option>
                        ))
                    ) : (
                        <option disabled>Loading Tokens...</option>
                    )}
                </select>

                <input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-4 px-4 py-3 border border-gray-600 rounded-lg w-full bg-[#2E2E5A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    min="0"
                />

                <button
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg w-full hover:from-green-600 hover:to-blue-600 transition-all duration-200"
                    onClick={sendToken}
                    disabled={!recipient || !amount || parseFloat(amount) <= 0}
                >
                    🚀 Send {amount} {selectedToken}
                </button>

                <button
                    className="mt-4 px-6 py-3 bg-gray-700 text-white rounded-lg w-full hover:bg-gray-800 transition-all duration-200"
                    onClick={() => navigate("/")}
                >
                    🔙 Back to Home
                </button>
            </div>
        </div>
    );
};

export default SendToken;
