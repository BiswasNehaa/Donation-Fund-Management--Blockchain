import { useState } from 'react';
import { ethers } from 'ethers';

// 1. IMPORTANT: We will replace this with your Remix address in a moment
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; 

const ABI = [
  "function donate() public payable",
  "function releaseToNGO() public",
  "function vaultBalance() public view returns (uint256)"
];

function App() {
  const [balance, setBalance] = useState("0");
  const [wallet, setWallet] = useState("");

  async function connect() {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWallet(accounts[0]);
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      try {
        const bal = await contract.vaultBalance();
        setBalance(ethers.formatEther(bal));
      } catch (err) { console.log("Contract not found yet"); }
    }
  }

  return (
    <div style={{ background: '#0f172a', color: 'white', minHeight: '100vh', padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1 style={{ color: '#38bdf8' }}>🌍 Trustless Charity Vault</h1>
      <p>Ensuring funds reach the NGO only after Arbiter approval.</p>
      
      <button onClick={connect} style={btnStyle}>
        {wallet ? `Connected: ${wallet.slice(0,6)}...` : "Connect MetaMask"}
      </button>

      <div style={cardStyle}>
        <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>{balance} ETH</h2>
        <p style={{ color: '#94a3b8' }}>Funds currently held in Smart Contract</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
        <div style={roleBox}>
          <h3>Donor</h3>
          <button style={{...actionBtn, background: '#22c55e'}}>Send 0.01 ETH</button>
        </div>
        <div style={roleBox}>
          <h3>Arbiter</h3>
          <button style={{...actionBtn, background: '#3b82f6'}}>Approve & Release</button>
        </div>
      </div>
    </div>
  );
}

const btnStyle = { padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', border: 'none', background: '#334155', color: 'white', fontWeight: 'bold' };
const cardStyle = { background: '#1e293b', padding: '30px', borderRadius: '15px', marginTop: '20px', border: '1px solid #334155', display: 'inline-block', minWidth: '300px' };
const roleBox = { background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', width: '200px' };
const actionBtn = { width: '100%', padding: '12px', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };

export default App;