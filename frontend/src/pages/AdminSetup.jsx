import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../api/auctionApi';
import { importPlayers } from '../api/playerApi';
import { useAuctionStore } from '../store/auctionStore';
import ThemeToggle from '../components/ThemeToggle';

export default function AdminSetup() {
    const navigate = useNavigate();
    const setRoomInfo = useAuctionStore(state => state.setRoomInfo);
    
    const [budget, setBudget] = useState(10000);
    const [maxTeams, setMaxTeams] = useState(8);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a CSV file');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Create Room
            const roomRes = await createRoom(budget, maxTeams);
            if (!roomRes.success) throw new Error(roomRes.error);
            
            const roomCode = roomRes.data.roomCode;
            const roomId = roomRes.data.id;

            // 2. Import Players
            const importRes = await importPlayers(roomId, file);
            if (!importRes.success) throw new Error(importRes.error);

            // 3. Set global admin state and navigate to room
            setRoomInfo(roomCode, roomId, true);
            navigate(`/admin/auction/${roomCode}`);
            
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base flex flex-col items-center justify-center p-4 relative">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="bg-surface border border-border p-8 rounded-2xl shadow-2xl max-w-md w-full relative">
                <h1 className="text-3xl font-black text-txt mb-6 tracking-widest uppercase">Create Auction</h1>
                
                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-6 text-sm">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-muted text-xs font-bold uppercase tracking-widest mb-2">Budget Per Team</label>
                        <input 
                            type="number" 
                            value={budget}
                            onChange={(e) => setBudget(Number(e.target.value))}
                            className="w-full bg-input text-txt border border-border rounded-lg p-3 focus:outline-none focus:border-indigo-500"
                            min="1"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-muted text-xs font-bold uppercase tracking-widest mb-2">Max Teams</label>
                        <input 
                            type="number" 
                            value={maxTeams}
                            onChange={(e) => setMaxTeams(Number(e.target.value))}
                            className="w-full bg-input text-txt border border-border rounded-lg p-3 focus:outline-none focus:border-indigo-500"
                            min="2"
                            max="16"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-muted text-xs font-bold uppercase tracking-widest mb-2">Player CSV File</label>
                        <input 
                            type="file" 
                            accept=".csv"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="w-full text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest py-4 rounded-lg transition-all cursor-pointer"
                    >
                        {loading ? 'Creating...' : 'Launch Auction Room'}
                    </button>
                </form>
            </div>
        </div>
    );
}
