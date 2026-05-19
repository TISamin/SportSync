import { useState, useEffect } from 'react';
import { saveMatchResult } from '../api/tournamentApi';

export default function MatchResultModal({ isOpen, onClose, fixture, teams, onSaved }) {
    const [homeScore, setHomeScore] = useState('');
    const [awayScore, setAwayScore] = useState('');
    const [events, setEvents] = useState([]);
    
    // Add event form state
    const [eventTeamId, setEventTeamId] = useState('');
    const [eventPlayerId, setEventPlayerId] = useState('');
    const [eventType, setEventType] = useState('GOAL');
    const [eventMinute, setEventMinute] = useState('');
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setHomeScore('');
            setAwayScore('');
            setEvents([]);
            setEventTeamId('');
            setEventPlayerId('');
            setEventType('GOAL');
            setEventMinute('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen || !fixture) return null;

    const isKnockout = fixture.round !== 'GROUP';

    const homeTeam = teams.find(t => t.id === fixture.homeTeamId);
    const awayTeam = teams.find(t => t.id === fixture.awayTeamId);

    const selectedEventTeam = teams.find(t => t.id === Number(eventTeamId));
    const playerOptions = selectedEventTeam ? (selectedEventTeam.roster || []) : [];

    const handleAddEvent = () => {
        if (!eventTeamId || !eventPlayerId || !eventMinute) {
            alert('Please select team, player and enter minute.');
            return;
        }

        const team = teams.find(t => t.id === Number(eventTeamId));
        const player = team?.roster?.find(p => p.id === Number(eventPlayerId));

        const newEvent = {
            teamId: Number(eventTeamId),
            teamName: team?.name || '',
            playerId: Number(eventPlayerId),
            playerName: player?.name || '',
            eventType: eventType,
            minute: Number(eventMinute)
        };

        setEvents([...events, newEvent]);
        // Reset only player and minute to make entering multiple events faster
        setEventPlayerId('');
        setEventMinute('');
    };

    const handleRemoveEvent = (index) => {
        setEvents(events.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const hScore = Number(homeScore);
        const aScore = Number(awayScore);

        if (isNaN(hScore) || isNaN(aScore) || homeScore === '' || awayScore === '') {
            setError('Both scores are required and must be valid numbers.');
            return;
        }

        if (isKnockout && hScore === aScore) {
            setError('Knockout matches cannot end in a draw. Please enter the final score including penalty shootout if applicable.');
            return;
        }

        setLoading(true);
        try {
            // Backend expects events in MatchEventRequest format: playerId, teamId, eventType, minute
            const requestEvents = events.map(ev => ({
                playerId: ev.playerId,
                teamId: ev.teamId,
                eventType: ev.eventType,
                minute: ev.minute
            }));

            const res = await saveMatchResult(fixture.tournamentId, fixture.id, hScore, aScore, requestEvents);
            if (res.success) {
                onSaved();
                onClose();
            } else {
                setError(res.error || 'Failed to save match result.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Error saving match result.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full p-6 my-8 shadow-2xl relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl p-2"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-6 border-b border-gray-800 pb-3">
                    Enter Match Result
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Score inputs */}
                    <div className="grid grid-cols-3 items-center gap-4 bg-gray-800/40 p-6 rounded-xl border border-gray-800">
                        <div className="text-center">
                            <p className="text-white font-bold text-lg mb-2 truncate">{fixture.homeTeamName}</p>
                            <input
                                type="number"
                                min="0"
                                value={homeScore}
                                onChange={e => setHomeScore(e.target.value)}
                                className="w-20 bg-gray-800 border border-gray-700 text-white text-3xl font-black text-center p-3 rounded-lg focus:outline-none focus:border-indigo-500"
                                placeholder="0"
                                required
                            />
                        </div>
                        <div className="text-center font-black text-2xl text-gray-500">VS</div>
                        <div className="text-center">
                            <p className="text-white font-bold text-lg mb-2 truncate">{fixture.awayTeamName}</p>
                            <input
                                type="number"
                                min="0"
                                value={awayScore}
                                onChange={e => setAwayScore(e.target.value)}
                                className="w-20 bg-gray-800 border border-gray-700 text-white text-3xl font-black text-center p-3 rounded-lg focus:outline-none focus:border-indigo-500"
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>

                    {/* Match Events section */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                            Match Events (Goals & Assists)
                        </h3>

                        {/* Add Event row */}
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-4 bg-gray-800/20 p-4 rounded-xl border border-gray-800/55">
                            <select
                                value={eventTeamId}
                                onChange={e => {
                                    setEventTeamId(e.target.value);
                                    setEventPlayerId('');
                                }}
                                className="bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 sm:col-span-2"
                            >
                                <option value="">Select Team</option>
                                {homeTeam && <option value={homeTeam.id}>{homeTeam.name}</option>}
                                {awayTeam && <option value={awayTeam.id}>{awayTeam.name}</option>}
                            </select>

                            <select
                                value={eventPlayerId}
                                onChange={e => setEventPlayerId(e.target.value)}
                                disabled={!eventTeamId}
                                className="bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 sm:col-span-2 disabled:opacity-50"
                            >
                                <option value="">Select Player</option>
                                {playerOptions.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} (#{p.playerNumber || '?'}) - {p.role}
                                    </option>
                                ))}
                            </select>

                            <div className="flex gap-2 sm:col-span-1">
                                <select
                                    value={eventType}
                                    onChange={e => setEventType(e.target.value)}
                                    className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 w-1/2 sm:w-full"
                                >
                                    <option value="GOAL">Goal</option>
                                    <option value="ASSIST">Assist</option>
                                </select>
                                <input
                                    type="number"
                                    min="1"
                                    max="120"
                                    placeholder="Min"
                                    value={eventMinute}
                                    onChange={e => setEventMinute(e.target.value)}
                                    className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white text-center focus:outline-none focus:border-indigo-500 w-1/2 sm:w-full"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleAddEvent}
                                className="sm:col-span-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition-all"
                            >
                                Add Event
                            </button>
                        </div>

                        {/* Events list */}
                        {events.length > 0 && (
                            <div className="bg-gray-800/30 border border-gray-800/70 rounded-xl p-4 max-h-40 overflow-y-auto space-y-2">
                                {events.map((ev, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-gray-800/60 p-2.5 rounded-lg border border-gray-700/30">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs font-mono bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded">
                                                {ev.minute}'
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                                                ev.eventType === 'GOAL' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                                {ev.eventType}
                                            </span>
                                            <span className="text-sm font-semibold text-white">{ev.playerName}</span>
                                            <span className="text-xs text-gray-400 font-medium">({ev.teamName})</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveEvent(idx)}
                                            className="text-red-400 hover:text-red-500 text-xs px-2 py-1"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-4 border-t border-gray-800 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3.5 rounded-lg uppercase tracking-wider text-sm transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 text-white font-black py-3.5 rounded-lg uppercase tracking-wider text-sm transition-all"
                        >
                            {loading ? 'Saving...' : 'Save Result'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
