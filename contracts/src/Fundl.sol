// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

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
        string bannerUrl; // URL of the project banner
        bool isInProgress; // Is the project in progress
        // Funding Related
        uint8 milestones; // Number of Milestones
        uint8 currentMilestone; // Current milestone of the project
        uint256 milestoneDuration; // How long one milestone should take: Default 2 months
        uint256 goalAmount; // Funding goal amount
        uint256 raisedAmount; // Amount raised so far
        // Users funding related
        uint16 refundRequests; // Number of refund requests
        // Time Related
        uint256 duration; // Duration of the project in seconds
        uint256 startTime; // Start time of the project
        uint256 timeLastCollected; // Time Last payment was collected
        uint256 amountCollectedForMilestone; // Amount collected so far
    }
    // - **Create Project** - State your minimum amount, ERC20 token, end date and information on project. A Project is represented as an NFT.
    // - **Fundl** - Users fund the project with the specified token and get a backing token in return.
    // - **Payment Streaming** – Payment is Streamed every block to the project owner until End of Project.
    // - **Milestone Based System** - Payment Streaming Rate and Threshold is dependent on milestone.
    // - **Voting-based Refund** - Users can vote to stop the project for refund in case of lack of activity from the project.
    // - **Interoperability / Multichain** – Supported by VIA Labs cross chain Tokens, users can crowdfund from any chain to Base.⬇️

    // Mapping to store projects
    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(address => uint256)) fundingByUsersByProject; // Amount funded by each user
    // Counter for project IDs
    uint256 public projectIdCounter;

    function createProject(
        address _tokenAddress,
        string memory _name,
        string memory _description,
        string memory _imageUrl,
        string memory _bannerUrl,
        uint8 _milestones,
        uint256 _milestoneDuration,
        uint256 _goalAmount,
        uint256 _duration
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
            bannerUrl: _bannerUrl,
            isInProgress: true,
            // Funding Related
            milestones: _milestones,
            currentMilestone: 0,
            milestoneDuration: _milestoneDuration,
            goalAmount: _goalAmount,
            raisedAmount: 0,
            refundRequests: 0,
            // Time Related
            duration: _duration,
            startTime: block.timestamp,
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
        // ERC20(projects[_projectId].tokenAddress).transfer(
        //     projects[_projectId].owner,
        //     amountToBeCollected
        // );
        // Increment milestone
        projects[_projectId].currentMilestone++;
        projects[_projectId].timeLastCollected = block.timestamp;
        projects[_projectId].amountCollectedForMilestone = 0;
    }

    function fundl(uint256 _projectId, uint256 _amount) public {
        // Transfer tokens from user to project owner
        // Mint backing token to user
    }

    function collectFunding(uint256 _projectId) public {
        // Collect funding for the project
        // Transfer tokens to project owner
        // Update last collected time
    }

    function createRefundRequest(uint256 _projectId) public {
        // Increment refund request count
        // Refund the user if the project is not completed
        // Burn backing token
    }
}
