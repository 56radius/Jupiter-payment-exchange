import React, { useState, useEffect } from "react";
import axios from "axios";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Swal from "sweetalert2";

import finalImage from "../assets/images/finally.png"; // Ensure correct path

const HELIUS_API_KEY = "3b6e8462-9388-41d0-8af9-7b4c838bed44"; // Replace with your actual key
const HELIUS_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price";

const connection = new Connection(HELIUS_URL, "confirmed");

const SendToken = () => {
    const { connected, publicKey, sendTransaction } = useWallet();
    const [tokens, setTokens] = useState([]);
    const [balance, setBalance] = useState("Loading...");
    const [walletValue, setWalletValue] = useState("Loading...");
    const [recipient, setRecipient] = useState("");
    const [selectedToken, setSelectedToken] = useState(null);
    const [amount, setAmount] = useState("");

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

                // Fetch token accounts
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

                // Fetch SOL price from CoinGecko
                const priceResponse = await axios.get(`${COINGECKO_API}?ids=solana&vs_currencies=usd`);
                const solPrice = priceResponse.data?.solana?.usd || 0;

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
                setSelectedToken(tokenList[0]);

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
            Swal.fire("Error", "Please fill all fields before sending.", "error");
            return;
        }

        if (parseFloat(amount) > parseFloat(selectedToken.balance)) {
            Swal.fire("Error", "Insufficient balance!", "error");
            return;
        }

        try {
            const recipientPubKey = new PublicKey(recipient);
            const amountInLamports = Math.floor(parseFloat(amount) * 1e9); // Convert SOL to lamports

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: recipientPubKey,
                    lamports: amountInLamports,
                })
            );

            const latestBlockHash = await connection.getLatestBlockhash();
            transaction.recentBlockhash = latestBlockHash.blockhash;
            transaction.feePayer = publicKey;

            // Sign and send the transaction
            const signature = await sendTransaction(transaction, connection);

            // Wait for confirmation
            await connection.confirmTransaction({
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature,
            });

            console.log(`Transaction successful: https://solscan.io/tx/${signature}`);

            Swal.fire({
                title: "Success 🎉",
                text: `Transaction Confirmed! View on Solscan: https://solscan.io/tx/${signature}`,
                icon: "success",
                confirmButtonText: "OK"
            });

        } catch (error) {
            console.error("Transaction failed:", error);
            Swal.fire("Transaction Failed", "Check console for details.", "error");
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-4"
            style={{
                backgroundImage: `url(${finalImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                width: "100%",
                height: "100vh",
            }}
        >
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

                <input type="text" placeholder="Recipient Address" value={recipient} onChange={(e) => setRecipient(e.target.value)}
                    className="mt-6 px-4 py-3 border border-gray-600 rounded-lg w-full bg-[#2E2E5A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400" />

                <select className="mt-4 px-4 py-3 border border-gray-600 rounded-lg w-full bg-[#2E2E5A] text-white" 
                    value={selectedToken?.mint} 
                    onChange={(e) => setSelectedToken(tokens.find(t => t.mint === e.target.value))}>
                    {tokens.map(token => (
                        <option key={token.mint} value={token.mint}>{token.symbol} ({token.balance})</option>
                    ))}
                </select>

                <input type="number" placeholder={`Enter ${selectedToken?.symbol || "SOL"} amount`} value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="mt-4 px-4 py-3 border border-gray-600 rounded-lg w-full bg-[#2E2E5A]" min="0" />

                <button className="mt-6 px-6 py-3 bg-green-500 text-white rounded-lg w-full" onClick={sendToken}>
                    🚀 Send {amount} {selectedToken?.symbol}
                </button>
            </div>
        </div>
    );
};

export default SendToken;
