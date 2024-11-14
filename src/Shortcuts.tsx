import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OCBCLogo from './images/OCBC-Logo.png';
import { db, collection, addDoc, getDocs } from './firebaseConfig';

interface LocationState {
  userID: string;
}

const Shortcuts: React.FC = () => {
  const [transactionType, setTransactionType] = useState('Cash Withdrawal');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<{ type: string; amount: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostFrequentAmount, setMostFrequentAmount] = useState<string | null>(null); // For frequent withdrawal amount
  const navigate = useNavigate();

  // Retrieve userID from location state (passed during navigation)
  const location = useLocation();
  const theme = location.state?.theme || 'light';
  const state = location.state as LocationState & { theme: string };
  const userID = location.state?.userID;

  // Check if userID exists   
  useEffect(() => {
    if (!userID) {
      console.error("No user ID found. Cannot proceed.");
      navigate('/'); 
    } else {
      setLoading(false); 
    }
  }, [userID, navigate]);

  // Fetch most frequent withdrawal amount
  const fetchFrequentAmount = async () => {
    if (!userID) return;

    const transactionsRef = collection(db, 'users', userID, 'transactions');
    const querySnapshot = await getDocs(transactionsRef);

    const frequencyMap: Record<string, number> = {};
    querySnapshot.forEach((doc) => {
      const transaction = doc.data();
      const amount = transaction.amount.toString();
      frequencyMap[amount] = (frequencyMap[amount] || 0) + 1;
    });

    let mostFrequentAmount = null;
    let maxCount = 0;
    for (const [amount, count] of Object.entries(frequencyMap)) {
      if (count > maxCount) {
        mostFrequentAmount = amount;
        maxCount = count;
      }
    }

    setMostFrequentAmount(mostFrequentAmount);  
  };

  useEffect(() => {
    if (userID) {
      fetchFrequentAmount();
    }
  }, [userID]);

  useEffect(() => {
    if (userID) {
      const fetchTransactions = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'users', userID, 'shortcuts'));
          const transactionsList: { type: string; amount: string }[] = [];
          querySnapshot.forEach((doc) => {
            transactionsList.push(doc.data() as { type: string; amount: string });
          });
          setTransactions(transactionsList);
        } catch (error) {
          console.error("Error fetching transactions:", error);
        }
      };

      fetchTransactions();
    }
  }, [userID]);

  const handleSave = async () => {
    if (!userID) {
      console.error("No user ID found. Cannot save transaction.");
      return;
    }

    if (transactions.length < 4) { // Limit to 4 saved transactions
      const newTransaction = { type: transactionType, amount };
      console.log("Saving new transaction:", newTransaction);

      try {
        await addDoc(collection(db, 'users', userID, 'shortcuts'), newTransaction);
        const querySnapshot = await getDocs(collection(db, 'users', userID, 'shortcuts'));
        const transactionsList: { type: string; amount: string }[] = [];
        querySnapshot.forEach((doc) => {
          transactionsList.push(doc.data() as { type: string; amount: string });
        });
        setTransactions(transactionsList); 
      } catch (error) {
        console.error("Error adding document:", error);
      }
    }
    setAmount(''); 
  };

  const handleTransactionClick = (transaction: { type: string; amount: string }) => {
    if (userID) {
      navigate('/transaction-confirmation', { state: { type: transaction.type, amount: transaction.amount, userId: userID, theme} });
    } else {
      alert("No user ID found.");
      navigate('/');
    }
  };  

  return (
    <div className={`home-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      <div className="home-content1">
        <div className="home-grid1">
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Shortcuts
          </h1>

          {/* Display Suggested Frequent Withdrawal */}
          {mostFrequentAmount && (
            <div className="transaction-box" onClick={() => handleTransactionClick({ type: 'Frequent Withdrawal', amount: mostFrequentAmount })}>
              <p>Suggested Frequent Withdrawal: ${mostFrequentAmount}</p>
            </div>
          )}

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
          <p className={`transaction-info ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
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
        
         {/* Go Back button below Save button */}
          <button onClick={() => navigate('/home', { state: { userID } })} className="go-back-button1">Go Back</button>
        </div>
      </div>
    </div>
  );
};

export default Shortcuts;
