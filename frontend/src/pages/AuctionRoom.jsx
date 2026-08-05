import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { joinRoom, getRoomState } from '../api/auctionApi';
import { useAuctionStore } from '../store/auctionStore';
import { useAuctionSocket } from '../socket/useAuctionSocket';
import PlayerCard from '../components/PlayerCard';
import BidPanel from '../components/BidPanel';
import TimerBar from '../components/TimerBar';
import TeamRoster from '../components/TeamRoster';
import ThemeToggle from '../components/ThemeToggle';

export default function AuctionRoom() {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const isRoomAdminRoute = window.location.pathname.startsWith('/admin');
    
    const { roomCode: storeCode, isAdmin, myTeamId, setRoomInfo, setMyTeamId, statusMessage, isFinished, currentPlayer, teams, categoryCounts, reset } = useAuctionStore();
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
            reset();
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
            } catch {
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [roomCode, isRoomAdminRoute, navigate, setRoomInfo, reset]);

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
            setJoinError(err.response?.data?.error || err.message || 'Failed to join room');
        }
    };

    if (loading) return <div className="min-h-screen bg-base flex items-center justify-center text-txt">Loading...</div>;

    // Show Join Form for non-admins who haven't joined a team yet
    if (!isAdmin && !myTeamId) {
        return (
            <div className="min-h-screen bg-base flex flex-col items-center justify-center p-4 relative">
                <div className="absolute top-4 right-4">
                    <ThemeToggle />
                </div>
                <div className="bg-surface border border-border p-8 rounded-2xl max-w-md w-full shadow-2xl relative">
                    <h2 className="text-2xl font-black text-txt mb-2 uppercase tracking-widest">Join Room</h2>
                    <p className="text-indigo-500 mb-6 font-mono text-xl">{roomCode}</p>
                    
                    {joinError && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">{joinError}</div>}
                    
                    <form onSubmit={handleJoin} className="space-y-4">
                        <input 
                            type="text" placeholder="Team Name" required
                            value={joinForm.teamName} onChange={e => setJoinForm({...joinForm, teamName: e.target.value})}
                            className="w-full bg-input text-txt border border-border rounded-lg p-3 focus:outline-none focus:border-indigo-500"
                        />
                        <input 
                            type="text" placeholder="Owner Name" required
                            value={joinForm.ownerName} onChange={e => setJoinForm({...joinForm, ownerName: e.target.value})}
                            className="w-full bg-input text-txt border border-border rounded-lg p-3 focus:outline-none focus:border-indigo-500"
                        />
                        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg uppercase tracking-wider hover:bg-indigo-500 cursor-pointer">
                            Enter Auction
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Main Auction View
    return (
        <div className="min-h-screen bg-base p-6">
            <header className="flex justify-between items-center mb-8 bg-surface p-4 rounded-xl border border-border shadow-md">
                <div>
                    <h1 className="text-3xl font-black text-txt tracking-widest uppercase">
                        Sport<span className="text-indigo-500">Sync</span> Auction
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                        <p className="text-muted text-sm">Room Code: <span className="text-indigo-500 font-mono font-bold">{roomCode}</span></p>
                        {isAdmin && (
                            <div className="flex items-center space-x-2 bg-input border border-border rounded-lg px-3 py-1.5 text-xs">
                                <span className="text-muted font-bold uppercase tracking-wider">Captain Link:</span>
                                <span className="text-indigo-600 dark:text-indigo-300 font-mono select-all">{joinLink}</span>
                                <button 
                                    onClick={handleCopyLink}
                                    className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold px-2 py-0.5 rounded transition-all cursor-pointer"
                                >
                                    {copied ? 'Copied!' : 'Copy Link'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center space-x-4">
                    <ThemeToggle />
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></div>
                        <span className="text-muted text-sm font-bold uppercase">{connected ? 'Live' : 'Disconnected'}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Live Action */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Banner */}
                    <div className="bg-surface border border-border rounded-xl p-4 text-center shadow-lg">
                        <h2 className="text-xl font-bold text-txt tracking-wide">{statusMessage}</h2>
                    </div>

                    {/* Main Area */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PlayerCard player={currentPlayer} />
                        
                        <div className="space-y-6 flex flex-col justify-between">
                            <TimerBar />
                            <BidPanel onBid={placeBid} />
                            
                            {/* Admin Controls */}
                            {isAdmin && (
                                <div className="bg-surface border border-indigo-500/30 p-6 rounded-xl flex flex-col space-y-4 mt-auto shadow-md">
                                    <h3 className="text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-widest text-xs">Admin Controls</h3>
                                    {isFinished ? (
                                        <button 
                                            onClick={() => navigate(`/tournament/setup?roomCode=${roomCode}`)}
                                            className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-lg uppercase tracking-widest transition-all cursor-pointer"
                                        >
                                            Setup Tournament
                                        </button>
                                    ) : !currentPlayer ? (
                                        <button 
                                            onClick={startAuction}
                                            className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-lg uppercase tracking-widest cursor-pointer"
                                        >
                                            Start Auction
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={nextPlayer}
                                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-lg uppercase tracking-widest cursor-pointer"
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
                        <div className="bg-surface border border-border rounded-xl p-6 shadow-lg">
                            <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
                                <h3 className="text-txt font-black text-lg uppercase tracking-widest">My Acquired Players</h3>
                                <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-3 py-1 rounded-full font-bold">
                                    {myRoster.length} Players Drafted
                                </span>
                            </div>

                            {myRoster.length === 0 ? (
                                <div className="text-center py-8 text-muted font-medium">
                                    You haven't bought any players yet. Start bidding!
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-border text-xs text-muted font-bold uppercase tracking-wider">
                                                <th className="py-3 px-4">Player</th>
                                                <th className="py-3 px-4">Role</th>
                                                <th className="py-3 px-4">Category</th>
                                                <th className="py-3 px-4 text-right">Acquired Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {myRoster.map((player) => (
                                                <tr key={player.id} className="hover:bg-input/30 transition-colors">
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center space-x-3">
                                                            {player.imageUrl ? (
                                                                <img src={player.imageUrl} alt={player.name} className="w-8 h-8 rounded-full object-cover border border-border" />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-input flex items-center justify-center text-xs font-bold text-muted border border-border">
                                                                    #{player.playerNumber || '?'}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-txt font-bold text-sm">{player.name}</p>
                                                                <p className="text-muted text-xs">No. {player.playerNumber || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <p className="text-txt text-sm font-medium">{player.role}</p>
                                                        <p className="text-muted text-xs">{player.style}</p>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <span className="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                                            {player.category}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right">
                                                        <span className="text-green-600 dark:text-green-400 font-black text-sm">
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
                        <div className="bg-surface border border-border rounded-xl p-6 shadow-lg">
                            <h3 className="text-txt font-black text-lg mb-4 uppercase tracking-widest border-b border-border pb-3">Category Tracker</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(categoryCounts).map(([cat, count]) => (
                                    <div key={cat} className="bg-input border border-border/50 rounded-lg p-3 flex justify-between items-center">
                                        <span className="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 px-2.5 py-1 rounded-md font-mono font-bold uppercase">{cat}</span>
                                        <span className="text-xl font-black text-txt">{count} left</span>
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

