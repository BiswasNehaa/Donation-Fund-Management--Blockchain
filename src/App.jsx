import { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";

const CONTRACT_ADDRESS = "0x672F4716B66c24140967a655De766f65C07e4837";
const CONTRACT_ABI = [
  "function deposit() public payable",
  "function requestFunds(uint256 _amount) public",
  "function approveAmount(uint256 _amount) public",
  "function withdraw() public",
  "function getContractBalance() public view returns (uint256)"
];

function App() {
  const [balance, setBalance] = useState("0");
  const [account, setAccount] = useState("");
  const [donationAmount, setDonationAmount] = useState("0.01");

  async function updateUI() {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) setAccount(accounts[0]);
      const bal = await contract.getContractBalance();
      setBalance(ethers.formatEther(bal));
    } catch (err) { console.error("Balance Check Error:", err); }
  }

  useEffect(() => {
    updateUI();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => window.location.reload());
    }
  }, []);

  async function handleAction(type) {
    if (!window.ethereum) return alert("Please Install MetaMask!");
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    try {
      // Use the amount currently in the input box
      const val = ethers.parseEther(donationAmount);
      let tx;

      if (type === 'deposit') {
        tx = await contract.deposit({ value: val });
      } else if (type === 'request') {
        tx = await contract.requestFunds(val);
      } else if (type === 'approve') {
        tx = await contract.approveAmount(val);
      } else if (type === 'withdraw') {
        tx = await contract.withdraw();
      }
      
      alert("Opening MetaMask for: " + type);
      await tx.wait();
      alert("Success!");
      updateUI();
    } catch (err) {
      console.error(err);
      // This will show the actual blockchain error (like 'Execution Reverted')
      alert("Transaction Failed! Check MetaMask to see if you are using the correct account.");
    }
  }

  return (
    <div className="main-wrapper">
      <div className="hero-section">
        <nav className="nav-container"><h2 className="logo">GRANT FOUNDATION</h2></nav>
        <div className="hero-content">
          <h1 className="main-title">VAULT DASHBOARD</h1>
          <div className="donation-card">
            <input 
              type="number" 
              value={donationAmount} 
              onChange={(e) => setDonationAmount(e.target.value)}
              className="amount-input"
            />
            <button onClick={() => handleAction('deposit')} className="donate-btn">Donate Now</button>
          </div>
        </div>
      </div>
      <div className="dashboard-section">
        <div className="audit-card">
          <p className="audit-value">Balance: {balance} ETH</p>
          <p className="audit-address">Wallet: {account}</p>
          <div className="button-group">
            <button onClick={() => handleAction('request')} className="sec-btn">Request</button>
            <button onClick={() => handleAction('approve')} className="sec-btn">Approve</button>
            <button onClick={() => handleAction('withdraw')} className="danger-btn">Withdraw</button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;