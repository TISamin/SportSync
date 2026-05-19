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
    
    const { roomCode: storeCode, isAdmin, myTeamId, setRoomInfo, setMyTeamId, statusMessage, isFinished, currentPlayer, teams, categoryCounts } = useAuctionStore();
    const { connected, startAuction, nextPlayer, placeBid } = useAuctionSocket(storeCode);

    const myTeam = teams.find(t => t.id === myTeamId);
    const myRoster = myTeam ? (myTeam.roster || []) : [];
    
    const [copied, setCopied] = useState(false);
    const [joinForm, setJoinForm] = useState({ teamName: '', ownerName: '' });
    const [joinError, setJoinError] = useState('');
    const [loading, setLoading] = useState(true);

    const joinLink = `${window.location.origin}/auction/${roomCode}`;
    const handleCopyLink = () => {
        navigator.clipboard.writeText(joinLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                        <p className="text-gray-400 text-sm">Room Code: <span className="text-indigo-400 font-mono font-bold">{roomCode}</span></p>
                        {isAdmin && (
                            <div className="flex items-center space-x-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs">
                                <span className="text-gray-400 font-bold uppercase tracking-wider">Captain Link:</span>
                                <span className="text-indigo-300 font-mono select-all">{joinLink}</span>
                                <button 
                                    onClick={handleCopyLink}
                                    className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold px-2 py-0.5 rounded transition-all"
                                >
                                    {copied ? 'Copied!' : 'Copy Link'}
                                </button>
                            </div>
                        )}
                    </div>
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

                    {/* My Roster section (Only for captains who have joined a team) */}
                    {!isAdmin && myTeamId && (
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
                            <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-3">
                                <h3 className="text-white font-black text-lg uppercase tracking-widest">My Acquired Players</h3>
                                <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full font-bold">
                                    {myRoster.length} Players Drafted
                                </span>
                            </div>

                            {myRoster.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 font-medium">
                                    You haven't bought any players yet. Start bidding!
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-800 text-xs text-gray-400 font-bold uppercase tracking-wider">
                                                <th className="py-3 px-4">Player</th>
                                                <th className="py-3 px-4">Role</th>
                                                <th className="py-3 px-4">Category</th>
                                                <th className="py-3 px-4 text-right">Acquired Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800/50">
                                            {myRoster.map((player) => (
                                                <tr key={player.id} className="hover:bg-gray-800/30 transition-colors">
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center space-x-3">
                                                            {player.imageUrl ? (
                                                                <img src={player.imageUrl} alt={player.name} className="w-8 h-8 rounded-full object-cover border border-gray-700" />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-700">
                                                                    #{player.playerNumber || '?'}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-white font-bold text-sm">{player.name}</p>
                                                                <p className="text-gray-400 text-xs">No. {player.playerNumber || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <p className="text-gray-300 text-sm font-medium">{player.role}</p>
                                                        <p className="text-gray-500 text-xs">{player.style}</p>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <span className="text-xs bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                                            {player.category}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right">
                                                        <span className="text-green-400 font-black text-sm">
                                                            ${player.soldPrice?.toLocaleString() || player.basePrice?.toLocaleString()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column - Category Tracker and Roster */}
                <div className="space-y-6">
                    {/* Category Tracker */}
                    {Object.keys(categoryCounts || {}).length > 0 && (
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
                            <h3 className="text-white font-black text-lg mb-4 uppercase tracking-widest border-b border-gray-800 pb-3">Category Tracker</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(categoryCounts).map(([cat, count]) => (
                                    <div key={cat} className="bg-gray-800 border border-gray-700/50 rounded-lg p-3 flex justify-between items-center">
                                        <span className="text-xs bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-2.5 py-1 rounded-md font-mono font-bold uppercase">{cat}</span>
                                        <span className="text-xl font-black text-white">{count} left</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <TeamRoster />
                </div>
            </div>
        </div>
    );
}
