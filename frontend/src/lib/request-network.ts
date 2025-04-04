import { ethers } from "ethers";
import { RECEIVER_ADDRESS } from "@/components/request-network-provider";

// API key for Request Network
const REQUEST_API_KEY = "rn_v1_unkhhb3ayrxr6xc6xm2bo6wjmgrefxcq";

// Interface for project data
export interface Project {
    id: string;
    name: string;
    description: string;
    image: string;
}

// Mock projects data
export const mockProjects: Project[] = [
    {
        id: "1",
        name: "Project Alpha",
        description: "Decentralized marketplace for digital assets",
        image: "https://picsum.photos/id/1/200/200",
    },
    {
        id: "2",
        name: "Project Beta",
        description: "Smart contract automation platform",
        image: "https://picsum.photos/id/2/200/200",
    },
    {
        id: "3",
        name: "Project Gamma",
        description: "DeFi lending protocol with yield optimization",
        image: "https://picsum.photos/id/3/200/200",
    },
    {
        id: "4",
        name: "Project Delta",
        description: "Cross-chain bridge for digital assets",
        image: "https://picsum.photos/id/4/200/200",
    },
];

// Payment status enum
export enum PaymentStatus {
    CREATING = "Creating Request",
    AWAITING_PAYMENT = "Awaiting Payment",
    PROCESSING = "Payment Processing",
    SUCCESS = "Success",
    ERROR = "Error",
}

// Interface for payment request
export interface PaymentRequest {
    requestId: string;
    paymentReference: string;
    expectedAmount: string;
    receiver: string;
    network: string;
    details: {
        reason: string;
        dueDate?: string;
    };
}

// Interface for payment transaction data
export interface PaymentTransactionData {
    transactions: {
        data: string;
        to: string;
        value: {
            type: string;
            hex: string;
        };
    }[];
    metadata: {
        stepsRequired: number;
        needsApproval: boolean;
        approvalTransactionIndex: number | null;
    };
}

// Function to create a payment request via Request Network API
export const createNativePaymentRequest = async (
    ethAmount: string,
    senderAddress: string,
    projectId: string,
    projectName: string
): Promise<PaymentRequest> => {
    try {
        // Call the Request Network API to create a payment request
        const response = await fetch("https://api.request.network/v1/request", {
            method: "POST",
            headers: {
                "x-api-key": REQUEST_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                payer: senderAddress,
                payee: RECEIVER_ADDRESS,
                amount: "10",
                invoiceCurrency: "USD",
                paymentCurrency: "ETH-sepolia-sepolia",
                reason: `Boost payment for ${projectName} (ID: ${projectId})`,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();

        // Create a payment request from API response
        const paymentRequest: PaymentRequest = {
            requestId: data.requestId,
            paymentReference: data.paymentReference,
            expectedAmount: ethAmount,
            receiver: RECEIVER_ADDRESS,
            network: "sepolia",
            details: {
                reason: `Boost payment for ${projectName} (ID: ${projectId})`,
                dueDate: new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                ).toISOString(), // 24 hours from now
            },
        };

        return paymentRequest;
    } catch (error) {
        console.error("Error creating payment request:", error);
        throw error;
    }
};

// Function to get payment data from Request Network
export const getPaymentData = async (
    paymentReference: string
): Promise<PaymentTransactionData> => {
    try {
        const response = await fetch(
            `https://api.request.network/v1/request/${paymentReference}/pay`,
            {
                method: "GET",
                headers: {
                    "x-api-key": REQUEST_API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        return data as PaymentTransactionData;
    } catch (error) {
        console.error("Error getting payment data:", error);
        throw error;
    }
};

// Function to send ETH payment
export const sendEthPayment = async (
    provider: ethers.providers.Web3Provider,
    paymentReference: string
): Promise<{ transactionHash: string; status: string }> => {
    try {
        const signer = provider.getSigner();

        // Get payment data from Request Network API
        const paymentData = await getPaymentData(paymentReference);

        // For native currency payments, we use the first transaction
        const txData = paymentData.transactions[0];

        // Create transaction using the data from the API
        const tx = await signer.sendTransaction({
            to: txData.to,
            value: txData.value.hex,
            data: txData.data,
        });

        // Wait for transaction confirmation
        const receipt = await tx.wait();

        return {
            transactionHash: receipt.transactionHash,
            status: receipt.status === 1 ? "success" : "failed",
        };
    } catch (error) {
        console.error("Error sending ETH payment:", error);
        throw error;
    }
};

// Function to check ETH transaction status
export const checkTransactionStatus = async (
    provider: ethers.providers.Web3Provider,
    transactionHash: string
): Promise<boolean> => {
    try {
        const receipt = await provider.getTransactionReceipt(transactionHash);
        return receipt?.status === 1;
    } catch (error) {
        console.error("Error checking transaction status:", error);
        return false;
    }
};
