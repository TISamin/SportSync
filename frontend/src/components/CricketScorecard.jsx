import { useEffect, useState } from 'react';
import { getScorecard } from '../api/cricketApi';

export default function CricketScorecard({ matchId, refreshTrigger }) {
    const [scorecard, setScorecard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeInningsTab, setActiveInningsTab] = useState(1);

    useEffect(() => {
        const fetchScorecard = async () => {
            try {
                const res = await getScorecard(matchId);
                if (res.success) {
                    setScorecard(res.data);
                } else {
                    setError(res.error || 'Failed to load scorecard.');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to fetch scorecard details.');
            } finally {
                setLoading(false);
            }
        };

        if (matchId) {
            fetchScorecard();
        }
    }, [matchId, refreshTrigger]);

    if (loading) {
        return (
            <div className="bg-gray-900 border border-gray-850 rounded-2xl p-8 text-center text-gray-400">
                Loading scorecard...
            </div>
        );
    }

    if (error || !scorecard) {
        return (
            <div className="bg-gray-900 border border-gray-850 rounded-2xl p-8 text-center text-red-400">
                {error || 'Scorecard is not available yet.'}
            </div>
        );
    }

    const { innings1, innings2 } = scorecard;

    const renderInningsData = (innings) => {
        if (!innings) {
            return (
                <div className="text-center py-8 text-gray-500 font-medium">
                    Innings has not started yet.
                </div>
            );
        }

        const battingList = innings.batting || [];
        const bowlingList = innings.bowling || [];

        // Filter out batsmen who Did Not Bat (DNB) if you want to only show active/out batsmen,
        // or show DNB batsmen at the bottom.
        // Let's show DNB batsmen at the bottom as a list of names, which is standard in cricket!
        const playedBatsmen = battingList.filter(b => b.status !== 'DNB');
        const dnbBatsmen = battingList.filter(b => b.status === 'DNB');

        return (
            <div className="space-y-6">
                {/* Team Total Info */}
                <div className="flex justify-between items-center bg-gray-800/40 border border-gray-800/50 p-4 rounded-xl">
                    <div>
                        <h4 className="text-lg font-black text-white">{innings.teamName}</h4>
                        <p className="text-xs text-gray-400 font-semibold mt-0.5">
                            Overs: <span className="text-white font-bold">{innings.totalOversBowled}</span> | Extras: <span className="text-white font-bold">{innings.extras}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black text-indigo-400 font-mono">
                            {innings.totalRuns}/{innings.totalWickets}
                        </span>
                    </div>
                </div>

                {/* Batting Section */}
                <div>
                    <h5 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3">Batting</h5>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-800 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                    <th className="py-2.5 px-3">Batsman</th>
                                    <th className="py-2.5 px-3">Dismissal</th>
                                    <th className="py-2.5 px-3 text-right">R</th>
                                    <th className="py-2.5 px-3 text-right">B</th>
                                    <th className="py-2.5 px-3 text-right">4s</th>
                                    <th className="py-2.5 px-3 text-right">6s</th>
                                    <th className="py-2.5 px-3 text-right">SR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/40">
                                {playedBatsmen.map((b) => {
                                    const sr = b.ballsFaced > 0 ? ((b.runs / b.ballsFaced) * 100).toFixed(1) : '0.0';
                                    let dismissalText = 'Not Out';
                                    if (b.status === 'OUT') {
                                        if (b.dismissalType === 'RUN_OUT') {
                                            dismissalText = 'Run Out';
                                        } else if (b.dismissedByName) {
                                            dismissalText = `${b.dismissalType.toLowerCase()} b. ${b.dismissedByName}`;
                                        } else {
                                            dismissalText = b.dismissalType.toLowerCase();
                                        }
                                    }

                                    return (
                                        <tr key={b.playerId} className="hover:bg-gray-800/10 text-xs transition-colors">
                                            <td className="py-3 px-3 font-bold text-white">
                                                {b.playerName} {b.status === 'NOT_OUT' && <span className="text-indigo-400">*</span>}
                                            </td>
                                            <td className="py-3 px-3 text-gray-400 capitalize">{dismissalText}</td>
                                            <td className="py-3 px-3 text-right font-bold text-white font-mono">{b.runs}</td>
                                            <td className="py-3 px-3 text-right text-gray-400 font-mono">{b.ballsFaced}</td>
                                            <td className="py-3 px-3 text-right text-gray-400 font-mono">{b.fours}</td>
                                            <td className="py-3 px-3 text-right text-gray-400 font-mono">{b.sixes}</td>
                                            <td className="py-3 px-3 text-right text-indigo-400 font-bold font-mono">{sr}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* DNB Batsmen */}
                    {dnbBatsmen.length > 0 && (
                        <div className="mt-4 text-xs text-gray-400 border-t border-gray-800/60 pt-3 flex flex-wrap gap-1.5 items-center">
                            <span className="font-bold uppercase tracking-wider text-[10px] text-gray-500">Yet to Bat:</span>
                            {dnbBatsmen.map((b, idx) => (
                                <span key={b.playerId} className="bg-gray-900 border border-gray-800 px-2.5 py-1 rounded text-gray-300 font-medium">
                                    {b.playerName}{idx < dnbBatsmen.length - 1 ? '' : ''}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bowling Section */}
                <div>
                    <h5 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3">Bowling</h5>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-800 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                    <th className="py-2.5 px-3">Bowler</th>
                                    <th className="py-2.5 px-3 text-right">O</th>
                                    <th className="py-2.5 px-3 text-right">M</th>
                                    <th className="py-2.5 px-3 text-right">R</th>
                                    <th className="py-2.5 px-3 text-right">W</th>
                                    <th className="py-2.5 px-3 text-right">Econ</th>
                                    <th className="py-2.5 px-3 text-right">Wd</th>
                                    <th className="py-2.5 px-3 text-right">Nb</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/40">
                                {bowlingList.map((b) => {
                                    const totalBalls = b.ballsBowled;
                                    const econ = totalBalls > 0 ? ((b.runsConceded * 6) / totalBalls).toFixed(2) : '0.00';
                                    return (
                                        <tr key={b.playerId} className="hover:bg-gray-800/10 text-xs transition-colors">
                                            <td className="py-3 px-3 font-bold text-white">{b.playerName}</td>
                                            <td className="py-3 px-3 text-right text-white font-mono">{b.oversBowled}</td>
                                            <td className="py-3 px-3 text-right text-gray-400 font-mono">{b.maidens}</td>
                                            <td className="py-3 px-3 text-right text-white font-mono">{b.runsConceded}</td>
                                            <td className="py-3 px-3 text-right font-bold text-green-400 font-mono">{b.wickets}</td>
                                            <td className="py-3 px-3 text-right text-indigo-400 font-bold font-mono">{econ}</td>
                                            <td className="py-3 px-3 text-right text-gray-400 font-mono">{b.wides}</td>
                                            <td className="py-3 px-3 text-right text-gray-400 font-mono">{b.noBalls}</td>
                                        </tr>
                                    );
                                })}
                                {bowlingList.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4 text-gray-500">No bowlers have bowled yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg space-y-6">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <h3 className="text-xl font-black uppercase tracking-wider text-white">Full Scorecard</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveInningsTab(1)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all border ${
                            activeInningsTab === 1
                                ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-md'
                                : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-gray-300'
                        }`}
                    >
                        {innings1 ? innings1.teamName : 'Innings 1'}
                    </button>
                    <button
                        onClick={() => setActiveInningsTab(2)}
                        disabled={!innings2}
                        className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all border ${
                            !innings2
                                ? 'opacity-40 cursor-not-allowed bg-gray-950 border-gray-800 text-gray-600'
                                : activeInningsTab === 2
                                    ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-md'
                                    : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-gray-300'
                        }`}
                    >
                        {innings2 ? innings2.teamName : 'Innings 2'}
                    </button>
                </div>
            </div>

            {activeInningsTab === 1 ? renderInningsData(innings1) : renderInningsData(innings2)}
        </div>
    );
}
