"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useReadContract, useAccount } from "wagmi";
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
import { baseSepolia } from "viem/chains";
import { encodeFunctionData, formatEther } from "viem";
import { FundlABI, FundlAddress } from "@/lib/calls";

interface IndividualProject {
    id: number;
    projectName: string;
    projectDescription: string;
    projectImage: string;
    goalTarget: string;
    creator: `0x${string}`;
}


