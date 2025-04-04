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
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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
    const [error, setError] = useState<string | null>(null);

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
        setError(null);
    };

    // Create payment request
    const handleCreatePaymentRequest = async () => {
        if (!isConnected || !provider || !account || !selectedProject) return;

        try {
            setError(null);
            setPaymentStatus(PaymentStatus.CREATING);

            // Find selected project
            const project = mockProjects.find((p) => p.id === selectedProject);
            if (!project) return;

            // Create payment request using Request Network API
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

    return (
        <main className="min-h-screen p-6 bg-bg">
            <Card className="max-w-4xl mx-auto my-8">
                <div className="flex flex-col">
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
                        <div className="grid gap-8 md:grid-cols-2">
                            {mockProjects.map((project) => (
                                <div
                                    key={project.id}
                                    onClick={() =>
                                        handleProjectSelect(project.id)
                                    }
                                    className={`cursor-pointer transition-transform ${
                                        selectedProject === project.id
                                            ? "scale-110 rounded-lg"
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
