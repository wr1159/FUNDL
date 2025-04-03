// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// CrowdFunding Contract

contract Fundl {
    // Struct to represent a project
    struct Project {
        // Project Related
        address tokenAddress; // Address of the token contract
        address owner; // Owner of the project
        string name; // Name of the project
        string description; // Description of the project
        string imageUrl; // URL of the project image
        bool isInProgress; // Is the project in progress
        // Funding Related
        uint8 milestones; // Number of Milestones
        uint8 currentMilestone; // Current milestone of the project
        uint256 goalAmount; // Funding goal amount
        uint256 raisedAmount; // Amount raised so far
        // Time Related
        uint256 currentMilestoneStartTime; // Current Milestone Start Time
        uint256 timeLastCollected; // Time Last payment was collected
        uint256 amountCollectedForMilestone; // Amount collected by the owner so far
    }
    // - **Create Project** - State your minimum amount, ERC20 token, end date and information on project. A Project is represented as an NFT.
    // - **Fundl** - Users fund the project with the specified token
    // - **Payment Streaming** – Payment is Streamed every block to the project owner until End of Project.
    // - **Milestone Based System** - Payment Streaming Rate and Threshold is dependent on milestone.
    // - **Voting-based Refund** - Users can vote to stop the project for refund in case of lack of activity from the project.
    // - **Interoperability / Multichain** – Supported by VIA Labs cross chain Tokens, users can crowdfund from any chain to Base.⬇️

    // Mappings
    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(address => uint256)) fundingByUsersByProject; // Funding by each user for each project
    mapping(uint256 => mapping(address => bool)) refundRequestByUsersByProject; // Refund request by each user for each project
    mapping(uint256 => uint128) refundRequestsByProject; // Refund requests for each project
    mapping(uint256 => mapping(uint8 => uint128)) votesByMilestoneByProject; // votes for each milestone for each project
    mapping(uint256 => uint128) fundersByProject; // Funders for each project
    // Counter for project IDs
    uint256 public projectIdCounter;

    function createProject(
        address _tokenAddress,
        string memory _name,
        string memory _description,
        string memory _imageUrl,
        uint8 _milestones,
        uint256 _goalAmount
    ) public {
        // Add to Mapping with all information and projectId
        // Mint NFT To user to represent ownership of the project
        projects[projectIdCounter] = Project({
            // Project Related
            owner: msg.sender,
            tokenAddress: _tokenAddress,
            name: _name,
            description: _description,
            imageUrl: _imageUrl,
            isInProgress: true,
            // Funding Related
            milestones: _milestones,
            currentMilestone: 0,
            goalAmount: _goalAmount,
            raisedAmount: 0,
            // Time Related
            currentMilestoneStartTime: block.timestamp,
            timeLastCollected: block.timestamp,
            amountCollectedForMilestone: 0
        });
        projectIdCounter++;
    }

    function completeMilestone(uint256 _projectId) public {
        // Collect milestone money and increase rate
        require(
            msg.sender == projects[_projectId].owner,
            "Only project owner can complete milestone"
        );
        uint256 amountToBeCollected = (projects[_projectId].goalAmount /
            projects[_projectId].milestones) -
            projects[_projectId].amountCollectedForMilestone;
        IERC20(projects[_projectId].tokenAddress).transfer(
            projects[_projectId].owner,
            amountToBeCollected
        );
        // Increment milestone
        projects[_projectId].currentMilestone++;
        projects[_projectId].timeLastCollected = block.timestamp;
        projects[_projectId].amountCollectedForMilestone = 0;
    }

    function fundl(uint256 _projectId, uint256 _amount) public {
        // Transfer tokens from user to project owner
        // Mint backing token to user
        // Update raised amount
        // Update funding by user
        require(
            projects[_projectId].isInProgress,
            "Project is not in progress"
        );
        require(_amount > 0, "Amount should be greater than 0");
        require(
            projects[_projectId].raisedAmount + _amount <=
                projects[_projectId].goalAmount,
            "Funding goal exceeded"
        );
        IERC20(projects[_projectId].tokenAddress).transferFrom(
            msg.sender,
            projects[_projectId].owner,
            _amount
        );
        fundingByUsersByProject[_projectId][msg.sender] += _amount;
        fundersByProject[_projectId]++;
        projects[_projectId].raisedAmount += _amount;
    }

    function collectFunding(uint256 _projectId) public {
        // Transfer tokens to project owner for milestone
        // Update amount collected for milestone
        // Update last collected time
        require(
            msg.sender == projects[_projectId].owner,
            "Only project owner can collect funding"
        );
        uint256 milestoneAmount = (projects[_projectId].goalAmount /
            projects[_projectId].milestones);
        uint256 amountToBeCollected = milestoneAmount *
            ((block.timestamp - projects[_projectId].timeLastCollected) /
                60 days);
        IERC20(projects[_projectId].tokenAddress).transfer(
            projects[_projectId].owner,
            amountToBeCollected
        );
    }

    function createRefundRequest(uint256 _projectId) public {
        // Increment refund request count
        // Refund the user if half of the users vote for it
        require(
            projects[_projectId].isInProgress,
            "Project is not in progress"
        );
        require(
            fundingByUsersByProject[_projectId][msg.sender] > 0,
            "You have not funded this project"
        );
        require(
            !refundRequestByUsersByProject[_projectId][msg.sender],
            "Refund request already created"
        );
        refundRequestByUsersByProject[_projectId][msg.sender] = true;
        refundRequestsByProject[_projectId]++;
    }

    function refund(uint256 _projectId) public {
        require(
            projects[_projectId].isInProgress,
            "Project is not in progress"
        );
        require(
            fundingByUsersByProject[_projectId][msg.sender] > 0,
            "You have not funded this project"
        );
        require(
            fundersByProject[_projectId] > 2,
            "Not enough funders for this project"
        );
        require(
            refundRequestsByProject[_projectId] >=
                fundersByProject[_projectId] / 2,
            "Refund request not created"
        );
        if (
            refundRequestsByProject[_projectId] >=
            fundersByProject[_projectId] / 2
        ) {
            // Refund users
            uint256 amountToBeRefunded = fundingByUsersByProject[_projectId][
                msg.sender
            ];
            IERC20(projects[_projectId].tokenAddress).transfer(
                msg.sender,
                amountToBeRefunded
            );
            projects[_projectId].raisedAmount -= amountToBeRefunded;
            fundingByUsersByProject[_projectId][msg.sender] = 0;
        }
    }
}
