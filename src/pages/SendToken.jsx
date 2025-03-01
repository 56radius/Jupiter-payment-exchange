import React, { useState, useEffect } from "react";
import axios from "axios";
import { useWallet } from "@solana/wallet-adapter-react";
import {
    Connection,
    PublicKey,
    Transaction,
    SystemProgram
} from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Swal from "sweetalert2";
import { Buffer } from "buffer";  // 🔹 Fix for Phantom Mobile

import finalImage from "../assets/images/finally.png"; 

// Ensure Buffer is available in the browser
if (typeof window !== "undefined") {
    window.Buffer = Buffer;
}

const HELIUS_API_KEY = "3b6e8462-9388-41d0-8af9-7b4c838bed44";
const HELIUS_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const connection = new Connection(HELIUS_URL, "confirmed");

const SendToken = () => {
    const { connected, publicKey, sendTransaction } = useWallet();
    const [balance, setBalance] = useState("Loading...");
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");

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

    const sendSolTransaction = async () => {
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

            let transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: recipientPubKey,
                    lamports: amountInLamports,
                })
            );

            const latestBlockhash = await connection.getLatestBlockhash();
            transaction.recentBlockhash = latestBlockhash.blockhash;
            transaction.feePayer = publicKey;

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, "confirmed");

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
                <h2 className="text-3xl font-bold text-center text-blue-400">Send SOL</h2>

                <WalletMultiButton className="mt-6 !bg-gradient-to-r from-purple-500 to-blue-500 !text-white !rounded-lg !py-2 !px-6" />

                <p className="text-gray-400 text-center mt-4">Balance: {balance}</p>

                <input
                    type="text"
                    placeholder="Recipient Address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="mt-6 px-4 py-3 w-full bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-400"
                />

                <input
                    type="number"
                    placeholder="Amount in SOL"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-4 px-4 py-3 w-full bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-400"
                />

                <button
                    className="mt-6 px-6 py-3 bg-green-500 text-white rounded-lg w-full hover:bg-green-600 transition duration-300"
                    onClick={sendSolTransaction}
                >
                    🚀 Send SOL
                </button>
            </div>
        </div>
    );
};

export default SendToken;
