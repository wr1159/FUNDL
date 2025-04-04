"use client";

import { Avatar, Name } from "@coinbase/onchainkit/identity";
import { motion } from "framer-motion";
import {
    Transaction,
    TransactionButton,
    TransactionSponsor,
    TransactionStatus,
    TransactionStatusAction,
    TransactionStatusLabel,
} from "@coinbase/onchainkit/transaction";
import { Wallet, ConnectWallet } from "@coinbase/onchainkit/wallet";
import { useAccount } from "wagmi";
import { baseSepolia } from "viem/chains";
import { encodeFunctionData, parseEther } from "viem"
import { useState } from "react";
import { FundlABI, FundlAddress } from "@/lib/calls";

export default function CreateProject() {
    const { address } = useAccount();
    const [tokenAddress, setTokenAddress] = useState("");
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [projectImage, setProjectImage] = useState("");
    const [projectMilestones, setProjectMilestones] = useState("");
    const [goalTarget, setGoalTarget] = useState("");

    const createProject = address ? [
        {
            to: FundlAddress as `0x${string}`,
            data: encodeFunctionData({
                abi: FundlABI,
                functionName: "createProject",
                args: [
                    address as `0x${string}`, 
                    projectName || "",
                    projectDescription || "",
                    projectImage || "",
                    projectMilestones || "",
                    parseEther(goalTarget || "0")
                ],
            }),
            value: "0", // Explicitly set the value to 0
            chainId: baseSepolia.id,
        },
    ] : [];


    return (
        <div className="relative min-h-screen">
            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-10"
            >
                {/* Hero Section */}
                <section className="relative h-[60vh] w-full">
                    <div className="relative h-full flex items-center justify-center text-center">
                        <motion.div
                            initial={{ y: 0, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-4xl px-4"
                        >
                            <h1 className="text-4xl md:text-7xl font-bold text-primary mb-6">
                                Create a Project
                            </h1>
                            
                        </motion.div>
                    </div>
                </section>

                {/* Form Section */}
                <section>
                    <div className="container mx-auto px-4 max-w-xl">
                        <motion.form
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-6"
                        >   
                            <div className="form-group">
                                <label
                                    htmlFor="Address"
                                    className="block text-xl font-bold text-foreground mb-2"
                                >
                                    Token Address
                                </label>
                                <input
                                    type="text"
                                    id="Address"
                                    className="w-full px-4 py-2 border border-border rounded-lg"
                                    placeholder="Enter token address"
                                    value={tokenAddress}
                                    onChange={(e) =>
                                        setTokenAddress(e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label
                                    htmlFor="projectName"
                                    className="block text-xl font-bold text-foreground mb-2"
                                >
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    id="projectName"
                                    className="w-full px-4 py-2 border border-border rounded-lg"
                                    placeholder="Enter project name"
                                    value={projectName}
                                    onChange={(e) =>
                                        setProjectName(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label
                                    htmlFor="projectDescription"
                                    className="block text-xl font-bold text-foreground mb-2"
                                >
                                    Project Description
                                </label>
                                <textarea
                                    id="projectDescription"
                                    className="w-full px-4 py-2 border border-border rounded-lg"
                                    placeholder="Describe the project"
                                    rows={4}
                                    value={projectDescription}
                                    onChange={(e) =>
                                        setProjectDescription(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label
                                    htmlFor="imageLink"
                                    className="block text-xl font-bold text-foreground mb-2"
                                >
                                    Project Image Link
                                </label>
                                <input
                                    type="url"
                                    id="imageLink"
                                    className="w-full px-4 py-2 border border-border rounded-lg"
                                    placeholder="Enter image URL"
                                    value={projectImage}
                                    onChange={(e) =>
                                        setProjectImage(e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label
                                    htmlFor="Milestones"
                                    className="block text-xl font-bold text-foreground mb-2"
                                >
                                    Project Milestones
                                </label>
                                <input
                                    id="projectMilestones"
                                    className="w-full px-4 py-2 border border-border rounded-lg"
                                    placeholder="Enter project milestones"
                                    value={projectMilestones}
                                    onChange={(e) => setProjectMilestones(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label
                                    htmlFor="goal"
                                    className="block text-xl font-bold text-foreground mb-2"
                                >
                                    Goal Target
                                </label>
                                <input
                                    id="goalTarget"
                                    className="w-full px-4 py-2 border border-border rounded-lg"
                                    placeholder="Enter goal target"
                                    value={goalTarget}
                                    onChange={(e) => setGoalTarget(e.target.value)}
                                    required
                                />
                            </div>

                         

                            {/* OnchainKit Transaction Component */}
                            {address ? (
                                <Transaction
                                    // capabilities={{
                                    //     paymasterService: {
                                    //         url: process.env
                                    //             .PAYMASTER_AND_BUNDLER_ENDPOINT as string,
                                    //     },
                                    // }}
                                    isSponsored={true}
                                    chainId={baseSepolia.id}
                                    calls={createProject as any}
                                >
                                    <TransactionButton
                                        className="w-full bg-primary text-primary-foreground py-3 px-8 rounded-lg"
                                        text="Create Bounty"
                                    />
                                    <TransactionSponsor />
                                    <TransactionStatus>
                                        <TransactionStatusLabel />
                                        <TransactionStatusAction />
                                    </TransactionStatus>
                                </Transaction>
                            ) : (
                                <Wallet>
                                    <ConnectWallet>
                                        <Avatar className="h-6 w-6" />
                                        <Name />
                                    </ConnectWallet>
                                </Wallet>
                            )}
                        </motion.form>
                    </div>
                </section>
            </motion.main>
        </div>
    );
}
