import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OCBCLogo from './images/OCBC Logo.png';

const Shortcuts: React.FC = () => {
  const [theme, setTheme] = useState('light');
  const [transactionType, setTransactionType] = useState('Cash Withdrawal');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<{ type: string; amount: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleSave = () => {
    if (transactions.length < 3) { // Limit to 3 saved transactions
      setTransactions([...transactions, { type: transactionType, amount }]);
    }
    setAmount(''); // Clear the input after saving
  };

  return (
    <div className={`home-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
    <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
    <div className="home-content1">
      <div className="home-grid1">
        <h1 className="text-2xl font-bold">Shortcuts</h1>

        {/* Saved transactions directly under Shortcuts */}
        <div className="saved-transactions">
          {transactions.map((transaction, index) => (
            <div key={index} className="transaction-box">
              {transaction.type}: ${transaction.amount}
            </div>
          ))}
        </div>
      </div>

      {/* Transaction input section on the right side */}
      <div className="transaction-container">
        <p className="transaction-info">
          <b>Choose the transaction type you would like to add into Shortcuts</b>
        </p>

        {/* Dropdown for transaction type */}
        <div className="transaction-dropdown">
          <label className="label">Select Transaction Type:</label>
          <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)} className="select-box">
            <option value="Cash Withdrawal">Cash Withdrawal</option>
            <option value="Fund Transfer">Fund Transfer</option>
          </select>
        </div>

        {/* Input for amount */}
        <div className="amount-input">
          <label className="label">Enter the Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="select-box"
            placeholder="Enter amount here"
          />
        </div>

        {/* Save button */}
        <button onClick={handleSave} className="save-button">Add</button>
      </div>
    </div>
  </div>
  );
};

export default Shortcuts;
