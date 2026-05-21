import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminSetup from './pages/AdminSetup';
import AuctionRoom from './pages/AuctionRoom';
import TournamentSetup from './pages/TournamentSetup';
import TournamentDashboard from './pages/TournamentDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* Auction Routes */}
        <Route path="/admin/auction/setup" element={<AdminSetup />} />
        <Route path="/admin/auction/:roomCode" element={<AuctionRoom />} />
        <Route path="/auction/:roomCode" element={<AuctionRoom />} />
        
        {/* Tournament Routes */}
        <Route path="/tournament/setup" element={<TournamentSetup />} />
        <Route path="/tournament/:id" element={<TournamentDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
