

export const FundlAddress = "0xE88992f10a655Da303D4683da8E931ab06A3a936";
export const FundlABI = [
    {
        type: "function",
        name: "collectFunding",
        inputs: [
            {
                name: "_projectId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "completeMilestone",
        inputs: [
            {
                name: "_projectId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "createProject",
        inputs: [
            {
                name: "_tokenAddress",
                type: "address",
                internalType: "address",
            },
            { name: "_name", 
              type: "string", 
              internalType: "string" },
            {
                name: "_description",
                type: "string",
                internalType: "string",
            },
            {
                name: "_imageUrl",
                type: "string",
                internalType: "string",
            },
            {
                name: "_milestones",
                type: "uint8",
                internalType: "uint8",
            },
            {
                name: "_goalAmount",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "createRefundRequest",
        inputs: [
            {
                name: "_projectId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "fundl",
        inputs: [
            {
                name: "_projectId",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "_amount",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "projectIdCounter",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "projects",
        inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        outputs: [
            {
                name: "tokenAddress",
                type: "address",
                internalType: "address",
            },
            { name: "owner", type: "address", internalType: "address" },
            { name: "name", type: "string", internalType: "string" },
            {
                name: "description",
                type: "string",
                internalType: "string",
            },
            {
                name: "imageUrl",
                type: "string",
                internalType: "string",
            },
            {
                name: "isInProgress",
                type: "bool",
                internalType: "bool",
            },
            {
                name: "milestones",
                type: "uint8",
                internalType: "uint8",
            },
            {
                name: "currentMilestone",
                type: "uint8",
                internalType: "uint8",
            },
            {
                name: "goalAmount",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "raisedAmount",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "currentMilestoneStartTime",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "timeLastCollected",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "amountCollectedForMilestone",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "refund",
        inputs: [
            {
                name: "_projectId",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
];

export const MockTokenAddress = "0xE88992f10a655Da303D4683da8E931ab06A3a936";
export const MockTokenABI = [
    {
        type: "function",
        name: "approve",
        inputs: [
            {
                name: "_spender",
                type: "address",
                internalType: "address",
            },
            {
                name: "_value",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
];
