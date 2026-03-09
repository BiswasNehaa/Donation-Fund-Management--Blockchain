import { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";

const CONTRACT_ADDRESS = "0x672F4716B66c24140967a655De766f65C07e4837";
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
    } catch (err) { console.error(err); }
  }

  useEffect(() => {
    updateUI();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => window.location.reload());
    }
  }, []);

  async function handleAction(type) {
    if (!window.ethereum) return alert("Install MetaMask!");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    try {
      let tx;
      if (type === 'deposit') {
        tx = await contract.deposit({ value: ethers.parseEther(donationAmount || "0.01") });
      } else if (type === 'request') {
        tx = await contract.requestFunds(ethers.parseEther("0.001"));
      } else if (type === 'approve') {
        tx = await contract.approveAmount(ethers.parseEther("0.001"));
      } else if (type === 'withdraw') {
        tx = await contract.withdraw();
      }
      
      alert("Processing... check MetaMask");
      await tx.wait();
      alert("Success!");
      updateUI();
    } catch (err) { 
      alert("Action Failed: You must be switched to the correct Charity or Verifier wallet in MetaMask to use this button.");
    }
  }

  return (
    <div className="main-wrapper">
      <div className="hero-section">
        <nav className="nav-container">
          <h2 className="logo">GRANT FOUNDATION</h2>
          <div className="role-pill">Verified DApp</div>
        </nav>

        <div className="hero-content">
          <h1 className="main-title">WE CAN HELP <span className="accent">SOMEONE</span></h1>
          <p className="sub-title">Transparency in every drop of kindness.</p>

          <div className="donation-card">
            <div className="input-box">
              <input 
                type="number" 
                value={donationAmount} 
                onChange={(e) => setDonationAmount(e.target.value)}
                className="amount-input"
              />
              <span className="unit">ETH</span>
            </div>
            <button onClick={() => handleAction('deposit')} className="donate-btn">Donate Now</button>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="audit-card">
          <h3 className="card-title">TrustChain Audit</h3>
          <div className="audit-grid">
            <div className="audit-item">
              <label>VAULT BALANCE</label>
              <p className="audit-value">{balance} ETH</p>
            </div>
            <div className="audit-item">
              <label>CONNECTED WALLET</label>
              <p className="audit-address">{account}</p>
            </div>
          </div>
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