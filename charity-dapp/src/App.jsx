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
          setUserRole("Charity");
        } else if (currentAccount === verifierAddr.toLowerCase()) {
          setUserRole("Verifier");
        } else {
          setUserRole("Donor");
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
      alert("Transaction failed. Are you authorized for this role?");
    }
  }

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      updateUI();
      window.ethereum.on('accountsChanged', updateUI);
    } else {
      setUserRole("MetaMask Not Detected");
    }
  }, []);

  return (
    <div className="main-wrapper">
      {/* Navbar section mimicking professional charity sites */}
      <nav className="navbar">
        <div className="logo"><h2>GRANT FOUNDATION</h2></div>
        <div className="nav-links">
          <span>Home</span>
          <span>About</span>
          <span>Projects</span>
          <span className="role-badge">Role: {userRole}</span>
        </div>
      </nav>

      {/* Hero section for professional look */}
      <header className="hero">
        <h1>WE CAN HELP SOMEONE</h1>
        <p style={{maxWidth: '600px'}}>Empowering communities through blockchain transparency.</p>
        <div style={{marginTop: '30px'}}>
          <button onClick={() => handleAction('deposit')} className="main-donate-btn">
            DONATE NOW
          </button>
        </div>
      </header>

      {/* TrustChain Dashboard */}
      <section className="stats-section">
        <div className="action-card">
          <h2 style={{color: '#333'}}>TrustChain Dashboard</h2>
          <div className="dashboard-grid">
            <div>
              <p className="label">CONTRACT VAULT</p>
              <h3 className="value">{balance} ETH</h3>
            </div>
            <div>
              <p className="label">CONNECTED WALLET</p>
              <p className="address-text">{account || "Disconnected"}</p>
            </div>
          </div>
          
          <div className="admin-actions">
            <button onClick={() => handleAction('request')} className="admin-btn">Request (Charity)</button>
            <button onClick={() => handleAction('approve')} className="admin-btn">Approve (Verifier)</button>
            <button onClick={() => handleAction('withdraw')} className="admin-btn">Withdraw (Charity)</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;