import { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xd9145CCE52D386f254917e481eB44e9943F39138";

const CONTRACT_ABI = [
  "function deposit() public payable",
  "function requestFunds(uint256 _amount) public",
  "function approveAmount(uint256 _amount) public",
  "function withdraw() public",
  "function getContractBalance() public view returns (uint256)",
  "function charity() public view returns (address)",
  "function verifier() public view returns (address)"
];

function App() {
  const [balance, setBalance] = useState("0");
  const [account, setAccount] = useState("");
  const [userRole, setUserRole] = useState("Donor / Public");

  async function updateUI() {
    // Safety check: Don't run if MetaMask is missing
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const currentAccount = accounts[0].toLowerCase();
        setAccount(currentAccount);

        const [bal, charityAddr, verifierAddr] = await Promise.all([
          contract.getContractBalance(),
          contract.charity(),
          contract.verifier()
        ]);

        setBalance(ethers.formatEther(bal));

        if (currentAccount === charityAddr.toLowerCase()) {
          setUserRole("Charity (Authorized to Request/Withdraw)");
        } else if (currentAccount === verifierAddr.toLowerCase()) {
          setUserRole("Verifier (Authorized to Approve)");
        } else {
          setUserRole("Donor / Public");
        }
      } catch (err) {
        console.error("Error updating UI:", err);
      }
    }
  }

  async function handleAction(type) {
    if (!window.ethereum) return alert("Please install MetaMask first!");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    try {
      let tx;
      if (type === 'deposit') {
        tx = await contract.deposit({ value: ethers.parseEther("0.01") });
      } else if (type === 'request') {
        tx = await contract.requestFunds(ethers.parseEther("0.01"));
      } else if (type === 'approve') {
        tx = await contract.approveAmount(ethers.parseEther("0.01"));
      } else if (type === 'withdraw') {
        tx = await contract.withdraw();
      }
      
      await tx.wait();
      alert("Success!");
      updateUI();
    } catch (err) {
      alert("Transaction failed. Are you the right user for this action?");
    }
  }

  useEffect(() => {
    // FIX: Only add listeners if window.ethereum exists
    if (typeof window.ethereum !== "undefined") {
      updateUI();
      window.ethereum.on('accountsChanged', updateUI);
    } else {
      setUserRole("MetaMask Not Detected");
    }
  }, []);

  return (
    <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#f4f7f6", minHeight: "100vh" }}>
      <h1>TrustChain Dashboard</h1>
      
      <div style={cardStyle}>
        <p><strong>Connected Wallet:</strong> {account || "Not Connected"}</p>
        <p><strong>Your Role:</strong> <span style={{ color: "#646cff" }}>{userRole}</span></p>
        <p><strong>Contract Vault:</strong> {balance} ETH</p>
      </div>

      <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={() => handleAction('deposit')} style={btnStyle}>Donate 0.01 ETH</button>
        <button onClick={() => handleAction('request')} style={btnStyle}>Request (Charity)</button>
        <button onClick={() => handleAction('approve')} style={btnStyle}>Approve (Verifier)</button>
        <button onClick={() => handleAction('withdraw')} style={btnStyle}>Withdraw (Charity)</button>
      </div>
    </div>
  );
}

// Styles remain the same
const cardStyle = { margin: "20px auto", maxWidth: "500px", padding: "20px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" };
const btnStyle = { padding: "12px 24px", cursor: "pointer", backgroundColor: "#646cff", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold" };

export default App;