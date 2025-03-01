import React, { useState, useEffect } from "react";
import axios from "axios";
import { useWallet } from "@solana/wallet-adapter-react";
import {
    Connection,
    PublicKey,
    Transaction,
    SystemProgram,
    VersionedTransaction
} from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Swal from "sweetalert2";
import { Buffer } from "buffer";  // 🔹 Fix for Phantom Mobile

import finalImage from "../assets/images/finally.png";

// Ensure Buffer is available in the browser
if (typeof window !== "undefined") {
    window.Buffer = Buffer;
}

// 🔹 API Keys
const HELIUS_API_KEY = "3b6e8462-9388-41d0-8af9-7b4c838bed44";
const HELIUS_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd";

const connection = new Connection(HELIUS_URL, "confirmed");

const SendToken = () => {
    const { connected, publicKey, sendTransaction } = useWallet();
    const [balance, setBalance] = useState("Loading...");
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [solPrice, setSolPrice] = useState(null);

    // Fetch SOL Balance
    useEffect(() => {
        const fetchBalance = async () => {
            if (!connected || !publicKey) {
                setBalance("Wallet Not Connected ❌");
                return;
            }
            try {
                const solBalance = await connection.getBalance(publicKey);
                setBalance(`${(solBalance / 1e9).toFixed(4)} SOL`);
            } catch (error) {
                console.error("Error fetching balance:", error);
                setBalance("Error fetching balance ❌");
            }
        };
        fetchBalance();
    }, [connected, publicKey]);

    // Fetch SOL Price from CoinGecko
    useEffect(() => {
        const fetchSOLPrice = async () => {
            try {
                const { data } = await axios.get(COINGECKO_URL);
                setSolPrice(data.solana.usd);
            } catch (error) {
                console.error("Error fetching SOL price:", error);
            }
        };
        fetchSOLPrice();
    }, []);

    // 🔹 Jupiter Swap: Convert SOL to USDC before sending
    const swapAndSendUSDC = async () => {
        if (!recipient || !amount) {
            Swal.fire("Error", "Please enter recipient address and amount.", "error");
            return;
        }

        if (!connected || !publicKey) {
            Swal.fire("Error", "Wallet not connected!", "error");
            return;
        }

        try {
            const recipientPubKey = new PublicKey(recipient);
            const amountInLamports = Math.floor(parseFloat(amount) * 1e9);

            // 🔹 Fetch SOL to USDC conversion quote
            const quoteResponse = await (
                await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112\
&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v\
&amount=${amountInLamports}\
&slippageBps=50`)
            ).json();

            if (!quoteResponse) throw new Error("Failed to get swap quote");

            // 🔹 Show SweetAlert with Conversion Info
            const estimatedUSDC = (quoteResponse.outAmount / 1e6).toFixed(2);
            Swal.fire({
                title: "Swap Details 🔄",
                text: `${amount} SOL ≈ ${estimatedUSDC} USDC`,
                icon: "info",
                confirmButtonText: "Proceed"
            });

            // 🔹 Fetch swap transaction from Jupiter
            const swapResponse = await (
                await fetch("https://quote-api.jup.ag/v6/swap", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        quoteResponse,
                        userPublicKey: publicKey.toString(),
                        wrapAndUnwrapSol: true,
                    }),
                })
            ).json();

            if (!swapResponse.swapTransaction) throw new Error("Failed to get swap transaction");

            // 🔹 Deserialize transaction (Handling Versioned Transactions)
            let transaction;
            const serializedTransaction = Buffer.from(swapResponse.swapTransaction, "base64");

            if (serializedTransaction.length > 0) {
                try {
                    transaction = VersionedTransaction.deserialize(serializedTransaction);
                } catch (error) {
                    transaction = Transaction.from(serializedTransaction);
                }
            }

            // 🔹 Send Transaction
            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, "confirmed");

            // 🔹 Success Alert
            Swal.fire({
                title: "Success 🎉",
                text: `Transaction Confirmed! View on Solscan: https://solscan.io/tx/${signature}`,
                icon: "success",
                confirmButtonText: "OK"
            });

        } catch (error) {
            console.error("Transaction failed:", error);
            Swal.fire("Transaction Failed", error.message, "error");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4"
            style={{
                backgroundImage: `url(${finalImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "100%",
                height: "100vh",
            }}
        >
            <div className="w-full max-w-lg bg-[#1E1E3F] border border-gray-700 rounded-2xl shadow-xl p-6 text-white">
                <h2 className="text-3xl font-bold text-center text-blue-400">Send SOL → USDC</h2>

                <WalletMultiButton className="mt-6 !bg-gradient-to-r from-purple-500 to-blue-500 !text-white !rounded-lg !py-2 !px-6" />

                <p className="text-gray-400 text-center mt-4">Balance: {balance}</p>
                {solPrice && (
                    <p className="text-gray-400 text-center mt-2">
                        1 SOL ≈ ${solPrice.toFixed(2)} USD
                    </p>
                )}

                <div className="mt-6">
                    <label className="text-gray-300 text-sm font-medium">Recipient Address</label>
                    <input
                        type="text"
                        placeholder="Enter recipient address"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="mt-2 px-4 py-3 w-full bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div className="mt-4">
                    <label className="text-gray-300 text-sm font-medium">Amount in SOL</label>
                    <input
                        type="number"
                        placeholder="Enter amount in SOL"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-2 px-4 py-3 w-full bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <button
                    className="mt-6 px-6 py-3 bg-green-500 text-white rounded-lg w-full hover:bg-green-600 transition duration-300"
                    onClick={swapAndSendUSDC}
                >
                    🔄 Swap & Send USDC
                </button>
            </div>
        </div>
    );
};

export default SendToken;
