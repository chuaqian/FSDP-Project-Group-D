import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import axios from "axios";
import Chart from "chart.js/auto";

interface Investment {
  id: string;
  name: string;
  symbol: string;
  units: number;
}

interface LocationState {
  investments: Investment[];
  userID: string;
}

const AlphaVantageAPI = "https://www.alphavantage.co/query";
const API_KEY = "NIWBQ9O7VEE8I854";

const LiquidateInvestment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { investments, userID } = location.state as LocationState;

  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [unitsToSell, setUnitsToSell] = useState<number>(0);

  const SGD_CONVERSION_RATE = 1.35;

  // Fetch current stock price and render graph
  const fetchStockData = async (symbol: string) => {
    try {
      setLoadingPrice(true);

      interface TimeSeriesResponse {
        "Time Series (60min)"?: Record<string, { "4. close": string }>;
      }

      const response = await axios.get<TimeSeriesResponse>(AlphaVantageAPI, {
        params: {
          function: "TIME_SERIES_INTRADAY",
          symbol,
          interval: "60min",
          apikey: API_KEY,
        },
      });

      const timeSeries = response.data["Time Series (60min)"];
      if (timeSeries) {
        const latestClose = parseFloat(Object.values(timeSeries)[0]["4. close"]);
        setCurrentPrice(latestClose);

        const canvas = document.getElementById(`chart-${symbol}`) as HTMLCanvasElement;
        if (canvas) {
          new Chart(canvas, {
            type: "line",
            data: {
              labels: Object.keys(timeSeries).slice(0, 10).reverse(),
              datasets: [
                {
                  label: `${symbol} Price (USD)`,
                  data: Object.keys(timeSeries)
                    .slice(0, 10)
                    .reverse()
                    .map((date) => parseFloat(timeSeries[date]["4. close"])),
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
      setCurrentPrice(null);
    } finally {
      setLoadingPrice(false);
    }
  };

  const handleSelectInvestment = (investment: Investment) => {
    setSelectedInvestment(investment);
    setCurrentPrice(null); // Clear old price
    setUnitsToSell(0); // Reset input
    fetchStockData(investment.symbol); // Fetch new data
  };

  const handleConfirmLiquidation = async () => {
    if (!selectedInvestment || unitsToSell <= 0 || unitsToSell > selectedInvestment.units) return;

    try {
      const investmentsRef = doc(db, "investments", userID);

      const remainingUnits = selectedInvestment.units - unitsToSell;
      const updatedInvestments =
        remainingUnits > 0
          ? investments.map((investment) =>
              investment.id === selectedInvestment.id
                ? { ...investment, units: remainingUnits }
                : investment
            )
          : investments.filter((investment) => investment.id !== selectedInvestment.id);

      await updateDoc(investmentsRef, {
        investments: updatedInvestments,
        investmentStatus: updatedInvestments.length > 0,
      });

      alert(
        `${selectedInvestment.name} (${unitsToSell} units) has been liquidated for SGD ${(currentPrice! * SGD_CONVERSION_RATE * unitsToSell).toFixed(2)} Cash! Dispensing SGD ${(currentPrice! * SGD_CONVERSION_RATE * unitsToSell).toFixed(2)} cash now.`
      );
      navigate("/investments", { state: { userID } });
    } catch (error) {
      console.error("Error liquidating investment:", error);
      alert("Failed to liquidate investment. Please try again.");
    }
  };

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
              setUnitsToSell(value > 0 ? value : 0); // Ensure valid numbers
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
