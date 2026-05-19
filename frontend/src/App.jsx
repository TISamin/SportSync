import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminSetup from './pages/AdminSetup';
import AuctionRoom from './pages/AuctionRoom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* Auction Routes */}
        <Route path="/admin/auction/setup" element={<AdminSetup />} />
        <Route path="/admin/auction/:roomCode" element={<AuctionRoom />} />
        <Route path="/auction/:roomCode" element={<AuctionRoom />} />
        
        {/* Tournament Routes (Placeholders for Step 7+) */}
        <Route path="/tournament/setup" element={<div className="text-white p-8">Tournament Setup Coming Soon</div>} />
      </Routes>
    </Router>
  );
}

export default App;
