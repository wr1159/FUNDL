import { ethers } from "ethers";
import { MOCK_RECEIVER_ADDRESS } from "@/components/request-network-provider";

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
    paymentLink: string;
    expectedAmount: string;
    receiver: string;
    network: string;
    details: {
        reason: string;
        dueDate?: string;
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
        // Current timestamp in seconds
        const timestamp = Math.floor(Date.now() / 1000);

        // Create a unique request ID based on timestamp, sender, and project
        const requestId = ethers.utils
            .id(`${timestamp}-${senderAddress}-${projectId}`)
            .substring(0, 42);

        // In a real implementation, you'd call the Request Network API here
        // For the mock implementation, we'll create a simulated request
        const paymentRequest: PaymentRequest = {
            requestId,
            paymentLink: `https://sepolia.etherscan.io/address/${MOCK_RECEIVER_ADDRESS}`,
            expectedAmount: ethAmount,
            receiver: MOCK_RECEIVER_ADDRESS,
            network: "sepolia",
            details: {
                reason: `Boost payment for ${projectName} (ID: ${projectId})`,
                dueDate: new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                ).toISOString(), // 24 hours from now
            },
        };

        // Simulate API latency
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return paymentRequest;
    } catch (error) {
        console.error("Error creating payment request:", error);
        throw error;
    }
};

// Function to send ETH payment
export const sendEthPayment = async (
    provider: ethers.providers.Web3Provider,
    receiverAddress: string,
    amount: string,
    reason: string
): Promise<{ transactionHash: string; status: string }> => {
    try {
        const signer = provider.getSigner();

        // Create transaction
        const tx = await signer.sendTransaction({
            to: receiverAddress,
            value: ethers.utils.parseEther(amount),
            // Include payment reason in data field
            data: ethers.utils.toUtf8Bytes(reason),
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
