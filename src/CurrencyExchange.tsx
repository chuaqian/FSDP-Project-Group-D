import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import OCBCLogo from './images/OCBC-Logo.png';
import { addDoc, collection, Timestamp, doc, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

// Interface for the response from the currency exchange API
interface ExchangeRateResponse {
  conversion_rates: {
    [key: string]: number; // The rates, where the key is the currency code and the value is the exchange rate
  };
}

interface LocationState {
  userID: string;
  theme?: string;
}

const CurrencyExchange: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const userID = state?.userID;

  const [theme, setTheme] = useState('light');
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredCurrencies, setFilteredCurrencies] = useState<{ currency: string; rate: number }[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [selectedRate, setSelectedRate] = useState<number | null>(null);
  const [sgdAmount, setSgdAmount] = useState<number>(1);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

  // Function to fetch user preferences
  const fetchPreferences = async (userID: string) => {
    const preferencesRef = collection(db, "preferences");
    const querySnapshot = await getDocs(preferencesRef);

    querySnapshot.forEach((doc) => {
      if (doc.id === userID) {
        const data = doc.data();
        setTextToSpeech(data.textToSpeech || false);
      }
    });
  };

  // Effect to manage theme and fetch user preferences
  useEffect(() => {
    const savedTheme = state?.theme || localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (!userID) {
      console.error('No user ID found in Currency Exchange page.');
      navigate('/');
    } else {
      fetchPreferences(userID);
    }
  }, [userID, navigate, state?.theme]);

  // Effect to fetch exchange rates
  useEffect(() => {
    const API_KEY = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;
    const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/SGD`;

    const fetchExchangeRates = async () => {
      try {
        const response = await axios.get<ExchangeRateResponse>(BASE_URL);
        setExchangeRates(response.data.conversion_rates);
        setLoading(false);
      } catch (err) {
        setError('Error fetching exchange rates');
        setLoading(false);
      }
    };

    fetchExchangeRates();

    // Auto-refresh every 24 hours
    const interval = setInterval(fetchExchangeRates, 86400000);
    return () => clearInterval(interval);
  }, []);

  // Effect to handle search filtering
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCurrencies([]);
      return;
    }

    const filtered = Object.keys(exchangeRates)
      .filter((currency) => currency.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((currency) => ({ currency, rate: exchangeRates[currency] }));

    setFilteredCurrencies(filtered);
  }, [searchTerm, exchangeRates]);

  // Handle currency selection
  const handleCurrencyClick = (currency: string, rate: number) => {
    setSelectedCurrency(currency);
    setSelectedRate(rate);
    setConvertedAmount(rate * sgdAmount);
  };

  // Handle SGD input change
  const handleSgdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = parseFloat(e.target.value) || 0;
    setSgdAmount(newAmount);
    if (selectedRate !== null) setConvertedAmount(newAmount * selectedRate);
  };

  // Handle foreign currency input change
  const handleForeignChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = parseFloat(e.target.value) || 0;
    setConvertedAmount(newAmount);
    if (selectedRate !== null) setSgdAmount(newAmount / selectedRate);
  };

  const handleTransfer = () => {
    // Round the amount to 2 decimal places
    const roundedAmount = parseFloat(sgdAmount.toFixed(2));
  
    // Pass the rounded amount to the transfer page
    navigate('/transfer', { 
      state: { 
        userID, 
        theme, 
        sgdAmount: roundedAmount,  // Pass the rounded SGD amount
        selectedCurrency  // Pass the selected currency
      } 
    });
  };

  // Handle Text-to-Speech
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

  const handleWithdraw = async () => {
    if (!userID) {
      alert("User ID not found.");
      return;
    }

    if (sgdAmount <= 0) {
      alert("Please enter a valid amount to withdraw.");
      return;
    }

    const roundedAmount = parseFloat(sgdAmount.toFixed(2)); // Round to 2 decimal places
  
    try {
      await addDoc(collection(db, "users", userID, "transactions"), {
        amount: roundedAmount,
        currency: "SGD",
        timestamp: Timestamp.now()
      });

      console.log("Transaction stored successfully!");
      navigate('/Withdraw', { state: { userID, theme, withdrawnAmount: roundedAmount } });
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Error processing withdrawal. Please try again.");
    }
  };

  if (loading) return <p>Loading exchange rates...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={`home-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      <div className="home-content">
        <h2 className={`currency-exchange-heading ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          Currency Exchange
        </h2>

        <div className="currency-search-container">
          {/* Currency Table (Left Side) */}
          <div className="currency-container">
            <table className="currency-table">
              <thead>
                <tr>
                  <th>Currency</th>
                  <th>Exchange Rate (to SGD)</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(exchangeRates).map((currency) => (
                  <tr key={currency} onClick={() => handleCurrencyClick(currency, exchangeRates[currency])} className="clickable-row">
                    <td>{currency}</td>
                    <td>{exchangeRates[currency].toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right Side: Search Bar + Conversion Box */}
          <div className="right-container">
            {/* Search Bar */}
            <div className="search-container">
              <input
                type="text"
                placeholder="Search currency..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-bar"
              />
              {filteredCurrencies.length > 0 && (
                <ul className="dropdown">
                  {filteredCurrencies.map(({ currency, rate }) => (
                    <li key={currency} className="dropdown-item" onClick={() => handleCurrencyClick(currency, rate)}>
                      {currency}: {rate.toFixed(4)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Conversion Box (Now directly below the search bar) */}
            <div className="conversion-box">
              <h3>Conversion Rate</h3>
              {/* First row: SGD$ input box */}
              <div className="input-row">
                <label>SGD</label>
                <input 
                  type="number" 
                  value={sgdAmount} 
                  onChange={handleSgdChange} 
                  className="amount-inputs" 
                />
              </div>

              {/* Second row: equals sign */}
              <div className="equal-row">
                <span>=</span>
                <span> &gt; </span>
              </div>

              {/* Third row: Foreign currency input box */}
              <div className="input-row">
                <label>{selectedCurrency ? selectedCurrency : "Select Currency"}</label>
                <input 
                  type="number" 
                  value={convertedAmount || ""} 
                  onChange={handleForeignChange} 
                  className="amount-inputs" 
                  disabled={!selectedCurrency} 
                />
              </div>

              {/* Transfer Button */}
              <div className="button-container">
                <button onClick={handleWithdraw} className="withdraw-button">
                  Withdraw
                </button>
                <button onClick={handleTransfer} className="transfer-button">
                    Transfer
                  </button>
                </div>
            </div>

            {/* Back to Home Button */}
            <div className="back-to-home-container">
              <button
                onClick={() => handleTextClick("Go Back")}
                onDoubleClick={() => navigate('/Home', { state: { userID, theme } })}
                className="back-to-home-button"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyExchange;