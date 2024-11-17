import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OCBCLogo from './images/OCBC-Logo.png';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, doc, getDoc } from "firebase/firestore";

interface LocationState {
  userID: string;
}

const Shortcuts: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const userID = state?.userID;

  const [transactionType, setTransactionType] = useState('Cash Withdrawal');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<{ type: string; amount: string }[]>([]);
  const [mostFrequentAmount, setMostFrequentAmount] = useState<string | null>(null);
  const [theme, setTheme] = useState('light');
  const [textToSpeech, setTextToSpeech] = useState(false);

  // Fetch preferences and transactions when userID is available
  useEffect(() => {
    if (!userID) {
      console.error("No user ID found. Redirecting to login.");
      navigate('/');
    } else {
      fetchPreferences();
      fetchFrequentAmount();
      fetchTransactions();
    }
  }, [userID, navigate]);

  // Fetch user preferences, exactly as in Home.tsx and Preference.tsx
  const fetchPreferences = async () => {
    if (userID) {
      const preferencesRef = doc(db, "preferences", userID);
      const docSnap = await getDoc(preferencesRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setTheme(data.theme || 'light');
        setTextToSpeech(data.textToSpeech || false);

        // Apply theme settings to document
        document.documentElement.setAttribute('data-theme', data.theme);
      } else {
        console.error("Preferences not found.");
      }
    }
  };

  // Text-to-Speech functionality, copied from Preference.tsx
  const speak = (text: string) => {
    if (textToSpeech && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTextClick = (text: string) => {
    if (textToSpeech) speak(text);
  };

  // Fetch the most frequent withdrawal amount, similar to Home.tsx
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

  // Fetch saved shortcut transactions, similar to Home.tsx
  const fetchTransactions = async () => {
    if (userID) {
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
    }
  };

  // Save a new shortcut transaction
  const handleSave = async () => {
    if (transactions.length < 4) { // Limit to 4 saved transactions
      const newTransaction = { type: transactionType, amount };
      try {
        await addDoc(collection(db, 'users', userID, 'shortcuts'), newTransaction);
        fetchTransactions(); // Refresh the list after adding
        setAmount(''); // Clear input field
      } catch (error) {
        console.error("Error adding document:", error);
      }
    }
  };

  // Click handler for navigating to transaction confirmation
  const handleTransactionClick = (transaction: { type: string; amount: string }) => {
    navigate('/transaction-confirmation', { 
      state: { type: transaction.type, amount: transaction.amount, userId: userID, theme } // Ensure `userId` and `theme` are passed correctly
    });
  };

  // Single-click for TTS, double-click for action on buttons, copied from Home.tsx
  const handleButtonClick = (label: string, action: () => void) => {
    if (textToSpeech) {
      return {
        onClick: () => handleTextClick(label),
        onDoubleClick: action,
      };
    } else {
      return { onClick: action };
    }
  };

  return (
    <div className={`home-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      <div className="home-content1">
        <div className="home-grid1">
          <h1
            className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}
            onClick={() => handleTextClick("Shortcuts")}
          >
            Shortcuts
          </h1>

          {/* Display Suggested Frequent Withdrawal */}
          {mostFrequentAmount && (
            <div
              className="transaction-box"
              {...handleButtonClick(`Suggested Frequent Withdrawal: $${mostFrequentAmount}`, () => handleTransactionClick({ type: 'Frequent Withdrawal', amount: mostFrequentAmount }))}
            >
              <p>Suggested Frequent Withdrawal: ${mostFrequentAmount}</p>
            </div>
          )}

          {/* Saved transactions directly under Shortcuts */}
          <div className="saved-transactions">
            {transactions.map((transaction, index) => (
              <div
                key={index}
                className="transaction-box"
                {...handleButtonClick(`${transaction.type}: $${transaction.amount}`, () => handleTransactionClick(transaction))}
              >
                {transaction.type}: ${transaction.amount}
              </div>
            ))}
          </div>
        </div>

        {/* Transaction input section on the right side */}
        <div className="transaction-container">
          <p
            className={`transaction-info ${theme === 'dark' ? 'text-white' : 'text-black'}`}
            onClick={() => handleTextClick("Choose the transaction type you would like to add into Shortcuts")}
          >
            <b>Choose the transaction type you would like to add into Shortcuts</b>
          </p>

          {/* Dropdown for transaction type */}
          <div className="transaction-dropdown">
            <label className="label" onClick={() => handleTextClick("Select Transaction Type")}>Select Transaction Type:</label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="select-box1"
            >
              <option value="Cash Withdrawal">Cash Withdrawal</option>
              <option value="Fund Transfer">Fund Transfer</option>
            </select>
          </div>

          {/* Input for amount */}
          <div className="amount-input">
            <label className="label" onClick={() => handleTextClick("Enter the Amount")}>Enter the Amount:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="select-box1"
              placeholder="Enter amount here"
              onClick={() => handleTextClick("Amount entry field")}
            />
          </div>

          {/* Save button */}
          <button className="save-button" {...handleButtonClick("Add transaction", handleSave)}>Add</button>

          {/* Go Back button below Save button */}
          <button
            {...handleButtonClick("Go Back", () => navigate('/home', { state: { userID } }))}
            className="go-back-button1"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Shortcuts;
