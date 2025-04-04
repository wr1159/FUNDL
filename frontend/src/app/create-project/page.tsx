"use client";

import { Avatar, Name } from "@coinbase/onchainkit/identity";
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
import { encodeFunctionData, parseEther } from "viem";
import { useState } from "react";
import { FundlABI, FundlAddress } from "@/lib/calls";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function CreateProject() {
    const { address } = useAccount();
    const [tokenAddress, setTokenAddress] = useState("");
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [projectImage, setProjectImage] = useState("");
    const [projectMilestones, setProjectMilestones] = useState("");
    const [goalTarget, setGoalTarget] = useState("");

    const createProject = address
        ? [
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
                          parseEther(goalTarget || "0"),
                      ],
                  }),
                  chainId: baseSepolia.id,
              },
          ]
        : [];

    return (
        <div className="relative min-h-screen bg-bg p-6">
            {/* Hero Section */}
            <Card className="max-w-4xl w-full mx-auto my-8">
                <div className="relative h-full flex items-center justify-center text-center">
                    <div className="max-w-4xl px-4">
                        <h1 className="mb-8 text-4xl font-extrabold text-center">
                            Create a Project 🚀
                        </h1>
                    </div>
                </div>
                <section>
                    <div className="container mx-auto px-4 max-w-xl bg-blue-50 border-4 border-black rounded-lg p-4">
                        <form className="space-y-6">
                            <div className="form-group">
                                <Label
                                    htmlFor="Address"
                                    className="block text-xl font-bold text-foreground mb-2"
                                >
                                    Token Address
                                </Label>
                                <Input
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
                                <Label
                                    htmlFor="projectName"
                                    className="block text-xl font-bold text-foreground mb-2"
                                >
                                    Project Name
                                </Label>
                                <Input
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
                                <Label
                                    htmlFor="projectDescription"
                                    className="block text-xl font-bold text-foreground mb-2"
                                >
                                    Project Description
                                </Label>
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
                                <Label
                                    htmlFor="imageLink"
                                    className="block text-xl font-bold text-foreground mb-2"
                                >
                                    Project Image Link
                                </Label>
                                <Input
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
                                <Label
                                    htmlFor="Milestones"
                                    className="block text-xl font-bold text-foreground mb-2"
                                >
                                    Project Milestones
                                </Label>
                                <Input
                                    id="projectMilestones"
                                    className="w-full px-4 py-2 border border-border rounded-lg"
                                    placeholder="Enter project milestones"
                                    value={projectMilestones}
                                    onChange={(e) =>
                                        setProjectMilestones(e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <Label
                                    htmlFor="goal"
                                    className="block text-xl font-bold text-foreground mb-2"
                                >
                                    Goal Target
                                </Label>
                                <Input
                                    id="goalTarget"
                                    className="w-full px-4 py-2 border border-border rounded-lg"
                                    placeholder="Enter goal target"
                                    value={goalTarget}
                                    onChange={(e) =>
                                        setGoalTarget(e.target.value)
                                    }
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
                                    calls={createProject}
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
                        </form>
                    </div>
                </section>
            </Card>

            {/* Form Section */}
        </div>
    );
}
