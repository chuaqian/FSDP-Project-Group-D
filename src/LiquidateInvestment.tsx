import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig"; // Firestore database configuration
import axios from "axios"; // For API calls
import Chart from "chart.js/auto"; // Chart.js for rendering graphs
// Chua Qi An IT04 S10258309E :D
// Define the structure of an investment object
interface Investment {
  id: string;
  name: string;
  symbol: string;
  units: number;
}

// Define the structure of the location state passed via navigation
interface LocationState {
  investments: Investment[]; // List of investments
  userID: string; // User's unique identifier
}

const AlphaVantageAPI = "https://www.alphavantage.co/query";
const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY; // API key from environment variables

const LiquidateInvestment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { investments, userID } = location.state as LocationState; // Extract investments and userID from navigation state

  // Component states
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null); // The currently selected investment
  const [currentPrice, setCurrentPrice] = useState<number | null>(null); // Current price of the selected stock
  const [loadingPrice, setLoadingPrice] = useState(false); // Loading state for stock price
  const [showConfirm, setShowConfirm] = useState(false); // State for confirmation modal
  const [unitsToSell, setUnitsToSell] = useState<number>(0); // Number of units to sell
  const [isDispensing, setIsDispensing] = useState(false); // State for dispensing cash
  const [dispenseAmount, setDispenseAmount] = useState<number | null>(null); // Amount to dispense in cash

  const SGD_CONVERSION_RATE = 1.35; // Conversion rate from USD to SGD

  // Fetch stock data and render graph for the selected stock
  const fetchStockData = async (symbol: string) => {
    try {
      setLoadingPrice(true); // Set loading state

      // Define the structure of the API response
      interface TimeSeriesResponse {
        "Time Series (60min)"?: Record<string, { "4. close": string }>;
      }

      // Make an API call to fetch stock data
      const response = await axios.get<TimeSeriesResponse>(AlphaVantageAPI, {
        params: {
          function: "TIME_SERIES_INTRADAY",
          symbol,
          interval: "60min",
          apikey: API_KEY,
        },
      });

      // Extract the time series data
      const timeSeries = response.data["Time Series (60min)"];
      if (timeSeries) {
        const latestClose = parseFloat(Object.values(timeSeries)[0]["4. close"]); // Get the latest closing price
        setCurrentPrice(latestClose); // Update current price state

        // Render the graph using Chart.js
        const canvas = document.getElementById(`chart-${symbol}`) as HTMLCanvasElement;
        if (canvas) {
          new Chart(canvas, {
            type: "line",
            data: {
              labels: Object.keys(timeSeries).slice(0, 10).reverse(), // Use the last 10 data points
              datasets: [
                {
                  label: `${symbol} Price (USD)`,
                  data: Object.keys(timeSeries)
                    .slice(0, 10)
                    .reverse()
                    .map((date) => parseFloat(timeSeries[date]["4. close"])), // Extract closing prices
                  borderColor: "rgba(75, 192, 192, 1)",
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  borderWidth: 2,
                },
              ],
            },
          });
        }
      } else {
        throw new Error("Time Series data not available.");
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setCurrentPrice(null); // Reset price on error
    } finally {
      setLoadingPrice(false); // Reset loading state
    }
  };

  // Handle selecting an investment to liquidate
  const handleSelectInvestment = (investment: Investment) => {
    setSelectedInvestment(investment); // Set the selected investment
    setCurrentPrice(null); // Reset price
    setUnitsToSell(0); // Reset the number of units to sell
    fetchStockData(investment.symbol); // Fetch stock data
  };

  // Handle confirming liquidation
  const handleConfirmLiquidation = async () => {
    if (!selectedInvestment || unitsToSell <= 0 || unitsToSell > selectedInvestment.units) return;

    try {
      // Reference the Firestore document for investments
      const investmentsRef = doc(db, "investments", userID);

      // Calculate the remaining units after selling
      const remainingUnits = selectedInvestment.units - unitsToSell;

      // Update the investment list with the new units or remove the investment if all units are sold
      const updatedInvestments =
        remainingUnits > 0
          ? investments.map((investment) =>
              investment.id === selectedInvestment.id
                ? { ...investment, units: remainingUnits }
                : investment
            )
          : investments.filter((investment) => investment.id !== selectedInvestment.id);

      // Update the Firestore document
      await updateDoc(investmentsRef, {
        investments: updatedInvestments,
        investmentStatus: updatedInvestments.length > 0, // Update status based on remaining investments
      });

      // Calculate the amount to dispense (rounded to the nearest tenth)
      const amountToDispense = Math.round(
        currentPrice! * SGD_CONVERSION_RATE * unitsToSell * 10
      ) / 10;

      setDispenseAmount(amountToDispense); // Set the amount to dispense
      setIsDispensing(true); // Show the dispensing screen
    } catch (error) {
      console.error("Error liquidating investment:", error);
      alert("Failed to liquidate investment. Please try again.");
    }
  };

  // Dispensing screen UI (Cash comes out, ends here.)
  if (isDispensing) {
    return (
      <div className="dispense-container">
        <h1 className="dispense-title">Thank You!</h1>
        <p className="dispense-message">
          Please wait while we dispense SGD {dispenseAmount?.toFixed(2)} cash.
        </p>
        <button
          className="dispense-home-button"
          onClick={() => navigate("/")}
        >
          Logout
        </button>
      </div>
    );
  }

  // Main UI for liquidating investments
  return (
    <div className="liquidate-container">
      <h1>Liquidate Investment</h1>
      <p>Select an investment to liquidate:</p>
      <div className="investment-list">
        {investments.map((investment) => (
          <div
            key={investment.id}
            className={`investment-item ${selectedInvestment?.id === investment.id ? "selected" : ""}`}
            onClick={() => handleSelectInvestment(investment)}
          >
            <h2>
              {investment.name} ({investment.symbol})
            </h2>
            <p>Units: {investment.units}</p>
          </div>
        ))}
      </div>

      {selectedInvestment && (
        <div className="investment-details">
          <h3>Selected Investment: {selectedInvestment.name}</h3>
          <div className="price-info">
            {loadingPrice ? (
              <p>Loading price...</p>
            ) : currentPrice ? (
              <p>
                Current Price: <strong>${currentPrice.toFixed(2)} USD</strong> (
                {(currentPrice * SGD_CONVERSION_RATE).toFixed(2)} SGD)
              </p>
            ) : (
              <p>Price data unavailable.</p>
            )}
          </div>
          <canvas id={`chart-${selectedInvestment.symbol}`} width="400" height="200"></canvas>
          <input
            type="number"
            placeholder="Units to sell"
            value={unitsToSell}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              setUnitsToSell(value > 0 ? value : 0); // Ensure valid input
            }}
            max={selectedInvestment.units}
            className="unit-input"
          />
          {unitsToSell > selectedInvestment.units && (
            <p className="error-text">You cannot sell more than your available units!</p>
          )}
          <button
            className="liquidate-button"
            onClick={() => setShowConfirm(true)}
            disabled={!currentPrice || unitsToSell <= 0 || unitsToSell > selectedInvestment.units}
          >
            Liquidate at{" "}
            {currentPrice && unitsToSell
              ? `${(currentPrice * SGD_CONVERSION_RATE * unitsToSell).toFixed(2)} SGD`
              : "N/A"}
          </button>
        </div>
      )}

      <button onClick={() => navigate("/investments", { state: { userID } })} className="cancel-button">
        Cancel
      </button>

      {showConfirm && (
        <div className="confirmation-modal">
          <p>
            Are you sure you want to liquidate {selectedInvestment?.name} ({unitsToSell} units) for{" "}
            {(currentPrice! * SGD_CONVERSION_RATE * unitsToSell).toFixed(2)} SGD cash?
          </p>
          <button onClick={handleConfirmLiquidation} className="liquidate-button">
            Confirm
          </button>
          <button onClick={() => setShowConfirm(false)} className="cancel-button">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default LiquidateInvestment;
