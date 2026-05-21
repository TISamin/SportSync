import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getRoomTeams } from '../api/auctionApi';
import { createTournament } from '../api/tournamentApi';

export default function TournamentSetup() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialRoomCode = searchParams.get('roomCode') || '';

    const [roomCode, setRoomCode] = useState(initialRoomCode);
    const [loadedRooms, setLoadedRooms] = useState([]); // [{ code: 'ROOM1', count: 8 }]
    const [tournamentName, setTournamentName] = useState('');
    const [tournamentType, setTournamentType] = useState('SINGLE');
    const [teams, setTeams] = useState([]); // Accumulated list of teams from all loaded rooms
    const [selectedTeamIds, setSelectedTeamIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingTeams, setFetchingTeams] = useState(false);
    const [error, setError] = useState('');

    const [sport, setSport] = useState('FOOTBALL');
    const [overs, setOvers] = useState(20);

    const requiredCount = tournamentType === 'SINGLE' ? 8 : 64;

    useEffect(() => {
        if (initialRoomCode) {
            fetchTeams(initialRoomCode);
        }
    }, [initialRoomCode]);

    // Whenever tournamentType changes, adjust selected teams to matches required count if possible
    useEffect(() => {
        if (teams.length === requiredCount) {
            setSelectedTeamIds(teams.map(t => t.id));
        } else {
            setSelectedTeamIds([]);
        }
    }, [tournamentType]);

    const fetchTeams = async (code) => {
        const cleanCode = code.trim().toUpperCase();
        if (!cleanCode) return;

        // Check if room is already loaded
        if (loadedRooms.some(r => r.code === cleanCode)) {
            setError(`Room ${cleanCode} is already loaded.`);
            return;
        }

        setFetchingTeams(true);
        setError('');
        try {
            const res = await getRoomTeams(cleanCode);
            if (res.success) {
                const newTeams = res.data;
                if (newTeams.length === 0) {
                    setError(`Room ${cleanCode} has no teams.`);
                    return;
                }

                // Add to accumulated list, filtering out duplicates just in case
                setTeams(prevTeams => {
                    const existingIds = new Set(prevTeams.map(t => t.id));
                    const filteredNew = newTeams.filter(t => !existingIds.has(t.id));
                    
                    // Auto-select these teams
                    setSelectedTeamIds(prevSelect => {
                        const newSelect = [...prevSelect, ...filteredNew.map(t => t.id)];
                        // Limit auto-selection to required count
                        return newSelect.slice(0, requiredCount);
                    });

                    return [...prevTeams, ...filteredNew];
                });

                setLoadedRooms(prevRooms => [...prevRooms, { code: cleanCode, count: newTeams.length }]);
                setRoomCode(''); // Clear input for next room
            } else {
                setError(res.error || `Failed to fetch teams for room ${cleanCode}.`);
            }
        } catch (err) {
            setError('Error connecting to server.');
        } finally {
            setFetchingTeams(false);
        }
    };

    const handleLoadTeams = (e) => {
        e.preventDefault();
        fetchTeams(roomCode);
    };

    const handleRemoveRoom = (roomToRemove) => {
        // Fetch teams in room to remove them from accumulated list
        getRoomTeams(roomToRemove).then(res => {
            if (res.success) {
                const teamIdsToRemove = new Set(res.data.map(t => t.id));
                setTeams(prev => prev.filter(t => !teamIdsToRemove.has(t.id)));
                setSelectedTeamIds(prev => prev.filter(id => !teamIdsToRemove.has(id)));
                setLoadedRooms(prev => prev.filter(r => r.code !== roomToRemove));
            }
        }).catch(err => {
            console.error('Error removing room', err);
        });
    };

    const handleCheckboxChange = (teamId) => {
        if (selectedTeamIds.includes(teamId)) {
            setSelectedTeamIds(selectedTeamIds.filter(id => id !== teamId));
        } else {
            if (selectedTeamIds.length >= requiredCount) {
                alert(`You can only select up to ${requiredCount} teams.`);
                return;
            }
            setSelectedTeamIds([...selectedTeamIds, teamId]);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');

        if (!tournamentName.trim()) {
            setError('Tournament name is required.');
            return;
        }

        if (selectedTeamIds.length !== requiredCount) {
            setError(`You must select exactly ${requiredCount} teams to start this tournament.`);
            return;
        }

        setLoading(true);
        try {
            const res = await createTournament(tournamentName, tournamentType, selectedTeamIds, sport, sport === 'CRICKET' ? overs : null);
            if (res.success) {
                navigate(`/tournament/${res.data.id}`);
            } else {
                setError(res.error || 'Failed to create tournament.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Error creating tournament.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white">
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-black tracking-widest uppercase">Setup Tournament</h1>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-6 text-sm">
                        {error}
                    </div>
                )}

                {/* Tournament configuration */}
                <div className="mb-6 space-y-4">
                    <div>
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
                            Tournament Type
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center space-x-2 cursor-pointer bg-gray-800 border border-gray-700 p-3 rounded-lg flex-1">
                                <input
                                    type="radio"
                                    name="type"
                                    value="SINGLE"
                                    checked={tournamentType === 'SINGLE'}
                                    onChange={() => setTournamentType('SINGLE')}
                                    className="accent-indigo-500"
                                />
                                <span>Single Phase (8 Teams)</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer bg-gray-800 border border-gray-700 p-3 rounded-lg flex-1">
                                <input
                                    type="radio"
                                    name="type"
                                    value="DOUBLE"
                                    checked={tournamentType === 'DOUBLE'}
                                    onChange={() => setTournamentType('DOUBLE')}
                                    className="accent-indigo-500"
                                />
                                <span>Double Phase (64 Teams)</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
                                Sport
                            </label>
                            <select
                                value={sport}
                                onChange={(e) => setSport(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                                <option value="FOOTBALL">Football ⚽</option>
                                <option value="CRICKET">Cricket 🏏</option>
                            </select>
                        </div>
                        {sport === 'CRICKET' && (
                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
                                    Overs Limit
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={overs}
                                    onChange={(e) => setOvers(parseInt(e.target.value) || 20)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 font-mono"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Add room form */}
                <form onSubmit={handleLoadTeams} className="mb-6">
                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
                        Load Teams from Auction Rooms
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Enter Room Code (e.g. ABCDEF)"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white uppercase font-mono tracking-wider focus:outline-none focus:border-indigo-500"
                        />
                        <button
                            type="submit"
                            disabled={fetchingTeams || !roomCode}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider transition-all"
                        >
                            {fetchingTeams ? 'Loading...' : 'Load'}
                        </button>
                    </div>
                </form>

                {/* Display loaded rooms */}
                {loadedRooms.length > 0 && (
                    <div className="mb-6">
                        <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                            Loaded Auction Rooms
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {loadedRooms.map(room => (
                                <div key={room.code} className="flex items-center space-x-2 bg-gray-800 border border-gray-750 px-3 py-1.5 rounded-lg text-xs">
                                    <span className="font-mono font-bold text-indigo-400">{room.code}</span>
                                    <span className="text-gray-400">({room.count} teams)</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveRoom(room.code)}
                                        className="text-red-400 hover:text-red-500 font-bold ml-1"
                                        title="Remove room teams"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Select accumulated teams */}
                {teams.length > 0 && (
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div>
                            <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
                                Tournament Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter tournament name (e.g. Champions League)"
                                value={tournamentName}
                                onChange={(e) => setTournamentName(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    Select Teams ({selectedTeamIds.length} / {requiredCount})
                                </label>
                                {selectedTeamIds.length !== requiredCount && (
                                    <span className="text-xs text-yellow-500 font-semibold animate-pulse">
                                        Must select exactly {requiredCount} teams
                                    </span>
                                )}
                            </div>
                            <div className="bg-gray-800/50 border border-gray-800 rounded-xl p-4 max-h-60 overflow-y-auto space-y-2.5">
                                {teams.map((team) => (
                                    <label
                                        key={team.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                                            selectedTeamIds.includes(team.id)
                                                ? 'bg-indigo-600/10 border-indigo-500 text-white'
                                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedTeamIds.includes(team.id)}
                                                onChange={() => handleCheckboxChange(team.id)}
                                                className="accent-indigo-500 h-4 w-4"
                                            />
                                            <div>
                                                <p className="font-bold text-sm text-white">{team.name}</p>
                                                <p className="text-xs text-gray-400">Owner: {team.ownerName}</p>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || selectedTeamIds.length !== requiredCount}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-black uppercase tracking-widest py-4 rounded-lg transition-all"
                        >
                            {loading ? 'Creating...' : 'Start Tournament'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
