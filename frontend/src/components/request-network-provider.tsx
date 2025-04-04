"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { providers, ethers } from "ethers";

// Request Network Configuration
export const MOCK_RECEIVER_ADDRESS =
    "0x1234567890123456789012345678901234567890";
export const REQUEST_API_URL = "https://api.request.network/currency";

// Create Request Network Provider
export const RequestNetworkProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [provider, setProvider] = useState<providers.Web3Provider | null>(
        null
    );
    const [account, setAccount] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [ethPrice, setEthPrice] = useState<number | null>(null);

    // Fetch ETH price
    useEffect(() => {
        const fetchEthPrice = async () => {
            try {
                const response = await fetch(
                    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
                );
                const data = await response.json();
                setEthPrice(data.ethereum.usd);
            } catch (error) {
                console.error("Error fetching ETH price:", error);
                // Fallback price if API fails
                setEthPrice(3500);
            }
        };

        fetchEthPrice();
    }, []);

    // Connect wallet
    const connectWallet = async () => {
        try {
            // Check if window.ethereum is available (MetaMask or other wallet)
            if (window.ethereum) {
                const ethersProvider = new ethers.providers.Web3Provider(
                    window.ethereum
                );
                const accounts = await ethersProvider.send(
                    "eth_requestAccounts",
                    []
                );

                if (accounts.length > 0) {
                    setProvider(ethersProvider);
                    setAccount(accounts[0]);
                    setIsConnected(true);
                }
            } else {
                alert("Please install MetaMask or another Ethereum wallet");
            }
        } catch (error) {
            console.error("Error connecting wallet:", error);
        }
    };

    // Disconnect wallet
    const disconnectWallet = async () => {
        try {
            setProvider(null);
            setAccount(null);
            setIsConnected(false);
        } catch (error) {
            console.error("Error disconnecting wallet:", error);
        }
    };

    // Calculate ETH amount from USD
    const getEthFromUsd = (usdAmount: number): string => {
        if (!ethPrice) return "0";
        const ethAmount = usdAmount / ethPrice;
        return ethAmount.toFixed(6);
    };

    // Handle account changes
    useEffect(() => {
        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length > 0) {
                if (window.ethereum) {
                    const ethersProvider = new ethers.providers.Web3Provider(
                        window.ethereum
                    );
                    setProvider(ethersProvider);
                    setAccount(accounts[0]);
                    setIsConnected(true);
                }
            } else {
                setProvider(null);
                setAccount(null);
                setIsConnected(false);
            }
        };

        const handleChainChanged = () => {
            window.location.reload();
        };

        if (window.ethereum) {
            window.ethereum.on("accountsChanged", handleAccountsChanged);
            window.ethereum.on("chainChanged", handleChainChanged);
        }

        return () => {
            if (window.ethereum && window.ethereum.removeListener) {
                window.ethereum.removeListener(
                    "accountsChanged",
                    handleAccountsChanged
                );
                window.ethereum.removeListener(
                    "chainChanged",
                    handleChainChanged
                );
            }
        };
    }, []);

    return (
        <RequestNetworkContext.Provider
            value={{
                provider,
                account,
                isConnected,
                connectWallet,
                disconnectWallet,
                ethPrice,
                getEthFromUsd,
            }}
        >
            {children}
        </RequestNetworkContext.Provider>
    );
};

// Create context
interface RequestNetworkContextType {
    provider: providers.Web3Provider | null;
    account: string | null;
    isConnected: boolean;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => Promise<void>;
    ethPrice: number | null;
    getEthFromUsd: (usdAmount: number) => string;
}

export const RequestNetworkContext =
    React.createContext<RequestNetworkContextType>({
        provider: null,
        account: null,
        isConnected: false,
        connectWallet: async () => {},
        disconnectWallet: async () => {},
        ethPrice: null,
        getEthFromUsd: () => "0",
    });

// Hook for easy access to the context
export const useRequestNetwork = () => React.useContext(RequestNetworkContext);

// Add TypeScript window declarations
declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ethereum: any; // Needed for browser ethereum provider
    }
}
