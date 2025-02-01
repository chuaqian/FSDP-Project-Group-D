
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Preference from './preference';
import Shortcuts from './Shortcuts';
import QRScanner from './QRScanner';
import Home from './home';
import LandingPage from './LandingPage';
import CardLogin from './CardLogin';
import WatsonChat from './WatsonChat';
import './index.css';
import TransactionConfirmation from './TransactionConfirmation';
import OtherAmounts from './OtherAmounts';
import Withdraw from './Withdraw';  
import MoreServices from './MoreServices';
import Investments from './investments';
import LiquidateInvestment from './LiquidateInvestment';
import FaceIDLogin from './FaceIDLogin';
import CurrencyExchange from './CurrencyExchange';
import Transfer from './Transfer';
import TransferSuccess from './TransferSuccess';
import DenominationWithdraw from './DenominationWithdraw';
import DispensingConfirmation from './DispensingConfirmation';
import Withdraw2 from './Withdraw2';  
import Ticket from './Ticket';
import ThankYou from './ThankYou';


createRoot(document.getElementById('root')!).render(
    <Router>
      <WatsonChat />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/CardLogin" element={<CardLogin />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/preferences" element={<Preference />} />
        <Route path="/shortcuts" element={<Shortcuts />} /> 
        <Route path="/QRScanner" element={<QRScanner />} />
        <Route path="/transaction-confirmation" element={<TransactionConfirmation />} />
        <Route path="/OtherAmounts" element={<OtherAmounts />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/MoreServices" element={<MoreServices />} /> 
        <Route path="/investments" element={<Investments />} />
        <Route path="/LiquidateInvestment" element={<LiquidateInvestment />} />
        <Route path="/FaceIDLogin" element={<FaceIDLogin />} />
        <Route path="/CurrencyExchange" element={<CurrencyExchange />} />
        <Route path="/transfer" element={<Transfer />} />
        <Route path="/transfersuccess" element={<TransferSuccess />} />
        <Route path="/DenominationWithdraw" element={<DenominationWithdraw />} />
        <Route path="/dispensing-confirmation" element={<DispensingConfirmation />} />
        <Route path="/withdraw2" element={<Withdraw2 />} />
        <Route path="/Ticket" element={<Ticket />} />
        <Route path="/ThankYou" element={<ThankYou />} />
      </Routes>
    </Router>
);
