import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore"; // Added setDoc
import { db } from "./firebaseConfig";
import axios from "axios";
import Chart from "chart.js/auto";
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

interface TimeSeriesResponse {
  Note?: string;
  "Error Message"?: string;
  "Time Series (60min)"?: Record<string, { "4. close": string }>;
  "Weekly Time Series"?: Record<string, { "4. close": string }>;
  "Monthly Time Series"?: Record<string, { "4. close": string }>;
}

const AlphaVantageAPI = "https://www.alphavantage.co/query";
const API_KEY = "VJI2Z5BJA4CPU9OT";

const Investments: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<"daily" | "weekly" | "monthly">("daily");
  const [investmentStatus, setInvestmentStatus] = useState<boolean>(false); // Added investmentStatus

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const userID = state?.userID;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userID) {
        navigate("/");
        return;
      }

      try {
        const preferencesRef = doc(db, "preferences", userID);
        const preferencesSnap = await getDoc(preferencesRef);

        if (preferencesSnap.exists()) {
          const data = preferencesSnap.data();
          setTheme(data.theme || "light");
        }

        const investmentsRef = doc(db, "investments", userID);
        const investmentsSnap = await getDoc(investmentsRef);

        if (investmentsSnap.exists()) {
          const data = investmentsSnap.data();
          const investmentsArray = data.investments || [];
          setInvestments(investmentsArray);
          setInvestmentStatus(data.investmentStatus || false); // Set investmentStatus
        } else {
          setInvestments([]);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userID, navigate]);

  const fetchGraphData = async (symbol: string) => {
    try {
      const timeSeriesFunctions: Record<string, string> = {
        daily: "TIME_SERIES_INTRADAY",
        weekly: "TIME_SERIES_WEEKLY",
        monthly: "TIME_SERIES_MONTHLY",
      };

      const response = await axios.get<TimeSeriesResponse>(AlphaVantageAPI, {
        params: {
          function: timeSeriesFunctions[selectedView],
          symbol,
          interval: selectedView === "daily" ? "60min" : undefined,
          apikey: API_KEY,
        },
      });

      if (response.data.Note) {
        console.warn("API Rate Limit Exceeded:", response.data.Note);
        alert("API rate limit exceeded. Please try again later.");
        return null;
      }

      if (response.data["Error Message"]) {
        console.error("Invalid or Expired API Key:", response.data["Error Message"]);
        alert("Invalid or expired API key. Please use a valid API key.");
        return null;
      }

      const timeSeriesKey =
        selectedView === "daily"
          ? "Time Series (60min)"
          : selectedView === "weekly"
          ? "Weekly Time Series"
          : "Monthly Time Series";

      const timeSeries = (response.data as any)[timeSeriesKey];

      if (!timeSeries) {
        alert(`Data unavailable for ${symbol}.`);
        return null;
      }

      const labels = Object.keys(timeSeries).slice(0, 10).reverse();
      const data = labels.map((date) => parseFloat(timeSeries[date]["4. close"]));

      return { labels, data };
    } catch (err) {
      console.error("Error fetching graph data:", err);
      return null;
    }
  };

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

      // Add NVDA and TSLA stocks
      const newStocks: Investment[] = [
        { id: "NVDA", name: "NVIDIA Corp", symbol: "NVDA", units: 10 },
        { id: "TSLA", name: "Tesla Inc", symbol: "TSLA", units: 5 },
      ];

      const updatedInvestments = [...currentInvestments, ...newStocks];

      await updateDoc(investmentsRef, {
        investments: updatedInvestments,
        investmentStatus: true, // Update investmentStatus to true
      });

      setInvestments(updatedInvestments);
      setInvestmentStatus(true); // Update local state
      alert("Added NVDA and TSLA stocks!");
    } catch (error) {
      console.error("Error adding stocks:", error);
      alert("Failed to add stocks. Try again.");
    }
  };

  useEffect(() => {
    const renderGraphs = async () => {
      investments.forEach(async (investment) => {
        const graphData = await fetchGraphData(investment.symbol);

        if (graphData) {
          const canvas = document.getElementById(`chart-${investment.symbol}`) as HTMLCanvasElement;
          new Chart(canvas, {
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
        }
      });
    };

    renderGraphs();
  }, [investments, selectedView]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className={`investments-container ${theme === "dark" ? "dark-theme" : "light-theme"}`}>
      <div className="header">
        <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo" />
        <h1>{investments.length > 0 ? "Your Investments" : "No Investments Linked"}</h1>
        {!investmentStatus && (
          <button className="add-stock-button" onClick={addStockToFirestore}>
            Add NVDA & TSLA Stocks
          </button>
        )}
      </div>
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
    </div>
  );
};

export default Investments;
