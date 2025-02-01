import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './index.css';
import OCBCLogo from './images/OCBC-Logo.png';

interface LocationState {
    userID: string;
    theme?: string;
  }

const Ticket = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState('');
  const [ticketCount, setTicketCount] = useState(1);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();
  const state = location.state as LocationState;
  const userID = state?.userID;
  const theme = state?.theme;

  

  const events = [
    {
      id: '1',
      title: 'Harry Potter: Visions of Magic Asia Premiere in Singapore',
      description: 'Prepare to be enchanted as Harry Potter: Visions of Magic makes its Asia Premiere at Resorts World Sentosa',
      price: 59,
      date: '2024-11-22 to 2025-06-30',
      image: 'https://static.ticketmaster.sg/images/activity/24sg_harrypotter_a549dd4968a588c90f4ef5d2ec85db4d.png'
    },
    {
        id: '2',
        title: 'Infinite @ The Star Theatre',
        description: 'Be Mine, Singapore “INSPIRIT”! INFINITE is calling out to their loyal fans in Singapore as they finally make their return after ten long years of anticipation. CK Star Entertainment is proud to present “INFINITE 15th ANNIVERSARY CONCERT : LIMITED EDITION IN SINGAPORE”',
        price: 148,
        date: '2025-02-07',
        image: 'https://static.ticketmaster.sg/images/activity/25sg_infinite_f24dc108c343e39e0b2b662096ea7fbb.png'
      },
      {
        id: '3',
        title: 'SASHA FRANK HEADLINES COMEDY MASALA',
        description: 'Welcome to Comedy Masala Live at Hero’s (voted ‘Top 10 Comedy Nights in the World’ by Traveller Mag Australia), where you get to see world class standup comedians in an intimate venue being no further than 30 feet from the stage!',
        price: 44,
        date: '2025-02-04',
        image: 'https://static.ticketmaster.sg/images/activity/25sg_sashafrank_f2d31317823ef5e7f152a5b6f6971d36.png'
      },
      {
        id: '4',
        title: '麋先生 MIXER〈 馬戲團運動 CircUs 〉世界巡迴演唱會 - 新加坡',
        description: 'Welcome to Comedy Masala Live at Hero’s (voted ‘Top 10 Comedy Nights in the World’ by Traveller Mag Australia), where you get to see world class standup comedians in an intimate venue being no further than 30 feet from the stage!',
        price: 98,
        date: '2025-02-08',
        image: 'https://static.ticketmaster.sg/images/activity/25sg_mixer_6cb17ccc9d4b02f3fd0eb563213f27e7.jpg'
      },
  ];

  const handlePurchase = () => {
    if (!selectedEvent || ticketCount < 1 || !email) {
      setError('Please fill out all fields.');
      return;
    }
    setError('');
    navigate('/thankyou');
  };

  const handleBack = () => {
    navigate('/Home', { state: { userID, theme } });
  };

  return (
    <div className={`home-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      {/* OCBC Logo */}
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      {/* Main Content Box */}
      <div className="ticketcontainer">
        <h1 style={{ textAlign: 'center' }}>Events</h1>
        {events.map((event) => (
          <div key={event.id} className="eventdetail">
            <h2>{event.title}</h2>
            <img src={event.image} alt={event.title} style={{ width: '100%', height: '317px', borderRadius: '5px' }} />
            <p>{event.description}</p>
            <p>Price: ${event.price}</p>
            <p>Date: {event.date}</p>
          </div>
        ))}

        <div className="purchasecontainer">
          <h2>Purchase Tickets</h2>
          {error && <p className="error">{error}</p>}
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="ticketselect"
          >
            <option value="">Select an event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            value={ticketCount}
            onChange={(e) => setTicketCount(parseInt(e.target.value))}
            className="ticketinput"
            placeholder="Number of tickets"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="emailinput"
            placeholder="Enter your email"
          />

          <button onClick={handlePurchase} className="purchasebutton">
            Get Ticket
          </button>

          <button onClick={handleBack} className="backbutton">
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ticket;