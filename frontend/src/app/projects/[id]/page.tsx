"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import {
    Transaction,
    TransactionButton,
    TransactionStatus,
    TransactionStatusAction,
    TransactionStatusLabel,
} from "@coinbase/onchainkit/transaction";
import { Wallet, ConnectWallet } from "@coinbase/onchainkit/wallet";
import { Avatar, Name } from "@coinbase/onchainkit/identity";
import { baseSepolia } from "viem/chains";
import {
    createPublicClient,
    encodeFunctionData,
    formatEther,
    http,
    parseEther,
} from "viem";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    FundlABI,
    FundlAddress,
    MockTokenABI,
    MockTokenAddress,
} from "@/lib/calls";

// Define project type based on the contract struct
export type Project = [
    tokenAddress: `0x${string}`,
    owner: `0x${string}`,
    name: string,
    description: string,
    imageUrl: string,
    isInProgress: boolean,
    milestones: bigint,
    currentMilestone: bigint,
    goalAmount: bigint,
    raisedAmount: bigint,
    currentMilestoneStartTime: bigint,
    timeLastCollected: bigint,
    amountCollectedForMilestone: bigint
];

export default function ProjectPage() {
    const { id } = useParams();
    const { address, isConnected } = useAccount();
    const [project, setProject] = useState<Project | null>(null);
    const [projectData, setProjectData] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fundAmount, setFundAmount] = useState("");
    const [availableToCollect, setAvailableToCollect] = useState<string>("0");
    const [isOwner, setIsOwner] = useState(false);
    const [hasRequestedRefund, setHasRequestedRefund] = useState(false);

    // Create a public client
    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(),
    });

    // Fetch project data using publicClient
    useEffect(() => {
        async function fetchProjectData() {
            if (!id) return;

            setIsLoading(true);
            try {
                const data = await publicClient.readContract({
                    address: FundlAddress as `0x${string}`,
                    abi: FundlABI,
                    functionName: "projects",
                    args: [BigInt(id as string)],
                });

                setProjectData(data as Project);
                setIsLoading(false);
                setIsError(false);
            } catch (err) {
                console.error("Error fetching project:", err);
                setIsError(true);
                setIsLoading(false);
            }
        }

        fetchProjectData();
    }, [id]);

    // Update state based on fetched project data
    useEffect(() => {
        if (isLoading) {
            setLoading(true);
            return;
        }

        if (isError || !projectData) {
            setError("Failed to load project data.");
            setLoading(false);
            return;
        }

        setProject(projectData);
        setIsOwner(address?.toLowerCase() === projectData[1]?.toLowerCase());
        setLoading(false);
    }, [projectData, isLoading, isError, address]);

    // Calculate available funds to collect (for owner only)
    useEffect(() => {
        async function calculateAvailableFunds() {
            if (!project || !isOwner) return;

            try {
                const milestoneAmount = project[8] / BigInt(project[6]); // goalAmount / milestones
                const timeElapsed =
                    BigInt(Math.floor(Date.now() / 1000)) - project[11]; // current time - timeLastCollected
                const amountToBeCollected =
                    (milestoneAmount * timeElapsed) / BigInt(60 * 24 * 60 * 60); // 60 days in seconds

                // Subtract already collected amount for this milestone
                const netCollectable =
                    amountToBeCollected > project[12]
                        ? amountToBeCollected - project[12]
                        : BigInt(0);

                setAvailableToCollect(formatEther(netCollectable));
            } catch (err) {
                console.error("Error calculating available funds:", err);
            }
        }

        if (isOwner) {
            calculateAvailableFunds();
        }
    }, [project, isOwner]);

    // Prepare transaction calls
    const fundProjectCall =
        address && fundAmount
            ? [
                  // First approve tokens
                  {
                      to: MockTokenAddress as `0x${string}`,
                      data: encodeFunctionData({
                          abi: MockTokenABI,
                          functionName: "approve",
                          args: [
                              FundlAddress as `0x${string}`,
                              parseEther(fundAmount || "0"),
                          ],
                      }),
                      chainId: baseSepolia.id,
                  },
                  // Then fund the project
                  {
                      to: FundlAddress as `0x${string}`,
                      data: encodeFunctionData({
                          abi: FundlABI,
                          functionName: "fundl",
                          args: [
                              BigInt(id as string),
                              parseEther(fundAmount || "0"),
                          ],
                      }),
                      chainId: baseSepolia.id,
                  },
              ]
            : [];

    const collectFundsCall =
        address && isOwner
            ? [
                  {
                      to: FundlAddress as `0x${string}`,
                      data: encodeFunctionData({
                          abi: FundlABI,
                          functionName: "collectFunding",
                          args: [BigInt(id as string)],
                      }),
                      chainId: baseSepolia.id,
                  },
              ]
            : [];

    const completeMilestoneCall =
        address && isOwner
            ? [
                  {
                      to: FundlAddress as `0x${string}`,
                      data: encodeFunctionData({
                          abi: FundlABI,
                          functionName: "completeMilestone",
                          args: [BigInt(id as string)],
                      }),
                      chainId: baseSepolia.id,
                  },
              ]
            : [];

    const requestRefundCall =
        address && !hasRequestedRefund
            ? [
                  {
                      to: FundlAddress as `0x${string}`,
                      data: encodeFunctionData({
                          abi: FundlABI,
                          functionName: "createRefundRequest",
                          args: [BigInt(id as string)],
                      }),
                      chainId: baseSepolia.id,
                  },
              ]
            : [];

    if (loading) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center p-6">
                <Card className="p-8 max-w-md w-full">
                    <h1 className="text-2xl font-extrabold mb-4">
                        Loading project...
                    </h1>
                    <div className="w-full h-8 bg-white border-4 border-black relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-blue-400 animate-pulse w-1/2"></div>
                    </div>
                </Card>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center p-6">
                <Card className="p-8 max-w-md w-full">
                    <h1 className="text-2xl font-extrabold mb-4">Error 😕</h1>
                    <p className="font-bold text-red-500 mb-4">
                        {error || "Project not found"}
                    </p>
                    <Button onClick={() => window.history.back()}>
                        Go Back
                    </Button>
                </Card>
            </div>
        );
    }

    // Calculate funding progress percentage
    const progressPercentage =
        project[9] > BigInt(0) && project[8] > BigInt(0)
            ? Math.min(Number((project[9] * BigInt(100)) / project[8]), 100)
            : 0;

    return (
        <div className="min-h-screen bg-bg p-6">
            <Card className="max-w-4xl w-full mx-auto my-8">
                {/* Project Header */}
                <div className="relative flex flex-col items-center mb-6">
                    <div className="w-full overflow-hidden bg-blue-100 border-b-4 border-black">
                        {project[4] && (
                            <img
                                src={project[4]}
                                alt={project[2]}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                    <h1 className="text-4xl font-extrabold mt-6 mb-2">
                        {project[2]}
                    </h1>
                    <p className="mb-4">
                        Created by:{" "}
                        <span className="font-bold">
                            {project[1].substring(0, 6)}...
                            {project[1].substring(38)}
                        </span>
                    </p>
                </div>

                {/* Project Details */}
                <div className="grid md:grid-cols-2 gap-8 p-6">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-extrabold mb-2">
                                About This Project
                            </h2>
                            <div className="bg-yellow-50 border-4 border-black p-4 rounded-lg">
                                <p className="whitespace-pre-wrap">
                                    {project[3]}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-extrabold mb-2">
                                Project Status
                            </h2>
                            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 border-4 border-black rounded-lg">
                                <div>
                                    <p className="font-bold">Status:</p>
                                    <p
                                        className={`${
                                            project[5]
                                                ? "text-green-600"
                                                : "text-red-600"
                                        } font-bold`}
                                    >
                                        {project[5]
                                            ? "In Progress"
                                            : "Completed"}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-bold">Milestones:</p>
                                    <p className="font-bold">
                                        {Number(project[7])} of{" "}
                                        {Number(project[6])}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-bold">Goal Amount:</p>
                                    <p className="font-bold">
                                        {formatEther(project[8])} FMT
                                    </p>
                                </div>
                                <div>
                                    <p className="font-bold">Raised So Far:</p>
                                    <p className="font-bold">
                                        {formatEther(project[9])} FMT
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-4 mb-2 font-bold">
                                Funding Progress: {progressPercentage}%
                            </div>
                            <div className="h-8 w-full border-4 border-black bg-white relative">
                                <div
                                    className="absolute top-0 left-0 h-full bg-green-500"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                                <div className="absolute inset-0 flex items-center justify-center font-extrabold text-black">
                                    {formatEther(project[9])} /{" "}
                                    {formatEther(project[8])} FMT
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Non-Owner: Fund Project Section */}
                        {isConnected && !isOwner && (
                            <div className="bg-green-50 border-4 border-black rounded-lg p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <h2 className="text-2xl font-extrabold mb-4">
                                    🚀 Support This Project
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <Label
                                            htmlFor="fundAmount"
                                            className="block font-bold mb-2"
                                        >
                                            Amount to Fund (FMT)
                                        </Label>
                                        <Input
                                            id="fundAmount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="w-full"
                                            placeholder="0.0"
                                            value={fundAmount}
                                            onChange={(e) =>
                                                setFundAmount(e.target.value)
                                            }
                                        />
                                    </div>

                                    <Transaction
                                        isSponsored={true}
                                        chainId={baseSepolia.id}
                                        calls={fundProjectCall}
                                    >
                                        <Button className="w-full">
                                            <TransactionButton
                                                className="w-full bg-inherit hover:bg-inherit p-0"
                                                text="Fund Project 💰"
                                            />
                                        </Button>
                                        <TransactionStatus>
                                            <TransactionStatusLabel />
                                            <TransactionStatusAction />
                                        </TransactionStatus>
                                    </Transaction>

                                    <div className="border-4 border-black p-3 bg-yellow-50 mt-4">
                                        <p className="font-bold text-sm">
                                            📝 How funding works:
                                        </p>
                                        <ol className="list-decimal pl-4 text-sm mt-1">
                                            <li>
                                                Approve tokens to be spent by
                                                the contract
                                            </li>
                                            <li>
                                                Fund the project with your
                                                approved tokens
                                            </li>
                                            <li>
                                                The project owner can collect
                                                funds over time
                                            </li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Funder: Request Refund Section */}
                        {isConnected && !isOwner && (
                            <div className="bg-red-50 border-4 border-black rounded-lg p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-6">
                                <h2 className="text-2xl font-extrabold mb-4">
                                    🔄 Request Refund
                                </h2>
                                <div className="space-y-4">
                                    {hasRequestedRefund ? (
                                        <div className="p-4 bg-yellow-100 border-4 border-black">
                                            <p className="font-bold">
                                                ⚠️ You&apos;ve already requested
                                                a refund for this project.
                                            </p>
                                            <p className="mt-2 text-sm">
                                                If enough funders (50%) request
                                                refunds, you&apos;ll be able to
                                                claim your funds back.
                                            </p>
                                        </div>
                                    ) : (
                                        <Transaction
                                            isSponsored={true}
                                            chainId={baseSepolia.id}
                                            calls={requestRefundCall}
                                            onSuccess={() =>
                                                setHasRequestedRefund(true)
                                            }
                                        >
                                            <Button className="w-full bg-red-100 hover:bg-red-200">
                                                <TransactionButton
                                                    className="w-full bg-inherit hover:bg-inherit p-0"
                                                    text="Request Refund ⚠️"
                                                />
                                            </Button>
                                            <TransactionStatus>
                                                <TransactionStatusLabel />
                                                <TransactionStatusAction />
                                            </TransactionStatus>
                                        </Transaction>
                                    )}

                                    <div className="border-4 border-black p-3 bg-yellow-50 mt-4">
                                        <p className="font-bold text-sm">
                                            📝 How refunds work:
                                        </p>
                                        <ol className="list-decimal pl-4 text-sm mt-1">
                                            <li>
                                                You can request a refund if
                                                you&apos;ve funded this project
                                            </li>
                                            <li>
                                                If at least 50% of funders
                                                request refunds, all funders can
                                                claim their funds back
                                            </li>
                                            <li>
                                                This is a community protection
                                                mechanism if a project is
                                                inactive or not delivering
                                            </li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Owner: Project Controls Section */}
                        {isConnected && isOwner && (
                            <div className="bg-purple-50 border-4 border-black rounded-lg p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <h2 className="text-2xl font-extrabold mb-4">
                                    🧙‍♂️ Project Owner Controls
                                </h2>
                                <div className="space-y-4">
                                    {/* Current Milestone Info */}
                                    <div className="p-4 bg-blue-100 border-4 border-black">
                                        <p className="font-bold mb-1">
                                            Current milestone:
                                        </p>
                                        <p className="text-2xl font-extrabold">
                                            {Number(project[7])} of{" "}
                                            {Number(project[6])}
                                        </p>
                                    </div>

                                    {/* Complete Milestone Button */}
                                    {Number(project[7]) <
                                        Number(project[6]) && (
                                        <Transaction
                                            isSponsored={true}
                                            chainId={baseSepolia.id}
                                            calls={completeMilestoneCall}
                                        >
                                            <Button className="w-full bg-blue-100 hover:bg-blue-200">
                                                <TransactionButton
                                                    className="w-full bg-inherit hover:bg-inherit p-0"
                                                    text="Complete Current Milestone 🏆"
                                                />
                                            </Button>
                                            <TransactionStatus>
                                                <TransactionStatusLabel />
                                                <TransactionStatusAction />
                                            </TransactionStatus>
                                        </Transaction>
                                    )}

                                    {/* Available to collect section */}
                                    <div className="p-4 bg-white border-4 border-black mt-6">
                                        <p className="font-bold mb-1">
                                            Available to collect:
                                        </p>
                                        <p className="text-3xl font-extrabold">
                                            {availableToCollect} FMT
                                        </p>
                                    </div>

                                    <Transaction
                                        isSponsored={true}
                                        chainId={baseSepolia.id}
                                        calls={collectFundsCall}
                                    >
                                        <Button
                                            className="w-full"
                                            disabled={
                                                parseFloat(
                                                    availableToCollect
                                                ) <= 0
                                            }
                                        >
                                            <TransactionButton
                                                className="w-full bg-inherit hover:bg-inherit p-0"
                                                text="Collect Available Funds 💸"
                                                disabled={
                                                    parseFloat(
                                                        availableToCollect
                                                    ) <= 0
                                                }
                                            />
                                        </Button>
                                        <TransactionStatus>
                                            <TransactionStatusLabel />
                                            <TransactionStatusAction />
                                        </TransactionStatus>
                                    </Transaction>

                                    <div className="border-4 border-black p-3 bg-yellow-50 mt-4">
                                        <p className="font-bold text-sm">
                                            📝 How milestones & funding work:
                                        </p>
                                        <ol className="list-decimal pl-4 text-sm mt-1">
                                            <li>
                                                Funds stream to you over time
                                                based on your milestone schedule
                                            </li>
                                            <li>
                                                Complete a milestone to move to
                                                the next one and collect
                                                remaining funds
                                            </li>
                                            <li>
                                                The regular collect button lets
                                                you collect funds that have
                                                accrued since your last
                                                collection
                                            </li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Connect Wallet Section */}
                        {!isConnected && (
                            <div className="bg-blue-50 border-4 border-black rounded-lg p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <h2 className="text-2xl font-extrabold mb-4">
                                    🔌 Connect Your Wallet
                                </h2>
                                <p className="mb-4">
                                    Connect your wallet to fund this project or
                                    collect funds if you&#39;re the owner.
                                </p>
                                <Button>
                                    <Wallet>
                                        <ConnectWallet className="bg-inherit hover:bg-inherit">
                                            <Avatar className="h-6 w-6" />
                                            <Name />
                                        </ConnectWallet>
                                    </Wallet>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
