import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { joinRoom, getRoomState } from '../api/auctionApi';
import { useAuctionStore } from '../store/auctionStore';
import { useAuctionSocket } from '../socket/useAuctionSocket';
import PlayerCard from '../components/PlayerCard';
import BidPanel from '../components/BidPanel';
import TimerBar from '../components/TimerBar';
import TeamRoster from '../components/TeamRoster';

export default function AuctionRoom() {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const isRoomAdminRoute = window.location.pathname.startsWith('/admin');
    
    const { roomCode: storeCode, isAdmin, myTeamId, setRoomInfo, setMyTeamId, statusMessage, isFinished, currentPlayer } = useAuctionStore();
    const { connected, startAuction, nextPlayer, placeBid } = useAuctionSocket(storeCode);
    
    const [joinForm, setJoinForm] = useState({ teamName: '', ownerName: '' });
    const [joinError, setJoinError] = useState('');
    const [loading, setLoading] = useState(true);

    // Initial load and verification
    useEffect(() => {
        const init = async () => {
            try {
                const res = await getRoomState(roomCode);
                if (res.success) {
                    if (isRoomAdminRoute) {
                        setRoomInfo(roomCode, res.data.id, true);
                    } else {
                        // Regular user joining
                        setRoomInfo(roomCode, res.data.id, false);
                    }
                } else {
                    navigate('/'); // Invalid room
                }
            } catch (err) {
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [roomCode, isRoomAdminRoute, navigate, setRoomInfo]);

    const handleJoin = async (e) => {
        e.preventDefault();
        setJoinError('');
        try {
            const res = await joinRoom(roomCode, joinForm.teamName, joinForm.ownerName);
            if (res.success) {
                setMyTeamId(res.data.id);
            } else {
                setJoinError(res.error);
            }
        } catch (err) {
            setJoinError('Failed to join room');
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

    // Show Join Form for non-admins who haven't joined a team yet
    if (!isAdmin && !myTeamId) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-widest">Join Room</h2>
                    <p className="text-indigo-400 mb-6 font-mono text-xl">{roomCode}</p>
                    
                    {joinError && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">{joinError}</div>}
                    
                    <form onSubmit={handleJoin} className="space-y-4">
                        <input 
                            type="text" placeholder="Team Name" required
                            value={joinForm.teamName} onChange={e => setJoinForm({...joinForm, teamName: e.target.value})}
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-3"
                        />
                        <input 
                            type="text" placeholder="Owner Name" required
                            value={joinForm.ownerName} onChange={e => setJoinForm({...joinForm, ownerName: e.target.value})}
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-3"
                        />
                        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg uppercase tracking-wider hover:bg-indigo-500">
                            Enter Auction
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Main Auction View
    return (
        <div className="min-h-screen bg-black p-6">
            <header className="flex justify-between items-center mb-8 bg-gray-900 p-4 rounded-xl border border-gray-800">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase">
                        Sport<span className="text-indigo-500">Sync</span> Auction
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Room Code: <span className="text-indigo-400 font-mono font-bold">{roomCode}</span></p>
                </div>
                
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></div>
                        <span className="text-gray-400 text-sm font-bold uppercase">{connected ? 'Live' : 'Disconnected'}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Live Action */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Banner */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center shadow-lg">
                        <h2 className="text-xl font-bold text-white tracking-wide">{statusMessage}</h2>
                    </div>

                    {/* Main Area */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PlayerCard player={currentPlayer} />
                        
                        <div className="space-y-6 flex flex-col justify-between">
                            <TimerBar />
                            <BidPanel onBid={placeBid} />
                            
                            {/* Admin Controls */}
                            {isAdmin && !isFinished && (
                                <div className="bg-gray-900 border border-indigo-500/30 p-6 rounded-xl flex flex-col space-y-4 mt-auto">
                                    <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Admin Controls</h3>
                                    {!currentPlayer ? (
                                        <button 
                                            onClick={startAuction}
                                            className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-lg uppercase tracking-widest"
                                        >
                                            Start Auction
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={nextPlayer}
                                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-lg uppercase tracking-widest"
                                        >
                                            Next Player
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Roster */}
                <div>
                    <TeamRoster />
                </div>
            </div>
        </div>
    );
}
