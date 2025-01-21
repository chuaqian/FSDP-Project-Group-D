import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import axios from "axios";
import Chart from "chart.js/auto"; // For graph rendering
import OCBCLogo from "./images/OCBC-Logo.png";

interface Investment {
  id: string;
  name: string;
  symbol: string;
  units: number;
  totalValue?: number;
}

interface LocationState {
  userID: string;
  theme?: string;
}

interface AlphaVantageResponse {
  bestMatches: {
    "1. symbol": string;
    "2. name": string;
  }[];
}

interface TimeSeriesDailyResponse {
  "Time Series (Daily)": {
    [date: string]: {
      "4. close": string;
    };
  };
}

const AlphaVantageAPI = "https://www.alphavantage.co/query";
const API_KEY = "CGXHLVNW7NF2NM3I"; // Replace with your Alpha Vantage API key

const Investments: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);
  const [investmentStatus, setInvestmentStatus] = useState(false);
  const [stockOptions, setStockOptions] = useState<{ name: string; symbol: string }[]>([]);
  const [newStock, setNewStock] = useState("");
  const [units, setUnits] = useState<number | "">(""); // Allow empty string for controlled input
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const userID = state?.userID;

  // Fetch user preferences and investmentStatus
  useEffect(() => {
    const fetchPreferencesAndStatus = async () => {
      if (userID) {
        try {
          const preferencesRef = doc(db, "preferences", userID);
          const investmentsRef = doc(db, "investments", userID);
          const preferencesSnap = await getDoc(preferencesRef);
          const investmentsSnap = await getDoc(investmentsRef);

          if (preferencesSnap.exists()) {
            const data = preferencesSnap.data();
            setTheme(data.theme || "light");
          }

          if (investmentsSnap.exists()) {
            setInvestmentStatus(investmentsSnap.data().investmentStatus || false);
          }
        } catch (err) {
          console.error("Error fetching preferences or investment status:", err);
        }
      } else {
        navigate("/");
      }
    };

    fetchPreferencesAndStatus();
  }, [userID, navigate]);

  // Fetch user investments
  useEffect(() => {
    const fetchInvestments = async () => {
      if (investmentStatus && userID) {
        try {
          const investmentsRef = collection(db, "users", userID, "investments");
          const querySnapshot = await getDocs(investmentsRef);
          const fetchedInvestments: Investment[] = [];

          querySnapshot.forEach((doc) => {
            fetchedInvestments.push({
              id: doc.id,
              name: doc.data().name,
              symbol: doc.data().symbol,
              units: doc.data().units,
            });
          });

          setInvestments(fetchedInvestments);
        } catch (err) {
          console.error("Error fetching investments:", err);
        }
      }
      setLoading(false);
    };

    fetchInvestments();
  }, [investmentStatus, userID]);

  // Add new investment
  const addInvestment = async () => {
    if (!userID || !newStock || !units || units <= 0) {
      alert("Please select a stock and enter a valid number of units.");
      return;
    }

    try {
      const investmentsRef = collection(db, "users", userID, "investments");
      const stockDetails = stockOptions.find((stock) => stock.symbol === newStock);

      if (stockDetails) {
        await setDoc(doc(investmentsRef, stockDetails.symbol), {
          name: stockDetails.name,
          symbol: stockDetails.symbol,
          units: units,
        });

        setInvestments([
          ...investments,
          { id: stockDetails.symbol, name: stockDetails.name, symbol: stockDetails.symbol, units },
        ]);

        await setDoc(doc(db, "investments", userID), {
          investmentStatus: true,
        });

        setInvestmentStatus(true);
        setNewStock("");
        setUnits("");

        alert("Investment added successfully!");
      }
    } catch (err) {
      console.error("Error adding investment:", err);
    }
  };

  // Fetch stock options using Alpha Vantage API
  const fetchStockOptions = async (searchQuery: string) => {
    if (!searchQuery) {
      setStockOptions([]);
      return;
    }

    try {
      const response = await axios.get<AlphaVantageResponse>(AlphaVantageAPI, {
        params: {
          function: "SYMBOL_SEARCH",
          keywords: searchQuery,
          apikey: API_KEY,
        },
      });

      const results = response.data.bestMatches || [];
      setStockOptions(
        results.map((result) => ({
          name: result["2. name"],
          symbol: result["1. symbol"],
        }))
      );
    } catch (err) {
      console.error("Error fetching stock options:", err);
      setError("Failed to fetch stock options.");
    }
  };

  // Fetch graph data for chart rendering
  const fetchGraphData = async (symbol: string) => {
    try {
      const response = await axios.get<TimeSeriesDailyResponse>(AlphaVantageAPI, {
        params: {
          function: "TIME_SERIES_DAILY",
          symbol: symbol,
          apikey: API_KEY,
        },
      });

      const timeSeries = response.data["Time Series (Daily)"];
      const labels = Object.keys(timeSeries).slice(0, 10).reverse();
      const data = labels.map((date) =>
        parseFloat(timeSeries[date]["4. close"])
      );

      const canvas = document.getElementById(`chart-${symbol}`) as HTMLCanvasElement;
      new Chart(canvas, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: `${symbol} Price`,
              data,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 2,
            },
          ],
        },
      });
    } catch (err) {
      console.error("Error fetching graph data:", err);
    }
  };

  useEffect(() => {
    investments.forEach((investment) => {
      fetchGraphData(investment.symbol);
    });
  }, [investments]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className={`investments-container ${theme === "dark" ? "dark-theme" : "light-theme"}`}>
      <div className="header">
        <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo" />
        <h1>{investmentStatus ? "Your Investments" : "No Investments Linked"}</h1>
      </div>
      {investmentStatus ? (
        investments.map((investment) => (
          <div key={investment.id} className="investment-card">
            <h2>{investment.name} ({investment.symbol})</h2>
            <p>Units: {investment.units}</p>
            <canvas id={`chart-${investment.symbol}`} width="400" height="200"></canvas>
          </div>
        ))
      ) : (
        <div className="centered-container">
          <input
            type="text"
            placeholder="Search stock..."
            onChange={(e) => fetchStockOptions(e.target.value)}
          />
          <select value={newStock} onChange={(e) => setNewStock(e.target.value)}>
            {stockOptions.map((stock) => (
              <option key={stock.symbol} value={stock.symbol}>
                {stock.name} ({stock.symbol})
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Units"
            value={units === "" ? "" : units}
            onChange={(e) => setUnits(e.target.value ? parseInt(e.target.value) : "")}
          />
          <button onClick={addInvestment}>Add Investment</button>
        </div>
      )}
    </div>
  );
};

export default Investments;
