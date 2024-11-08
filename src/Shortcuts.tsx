import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OCBCLogo from './images/OCBC Logo.png';
import { db, collection, addDoc, getDocs } from './firebaseConfig';
import WatsonChat from './WatsonChat';

const Shortcuts: React.FC = () => {
  const [theme, setTheme] = useState('light');
  const [transactionType, setTransactionType] = useState('Cash Withdrawal');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<{ type: string; amount: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Fetch transactions from Firestore when the component mounts
    const fetchTransactions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'shortcuts'));
        const transactionsList: { type: string; amount: string }[] = [];
        querySnapshot.forEach((doc) => {
          transactionsList.push(doc.data() as { type: string; amount: string });
        });
        console.log("Fetched transactions:", transactionsList);
        setTransactions(transactionsList);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);


  const handleSave = async () => {
    if (transactions.length < 3) { // Limit to 3 saved transactions
      const newTransaction = { type: transactionType, amount };
      console.log("Saving new transaction:", newTransaction);

      // Save the transaction to Firestore
      try {
        await addDoc(collection(db, 'shortcuts'), newTransaction);
        // After saving, fetch and update transactions
        const querySnapshot = await getDocs(collection(db, 'shortcuts'));
        const transactionsList: { type: string; amount: string }[] = [];
        querySnapshot.forEach((doc) => {
          transactionsList.push(doc.data() as { type: string; amount: string });
        });
        console.log("Updated transactions after save:", transactionsList);
        setTransactions(transactionsList); // Update local state with latest data
      } catch (error) {
        console.error("Error adding document:", error);
      }
    }
    setAmount(''); // Clear the input after saving
  };

  const handleTransactionClick = (transaction: { type: string; amount: string }) => {
    // Navigate to the transaction confirmation page
    navigate('/transaction-confirmation', { state: transaction });
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
              <div key={index} className="transaction-box" onClick={() => handleTransactionClick(transaction)}>
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
            <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)} className="select-box1">
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
              className="select-box1"
              placeholder="Enter amount here"
            />
          </div>

          {/* Save button */}
          <button onClick={handleSave} className="save-button">Add</button>
        </div>
      </div>
      <WatsonChat /> {/* Add Watson Chat component here */}
    </div>
  );
};

export default Shortcuts;
