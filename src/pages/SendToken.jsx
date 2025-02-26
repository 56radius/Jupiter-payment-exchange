import React, { useState, useEffect } from "react";
import axios from "axios";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useNavigate } from "react-router-dom";

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

                // 🔹 Fetch SOL Balance
                const solBalance = await connection.getBalance(publicKey);
                const solBalanceFormatted = (solBalance / 1e9).toFixed(4);
                let totalUSD = 0;

                let tokenList = [{ mint: "SOL", balance: solBalanceFormatted, symbol: "SOL", usdValue: 0 }];

                // 🔹 Fetch SPL Tokens
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

                // 🔹 Fetch Prices from CoinGecko
                const tokenMints = tokenList.map(t => t.mint).join(",");
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
            <h2 className="text-3xl font-bold text-gray-800">Send Token</h2>

            {/* Wallet Connection */}
            <div className="mt-4">
                <WalletMultiButton />
                {connected ? (
                    <p className="mt-2 text-lg text-green-600">Wallet Connected ✅</p>
                ) : (
                    <p className="mt-2 text-lg text-red-600">Wallet Not Connected ❌</p>
                )}
            </div>

            {/* Wallet Balance */}
            {connected && (
                <>
                    <p className="mt-4 text-lg text-gray-800">SOL Balance: {balance}</p>
                    <p className="mt-2 text-lg font-bold text-blue-600">Total Wallet Value: {walletValue}</p>
                </>
            )}

            {/* Recipient Address */}
            <input
                type="text"
                placeholder="Paste recipient address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="mt-6 px-4 py-2 border rounded-md w-80 text-gray-800"
            />

            {/* Token Selection */}
            <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="mt-4 px-4 py-2 border rounded-md w-80 text-gray-800 bg-white"
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

            {/* Amount Input */}
            <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-4 px-4 py-2 border rounded-md w-80 text-gray-800"
                min="0"
            />

            {/* Send Token Button */}
            <button
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={sendToken}
                disabled={!recipient || !amount || parseFloat(amount) <= 0}
            >
                Send {amount} {selectedToken}
            </button>

            {/* Back Button */}
            <button className="mt-4 text-gray-600 underline" onClick={() => navigate("/")}>
                Go Back
            </button>
        </div>
    );
};

export default SendToken;
