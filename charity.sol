// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleTrustChain {
    address public donor;
    address public charity;
    address public verifier;
    
    uint256 public approvedAmount; // The limit the charity can take
    uint256 public requestedAmount; // What the charity says they need

    constructor(address _charity, address _verifier) {
        donor = msg.sender;
        charity = _charity;
        verifier = _verifier;
    }

    // Donor sends money here
    function deposit() public payable {}

    // 1. Charity asks for a specific amount
    function requestFunds(uint256 _amount) public {
        require(msg.sender == charity, "Only charity can request");
        require(_amount <= address(this).balance, "Not enough funds in contract");
        requestedAmount = _amount;
    }

    // 2. Verifier approves an amount (can be less than or equal to request)
    function approveAmount(uint256 _amount) public {
        require(msg.sender == verifier, "Only verifier can approve");
        require(_amount <= requestedAmount, "Cannot approve more than requested");
        approvedAmount = _amount;
    }

    // 3. Charity takes the approved money
    function withdraw() public {
        require(msg.sender == charity, "Only charity can withdraw");
        require(approvedAmount > 0, "No funds approved yet");
        
        uint256 amountToTransfer = approvedAmount;
        approvedAmount = 0; // Reset for next request
        requestedAmount = 0;
        
        payable(charity).transfer(amountToTransfer);
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}