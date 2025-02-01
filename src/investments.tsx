import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore"; 
import { db } from "./firebaseConfig";
import axios from "axios";
import Chart from "chart.js/auto";
import OCBCLogo from "./images/OCBC-Logo.png";
// Chua Qi An IT04 S10258309E :D
// Define the structure of an investment
interface Investment {
  id: string;
  name: string;
  symbol: string;
  units: number;
  totalValue?: number; 
}

// Define the structure of the location state passed via navigation
interface LocationState {
  userID: string; // Unique identifier for the user
  theme?: string; // Theme preference (optional)
}

// Define the structure of the API response
interface TimeSeriesResponse {
  Note?: string; // check rate limit warnings
  "Error Message"?: string; // for invalid API key errors
  "Time Series (60min)"?: Record<string, { "4. close": string }>;
  "Weekly Time Series"?: Record<string, { "4. close": string }>;
  "Monthly Time Series"?: Record<string, { "4. close": string }>;
}

const AlphaVantageAPI = "https://www.alphavantage.co/query";
const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

const Investments: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]); // Stores the user's investments
  const [theme, setTheme] = useState("light"); // Theme preference
  const [loading, setLoading] = useState(true); // Loading state
  const [selectedView, setSelectedView] = useState<"daily" | "weekly" | "monthly">("daily"); // Timeframe for graphs
  const [investmentStatus, setInvestmentStatus] = useState<boolean>(false); // Tracks if investments exist

  const navigate = useNavigate(); // For navigation
  const location = useLocation();
  const state = location.state as LocationState;
  const userID = state?.userID; // Retrieve userID from navigation state
  const chartsRef = useRef<Map<string, Chart>>(new Map()); // Keeps track of rendered charts by symbol

  // Fetch user data from Firestore on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userID) {
        // Redirect to home page if no userID is found
        navigate("/");
        return;
      }

      try {
        // Fetch user preferences from Firestore
        const preferencesRef = doc(db, "preferences", userID);
        const preferencesSnap = await getDoc(preferencesRef);

        if (preferencesSnap.exists()) {
          const data = preferencesSnap.data();
          setTheme(data.theme || "light"); // Set theme preference
        }

        // Fetch user investments from Firestore
        const investmentsRef = doc(db, "investments", userID);
        const investmentsSnap = await getDoc(investmentsRef);

        if (investmentsSnap.exists()) {
          const data = investmentsSnap.data();
          const investmentsArray = data.investments || [];
          setInvestments(investmentsArray); // Update investments state
          setInvestmentStatus(data.investmentStatus || false); // Update investment status
        } else {
          setInvestments([]); // No investments linked
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchUserData();
  }, [userID, navigate]);

  // Fetch stock data from Alpha Vantage API
  const fetchGraphData = async (symbol: string) => {
    try {
      // API function mappings for different timeframes
      const timeSeriesFunctions: Record<string, string> = {
        daily: "TIME_SERIES_INTRADAY",
        weekly: "TIME_SERIES_WEEKLY",
        monthly: "TIME_SERIES_MONTHLY",
      };

      // Make the API call
      const response = await axios.get<TimeSeriesResponse>(AlphaVantageAPI, {
        params: {
          function: timeSeriesFunctions[selectedView],
          symbol,
          interval: selectedView === "daily" ? "60min" : undefined,
          apikey: API_KEY,
        },
      });

      if (response.data.Note) {
        // Handle API rate limits
        console.warn("API Rate Limit Exceeded:", response.data.Note);
        alert("API rate limit exceeded. Please try again later.");
        return null;
      }

      if (response.data["Error Message"]) {
        // Handle invalid API keys
        console.error("Invalid or Expired API Key:", response.data["Error Message"]);
        alert("Invalid or expired API key. Please use a valid API key.");
        return null;
      }

      // Determine the key for the selected timeframe
      const timeSeriesKey =
        selectedView === "daily"
          ? "Time Series (60min)"
          : selectedView === "weekly"
          ? "Weekly Time Series"
          : "Monthly Time Series";

      const timeSeries = (response.data as any)[timeSeriesKey];

      if (!timeSeries) {
        // Handle cases where data is unavailable
        alert(`Data unavailable for ${symbol}.`);
        return null;
      }

      // Extract labels (dates) and data (prices) for the graph
      const labels = Object.keys(timeSeries).slice(0, 10).reverse();
      const data = labels.map((date) => parseFloat(timeSeries[date]["4. close"]));

      return { labels, data };
    } catch (err) {
      console.error("Error fetching graph data:", err);
      return null;
    }
  };

  // Render the graph for a specific investment
  const renderGraph = async (investment: Investment) => {
    const graphData = await fetchGraphData(investment.symbol);
    if (!graphData) return;

    const canvas = document.getElementById(`chart-${investment.symbol}`) as HTMLCanvasElement;

    // Destroy the existing chart if it exists
    if (chartsRef.current.has(investment.symbol)) {
      chartsRef.current.get(investment.symbol)?.destroy();
      chartsRef.current.delete(investment.symbol);
    }

    // Create a new chart instance
    const newChart = new Chart(canvas, {
      type: "line",
      data: {
        labels: graphData.labels,
        datasets: [
          {
            label: `${investment.symbol} ${selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} Price`,
            data: graphData.data,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
          },
        ],
      },
    });

    // Save the chart instance in the ref
    chartsRef.current.set(investment.symbol, newChart);
  };

  // Re-render graphs when investments or selectedView changes
  useEffect(() => {
    investments.forEach((investment) => {
      renderGraph(investment);
    });
  }, [investments, selectedView]);

  // Add predefined stocks to Firestore for testing purposes
  const addStockToFirestore = async () => {
    if (!userID) {
      alert("User not logged in!");
      return;
    }

    try {
      const investmentsRef = doc(db, "investments", userID);
      const investmentsSnap = await getDoc(investmentsRef);

      let currentInvestments: Investment[] = [];
      if (investmentsSnap.exists()) {
        currentInvestments = investmentsSnap.data()?.investments || [];
      }

      // Predefined stocks to add
      const newStocks: Investment[] = [
        { id: "NVDA", name: "NVIDIA Corp", symbol: "NVDA", units: 10 },
        { id: "TSLA", name: "Tesla Inc", symbol: "TSLA", units: 5 },
      ];

      const updatedInvestments = [...currentInvestments, ...newStocks];

      await updateDoc(investmentsRef, {
        investments: updatedInvestments,
        investmentStatus: true, // Update status to true
      });

      setInvestments(updatedInvestments); // Update local state
      setInvestmentStatus(true); // Mark status as true
      alert("Added NVDA and TSLA stocks!");
    } catch (error) {
      console.error("Error adding stocks:", error);
      alert("Failed to add stocks. Try again.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className={`investments-container ${theme === "dark" ? "dark-theme" : "light-theme"}`}>
      {/* Header section */}
      <div className="header">
        <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo" />
        <h1>{investments.length > 0 ? "Your Investments" : "No Investments Linked"}</h1>
        {!investmentStatus && (
          <button className="add-stock-button" onClick={addStockToFirestore}>
            Add Stocks
          </button>
        )}
      </div>
      <button onClick={() => navigate("/home", { state: { userID, theme } })} className="back-invest-button"> Back </button>

      {/* Investment cards */}
      {investments.length > 0 ? (
        investments.map((investment) => (
          <div key={investment.id} className="investment-card">
            <h2>
              {investment.name} ({investment.symbol})
            </h2>
            <p>Units: {investment.units}</p>
            <canvas id={`chart-${investment.symbol}`} width="400" height="200"></canvas>
            <div className="investment-time-container">
              <button
                onClick={() => setSelectedView("daily")}
                className={selectedView === "daily" ? "active" : ""}
              >
                Daily
              </button>
              <button
                onClick={() => setSelectedView("weekly")}
                className={selectedView === "weekly" ? "active" : ""}
              >
                Weekly
              </button>
              <button
                onClick={() => setSelectedView("monthly")}
                className={selectedView === "monthly" ? "active" : ""}
              >
                Monthly
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No investments to display. Add investments to see details.</p>
      )}

      {/* Liquidate Investment button */}
      {investments.length > 0 && (
        <button
          className="liquidate-container"
          onClick={() => navigate("/liquidateinvestment", { state: { investments, userID } })}
        >
          Liquidate Investment
        </button>
      )}
    </div>
  );
};

export default Investments;
