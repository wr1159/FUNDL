"use client";

import React, { useState } from "react";
import { useRequestNetwork } from "@/components/request-network-provider";
import {
    createNativePaymentRequest,
    mockProjects,
    PaymentStatus,
    sendEthPayment,
    checkTransactionStatus,
    Project,
    PaymentRequest,
} from "@/lib/request-network";
import { RequestNetworkProvider } from "@/components/request-network-provider";
import { Button } from "@/components/ui/button";

// Neobrutalism styled components
const Card = ({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <div
        className={`bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6 ${className}`}
    >
        {children}
    </div>
);

const Badge = ({
    children,
    color = "blue",
}: {
    children: React.ReactNode;
    color?: string;
}) => {
    const colorClasses = {
        blue: "bg-blue-200 border-blue-500",
        green: "bg-green-200 border-green-500",
        red: "bg-red-200 border-red-500",
        yellow: "bg-yellow-200 border-yellow-500",
        purple: "bg-purple-200 border-purple-500",
    };

    return (
        <span
            className={`inline-block px-3 py-1 text-sm font-bold border-2 rounded-md ${
                colorClasses[color as keyof typeof colorClasses]
            }`}
        >
            {children}
        </span>
    );
};

const Select = ({
    options,
    value,
    onChange,
    placeholder,
}: {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 font-bold bg-white border-4 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-4 focus:ring-yellow-400"
    >
        <option value="" disabled>
            {placeholder}
        </option>
        {options.map((option) => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
        ))}
    </select>
);

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

// Project card component
const ProjectCard = ({ project }: { project: Project }) => (
    <div className="flex-1 mb-4">
        <Card>
            <div className="flex flex-col">
                <img
                    src={project.image}
                    alt={project.name}
                    className="object-cover w-full mb-3 border-2 border-black rounded-md h-36"
                />
                <h3 className="mb-2 text-lg font-bold">{project.name}</h3>
                <p className="text-sm text-gray-700">{project.description}</p>
            </div>
        </Card>
    </div>
);

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

    const {
        account,
        isConnected,
        connectWallet,
        disconnectWallet,
        provider,
        ethPrice,
        getEthFromUsd,
    } = useRequestNetwork();

    // Fixed USD amount for boost
    const boostPriceUsd = 10;
    // Get ETH equivalent of 10 USD
    const ethAmount = getEthFromUsd(boostPriceUsd);

    // Handle project selection
    const handleProjectSelect = (projectId: string) => {
        setSelectedProject(projectId);
    };

    // Create payment request
    const handleCreatePaymentRequest = async () => {
        if (!isConnected || !provider || !account || !selectedProject) return;

        try {
            setPaymentStatus(PaymentStatus.CREATING);

            // Find selected project
            const project = mockProjects.find((p) => p.id === selectedProject);
            if (!project) return;

            // Create payment request
            const request = await createNativePaymentRequest(
                ethAmount,
                account,
                project.id,
                project.name
            );

            setPaymentRequest(request);
            setPaymentStatus(PaymentStatus.AWAITING_PAYMENT);
        } catch (error) {
            console.error("Payment request error:", error);
            setPaymentStatus(PaymentStatus.ERROR);
        }
    };

    // Send ETH payment
    const handleSendPayment = async () => {
        if (!isConnected || !provider || !account || !paymentRequest) return;

        try {
            setPaymentStatus(PaymentStatus.PROCESSING);

            // Send ETH payment
            const { transactionHash } = await sendEthPayment(
                provider,
                paymentRequest.receiver,
                paymentRequest.expectedAmount,
                paymentRequest.details.reason
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

    return (
        <main className="min-h-screen p-6 bg-yellow-50">
            <Card className="max-w-4xl mx-auto my-8">
                <div className="flex flex-col">
                    <h1 className="mb-8 text-4xl font-extrabold text-center">
                        Boost Project 🚀
                    </h1>

                    {/* Wallet Connection Section */}
                    <div className="p-4 mb-8 border-4 border-black rounded-lg bg-purple-100">
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
                                className={
                                    isConnected ? "bg-red-500" : "bg-blue-500"
                                }
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
                        <div className="grid gap-4 md:grid-cols-2">
                            {mockProjects.map((project) => (
                                <div
                                    key={project.id}
                                    onClick={() =>
                                        handleProjectSelect(project.id)
                                    }
                                    className={`cursor-pointer transition-transform ${
                                        selectedProject === project.id
                                            ? "scale-105 border-4 border-blue-500 rounded-lg"
                                            : ""
                                    }`}
                                >
                                    <ProjectCard project={project} />
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="mb-4 text-lg font-bold">
                                Selected Project
                            </h3>
                            <Select
                                options={mockProjects.map((p) => ({
                                    value: p.id,
                                    label: p.name,
                                }))}
                                value={selectedProject}
                                onChange={handleProjectSelect}
                                placeholder="Choose a project"
                            />
                        </div>
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
                            Sepolia testnet.
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
