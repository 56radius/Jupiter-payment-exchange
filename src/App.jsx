import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WalletContextProvider from "./context/WalletProvider"; // Import WalletProvider

//importing the pages
import WelcomeScreen from "./components/WelcomeScreen";
import HomePage from "./pages/HomeScreen"; // Import the homepage
import SendToken from "./pages/SendToken";

//importing the solana styling
import '@solana/wallet-adapter-react-ui/styles.css'; 


function App() {
  return (
    <WalletContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/send-token" element={<SendToken />} />
        </Routes>
      </Router>
    </WalletContextProvider>
  );
}

export default App;
