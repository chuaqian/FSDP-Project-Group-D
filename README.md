# OCBC: ATM services for now and beyond

This project showcases P04 group D's ideas for the OCBC atm functionalities

## Features

- **QR Code Login**: Allows users to login using a QR code generated from the site: [Bank App](https://log-in-fsdp.vercel.app/)
- **Facial ID Login**: Allows users to login using their FaceID with enrollment done in the site: [Bank App](https://log-in-fsdp.vercel.app/)
- **Token-based Authentication**: The QR code only contains a token (without user ID or email), enhancing security.
- **Firestore User Verification**: The ATM verifies the user’s token by retrieving their details from Firestore.
- **Chatbot Assistant**: Chatbot assistant that will be able to answer the user's queries relating to banking
- **Stock Liquidation**: Utilises AlphaVantage API to retrieve the live current prices of stocks and updates
- **Currency Exchange**: Utilises ExchangeRate API to view real-time exchange rates on the ATM
- **Denomination**: Provides a withdrawal interface where users can choose their denomination
- **Ticket Sale**: Displays upcoming/available events


## Technologies Used

- **React**: Frontend framework used for component-based UI.
- **Firebase Authentication**: Used for authenticating users during sign-up and login.
- **Firestore Database**: Stores user information securely, accessed during QR code scanning for verification.
- **crypto-js**: Encrypts tokens for secure transmission within the QR code.
- **html5-qrcode**: Scans QR codes and retrieves encoded tokens for validation.
- **Vite**: Module bundler and development environment.
- **IBM Cloud**: Watson Chatbot for AI chatbot development
- **FaceIO**: Face ID system for authentication and enrollment of faceID for users
- **Alpha Vantage API**: Stock price API to get the latest stock prices
- **ExchangeRate API**: Exchange Rate API to get the latest conversions of currencies

## Setup

### Prerequisites

- **Node.js** and **npm**
- A **Firebase Project** with Firestore and Authentication enabled

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/chuaqian/FSDP-Project-Group-D.git
   cd FSDP-Project-Group-D
2. **Creation of Firebase and env file**:
   - Go to the Firebase Console, create a project, and enable Firestore and Email/Password Authentication.
   - Copy your Firebase app configuration details from the Firebase Console and create a .env file in the project root:
   
   *VITE_FIREBASE_API_KEY=your_api_key*
   *VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain*
   *VITE_FIREBASE_PROJECT_ID=your_project_id*
   *VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket*
   *VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id*
   *VITE_FIREBASE_APP_ID=your_app_id*
   *VITE_SECRET_KEY=your_secret_key  # Define a secure secret key for token generation*

   ```bash
   ni .env

4. **Install node modules**:
   ```bash
   npm i
   npm run dev
