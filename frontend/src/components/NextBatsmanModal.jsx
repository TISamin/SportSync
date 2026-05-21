import React, { useState } from 'react';

export default function NextBatsmanModal({ isOpen, onSubmit, battingRoster, battingScorecard }) {
    const [selectedPlayerId, setSelectedPlayerId] = useState('');

    if (!isOpen) return null;

    // Filter roster to show only players who have Did Not Bat (DNB)
    // In our scorecard, each entry has a playerId and status ('DNB', 'NOT_OUT', 'OUT')
    const availablePlayers = battingRoster.filter(player => {
        const score = battingScorecard.find(s => s.playerId === player.id);
        // If scorecard is not loaded yet, or status is DNB, player is available
        return !score || score.status === 'DNB';
    });

    const handleConfirm = () => {
        if (!selectedPlayerId) {
            alert('Please select a batsman.');
            return;
        }
        onSubmit(Number(selectedPlayerId));
        setSelectedPlayerId('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6">
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-wider">Batsman Dismissed</h3>
                    <p className="text-xs text-gray-400 mt-1">Select the next batsman to enter the field.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Batsman</label>
                    <select
                        value={selectedPlayerId}
                        onChange={(e) => setSelectedPlayerId(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                        <option value="">-- Choose Batsman --</option>
                        {availablePlayers.map((player) => (
                            <option key={player.id} value={player.id}>
                                {player.name} ({player.role})
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleConfirm}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3.5 rounded-xl uppercase text-xs tracking-widest transition-all"
                >
                    Confirm & Play
                </button>
            </div>
        </div>
    );
}
