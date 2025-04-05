"use client";

import React, { useState, useEffect } from "react";
import { useRequestNetwork } from "@/components/request-network-provider";
import {
    createNativePaymentRequest,
    PaymentStatus,
    sendEthPayment,
    checkTransactionStatus,
    PaymentRequest,
} from "@/lib/request-network";
import { RequestNetworkProvider } from "@/components/request-network-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createPublicClient, formatEther, http } from "viem";
import { baseSepolia } from "viem/chains";
import { FundlABI, FundlAddress } from "@/lib/calls";
import { Project } from "../projects/[id]/page";

// Define a SerializedProject type for the data returned by the API
type SerializedProject = [
    tokenAddress: string,
    owner: string,
    name: string,
    description: string,
    imageUrl: string,
    isInProgress: boolean,
    milestones: string,
    currentMilestone: string,
    goalAmount: string,
    raisedAmount: string,
    currentMilestoneStartTime: string,
    timeLastCollected: string,
    amountCollectedForMilestone: string
];

// Helper to convert serialized project to project type with proper BigInt values
function deserializeProject(serializedProject: SerializedProject): Project {
    return [
        serializedProject[0] as `0x${string}`,
        serializedProject[1] as `0x${string}`,
        serializedProject[2],
        serializedProject[3],
        serializedProject[4],
        serializedProject[5],
        BigInt(serializedProject[6]),
        BigInt(serializedProject[7]),
        BigInt(serializedProject[8]),
        BigInt(serializedProject[9]),
        BigInt(serializedProject[10]),
        BigInt(serializedProject[11]),
        BigInt(serializedProject[12]),
    ] as Project;
}

// Neobrutalism styled components
const TransactionInfo = ({
    label,
    value,
}: {
    label: string;
    value: string;
}) => (
    <div className="flex flex-col mb-2">
        <span className="text-sm font-bold">{label}</span>
        <span className="overflow-hidden text-xs text-gray-700 text-ellipsis">
            {value}
        </span>
    </div>
);

// Project card component with Project type from [id]/page.tsx
const ProjectCard = ({ project }: { project: Project; id: number }) => {
    // Calculate funding progress percentage
    const progressPercentage =
        project[9] > BigInt(0) && project[8] > BigInt(0)
            ? Math.min(Number((project[9] * BigInt(100)) / project[8]), 100)
            : 0;

    return (
        <div className="flex-1 mb-4">
            <Card>
                <div className="flex flex-col">
                    {project[4] ? (
                        <img
                            src={project[4]}
                            alt={project[2]}
                            className="object-cover w-full mb-3 border-2 border-black rounded-md h-36"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-36 mb-3 border-2 border-black rounded-md bg-blue-100 text-black font-bold">
                            No Image
                        </div>
                    )}
                    <h3 className="mb-2 text-lg font-bold">{project[2]}</h3>
                    <p className="text-sm text-gray-700 line-clamp-2">
                        {project[3]}
                    </p>

                    {/* Milestones */}
                    <div className="mt-2 mb-2 text-sm">
                        <span className="font-bold">Milestones: </span>
                        <span className="inline-block bg-black text-white px-2 py-1 rounded">
                            {Number(project[7])} / {Number(project[6])}
                        </span>
                    </div>

                    {/* Funding Progress */}
                    <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-bold">
                                Progress: {progressPercentage}%
                            </span>
                            <span>
                                {formatEther(project[9])} /{" "}
                                {formatEther(project[8])} ETH
                            </span>
                        </div>
                        <div className="h-4 w-full border-2 border-black bg-white relative">
                            <div
                                className="absolute top-0 left-0 h-full bg-green-500"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

// Main page component
const BoostProjectPage = () => {
    const [selectedProject, setSelectedProject] = useState<string>("");
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(
        null
    );
    const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
        null
    );
    const [transactionDetails, setTransactionDetails] = useState<{
        transactionHash?: string;
    }>({});
    const [error, setError] = useState<string | null>(null);
    const [projects, setProjects] = useState<Array<Project | null>>([]);
    const [loading, setLoading] = useState(true);
    const [projectCount, setProjectCount] = useState<number>(0);

    const {
        account,
        isConnected,
        connectWallet,
        disconnectWallet,
        provider,
        ethPrice,
        getEthFromUsd,
    } = useRequestNetwork();

    // Create a public client to interact with the blockchain
    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(),
    });

    // Fixed USD amount for boost
    const boostPriceUsd = 10;
    // Get ETH equivalent of 10 USD
    const ethAmount = getEthFromUsd(boostPriceUsd);

    // Fetch project counter
    useEffect(() => {
        async function fetchProjectCount() {
            setLoading(true);
            try {
                const count = await publicClient.readContract({
                    address: FundlAddress as `0x${string}`,
                    abi: FundlABI,
                    functionName: "projectIdCounter",
                });
                setProjectCount(count as number);
            } catch (error) {
                console.error("Error fetching project count:", error);
                setError("Failed to load project count from contract");
            }
        }
        fetchProjectCount();
    }, []);

    // Fetch all projects
    useEffect(() => {
        async function fetchProjects() {
            if (projectCount === 0) return;

            try {
                const count = Number(projectCount);
                const projectsArray: Array<Project | null> = [];

                // Create array of projects to fetch
                for (let i = 0; i < count; i++) {
                    projectsArray.push(null); // Initialize with placeholders
                }

                setProjects(projectsArray);

                // Fetch each project
                for (let i = 0; i < count; i++) {
                    try {
                        const serializedProject =
                            await publicClient.readContract({
                                address: FundlAddress as `0x${string}`,
                                abi: FundlABI,
                                functionName: "projects",
                                args: [BigInt(i)],
                            });
                        const project = deserializeProject(
                            serializedProject as SerializedProject
                        );

                        setProjects((prev) => {
                            const updated = [...prev];
                            updated[i] = project;
                            return updated;
                        });
                    } catch (err) {
                        console.error(`Error fetching project ${i}:`, err);
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching projects:", err);
                setError("Failed to load projects from contract");
                setLoading(false);
            }
        }

        fetchProjects();
    }, [projectCount]);

    // Handle project selection
    const handleProjectSelect = (projectId: string) => {
        setSelectedProject(projectId);
        setError(null);
    };

    // Create payment request
    const handleCreatePaymentRequest = async () => {
        if (!isConnected || !provider || !account || !selectedProject) return;

        try {
            setError(null);
            setPaymentStatus(PaymentStatus.CREATING);

            // Find selected project
            const projectId = parseInt(selectedProject);
            const selectedProjectData = projects[projectId];

            if (!selectedProjectData) {
                throw new Error("Selected project not found");
            }

            // Create payment request using Request Network API
            const request = await createNativePaymentRequest(
                ethAmount,
                account,
                selectedProject,
                selectedProjectData[2] // Project name
            );

            setPaymentRequest(request);
            setPaymentStatus(PaymentStatus.AWAITING_PAYMENT);
        } catch (error) {
            console.error("Payment request error:", error);
            setPaymentStatus(PaymentStatus.ERROR);
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create payment request"
            );
        }
    };

    // Send ETH payment
    const handleSendPayment = async () => {
        if (!isConnected || !provider || !account || !paymentRequest) return;

        try {
            setError(null);
            setPaymentStatus(PaymentStatus.PROCESSING);

            // Send ETH payment using the payment reference from Request Network
            const { transactionHash } = await sendEthPayment(
                provider,
                paymentRequest.paymentReference
            );

            setTransactionDetails({
                transactionHash,
            });

            // Check transaction status
            const isSuccess = await checkTransactionStatus(
                provider,
                transactionHash
            );

            // Set success status
            setPaymentStatus(
                isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.ERROR
            );
        } catch (error) {
            console.error("Payment error:", error);
            setPaymentStatus(PaymentStatus.ERROR);
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to process payment"
            );
        }
    };

    // Get status color based on payment status
    const getStatusColor = () => {
        switch (paymentStatus) {
            case PaymentStatus.CREATING:
                return "blue";
            case PaymentStatus.AWAITING_PAYMENT:
                return "yellow";
            case PaymentStatus.PROCESSING:
                return "purple";
            case PaymentStatus.SUCCESS:
                return "green";
            case PaymentStatus.ERROR:
                return "red";
            default:
                return "blue";
        }
    };

    // Prepare select options for projects
    const projectOptions = projects
        .map((project, index) =>
            project ? { value: index.toString(), label: project[2] } : null
        )
        .filter((option) => option !== null);

    // Loading state
    if (loading) {
        return (
            <main className="min-h-screen p-6 bg-bg">
                <Card className="max-w-4xl mx-auto my-8 p-8">
                    <h1 className="mb-8 text-4xl font-extrabold text-center">
                        Boost Project 🚀
                    </h1>
                    <div className="flex flex-col items-center">
                        <p className="mb-4 font-bold">
                            Loading projects from the blockchain...
                        </p>
                        <div className="w-full h-8 bg-white border-4 border-black relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-full bg-blue-400 animate-pulse w-1/2"></div>
                        </div>
                    </div>
                </Card>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-6 bg-bg">
            <Card className="max-w-4xl mx-auto my-8">
                <div className="flex flex-col p-8">
                    <h1 className="mb-8 text-4xl font-extrabold text-center">
                        Boost Project 🚀
                    </h1>

                    {/* Wallet Connection Section */}
                    <div className="p-4 mb-8 border-4 border-black rounded-lg bg-bg">
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                            <div>
                                <h2 className="font-bold">Wallet</h2>
                                {isConnected && account ? (
                                    <p className="text-sm">
                                        Connected: {account.slice(0, 6)}...
                                        {account.slice(-4)}
                                    </p>
                                ) : (
                                    <p className="text-sm">Not connected</p>
                                )}
                            </div>

                            <Button
                                onClick={
                                    isConnected
                                        ? disconnectWallet
                                        : connectWallet
                                }
                                size="lg"
                                className={isConnected ? "bg-red-500" : ""}
                            >
                                {isConnected ? "Disconnect" : "Connect Wallet"}
                            </Button>
                        </div>
                    </div>

                    {/* Project Selection */}
                    <div className="mb-8">
                        <h2 className="mb-4 text-xl font-bold">
                            Select Project to Boost
                        </h2>

                        {projects.length > 0 ? (
                            <>
                                <div className="grid gap-8 md:grid-cols-2">
                                    {projects.map((project, index) =>
                                        project ? (
                                            <div
                                                key={index}
                                                onClick={() =>
                                                    handleProjectSelect(
                                                        index.toString()
                                                    )
                                                }
                                                className={`cursor-pointer transition-transform ${
                                                    selectedProject ===
                                                    index.toString()
                                                        ? "scale-105 rounded-lg"
                                                        : ""
                                                }`}
                                            >
                                                <ProjectCard
                                                    project={project}
                                                    id={index}
                                                />
                                            </div>
                                        ) : null
                                    )}
                                </div>

                                <div className="mt-8">
                                    <h3 className="mb-4 text-lg font-bold">
                                        Selected Project
                                    </h3>
                                    <Select
                                        options={projectOptions}
                                        value={selectedProject}
                                        onChange={handleProjectSelect}
                                        placeholder="Choose a project"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="p-6 border-4 border-black rounded-lg bg-yellow-50">
                                <p className="text-center font-bold">
                                    No projects found in the contract.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Payment Section */}
                    <div className="p-6 mb-8 border-4 border-black rounded-lg bg-green-100">
                        <h2 className="mb-4 text-xl font-bold">
                            Boost Payment
                        </h2>
                        <div className="flex flex-col items-center justify-between gap-4 mb-4">
                            <div className="w-full text-center">
                                <p className="mb-3 text-2xl font-bold">
                                    ${boostPriceUsd} USD
                                </p>
                                <p className="text-lg font-bold text-green-700">
                                    {ethAmount} ETH
                                </p>
                                {ethPrice && (
                                    <p className="mt-1 text-xs text-gray-600">
                                        Current ETH rate: ${ethPrice} USD
                                    </p>
                                )}
                                <p className="mt-3 text-sm text-gray-700">
                                    Fixed amount to boost project
                                </p>
                            </div>

                            {!paymentRequest ? (
                                <Button
                                    onClick={handleCreatePaymentRequest}
                                    size="lg"
                                    className="w-full"
                                    disabled={
                                        !isConnected ||
                                        !selectedProject ||
                                        paymentStatus === PaymentStatus.CREATING
                                    }
                                >
                                    {paymentStatus === PaymentStatus.CREATING
                                        ? "Creating Request..."
                                        : "Create Payment Request"}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSendPayment}
                                    size="lg"
                                    className="w-full"
                                    disabled={
                                        !isConnected ||
                                        !selectedProject ||
                                        paymentStatus ===
                                            PaymentStatus.PROCESSING
                                    }
                                >
                                    {paymentStatus === PaymentStatus.PROCESSING
                                        ? "Processing..."
                                        : "Send Payment"}
                                </Button>
                            )}
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="p-3 mb-4 border-2 border-red-500 rounded-md bg-red-100">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Payment Status */}
                        {paymentStatus && (
                            <div className="p-4 mt-4 border-2 border-black rounded-lg bg-yellow-50">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold">
                                        Payment Status
                                    </h3>
                                    <Badge color={getStatusColor()}>
                                        {paymentStatus}
                                    </Badge>
                                </div>

                                {paymentRequest && (
                                    <>
                                        <TransactionInfo
                                            label="Request ID"
                                            value={paymentRequest.requestId}
                                        />
                                        <TransactionInfo
                                            label="Payment Reference"
                                            value={
                                                paymentRequest.paymentReference
                                            }
                                        />
                                        <TransactionInfo
                                            label="Receiver"
                                            value={paymentRequest.receiver}
                                        />
                                        <TransactionInfo
                                            label="Amount"
                                            value={`${paymentRequest.expectedAmount} ETH`}
                                        />
                                    </>
                                )}

                                {transactionDetails.transactionHash && (
                                    <div className="mt-4">
                                        <TransactionInfo
                                            label="Transaction Hash"
                                            value={
                                                transactionDetails.transactionHash
                                            }
                                        />
                                        <a
                                            href={`https://sepolia.etherscan.io/tx/${transactionDetails.transactionHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block px-3 py-1 mt-2 text-sm font-bold text-blue-600 bg-blue-100 border-2 border-blue-500 rounded-md hover:bg-blue-200"
                                        >
                                            View on Etherscan
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Information */}
                    <div className="p-4 mt-4 border-2 border-black rounded-lg bg-blue-50">
                        <h3 className="mb-2 font-bold">
                            About Project Boosting
                        </h3>
                        <p className="text-sm">
                            Boosting a project helps it gain visibility and
                            support. The ${boostPriceUsd} fee (paid in ETH) is
                            used to promote the project to potential investors
                            and supporters. Payments are processed on the
                            Sepolia testnet via Request Network.
                        </p>
                    </div>
                </div>
            </Card>
        </main>
    );
};

// Wrap with provider
export default function BoostProjectPageWithProvider() {
    return (
        <RequestNetworkProvider>
            <BoostProjectPage />
        </RequestNetworkProvider>
    );
}
