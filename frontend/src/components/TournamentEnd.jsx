import { useEffect, useState } from 'react';
import { getTournamentResult } from '../api/tournamentApi';

export default function TournamentEnd({ tournamentId }) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await getTournamentResult(tournamentId);
                if (res.success) {
                    setResult(res.data);
                } else {
                    setError(res.error || 'Failed to load tournament results.');
                }
            } catch (err) {
                setError('Results are not ready or could not be loaded.');
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [tournamentId]);

    if (loading) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-gray-400">
                Loading tournament summary...
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-red-500">
                {error || 'Tournament is not fully complete yet.'}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Celebration header */}
            <div className="text-center bg-gradient-to-r from-yellow-600/10 via-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-2xl p-8 shadow-xl">
                <div className="text-6xl mb-4 animate-bounce">👑</div>
                <h2 className="text-4xl font-black text-white uppercase tracking-wider mb-2">Tournament Complete</h2>
                <p className="text-yellow-400 font-bold uppercase tracking-widest text-sm">
                    Champion Crowned: {result.winner?.name || 'TBD'}
                </p>
            </div>

            {/* Podium */}
            <div className={`grid grid-cols-1 ${result.secondRunner ? 'md:grid-cols-3' : 'md:grid-cols-2 max-w-2xl mx-auto'} gap-6 items-end`}>
                {/* 2nd Place */}
                <div className="bg-gradient-to-b from-gray-800/80 to-gray-900 border border-gray-700/50 hover:border-gray-500 rounded-2xl p-6 text-center order-2 md:order-1 h-[240px] flex flex-col justify-center shadow-lg transition-all">
                    <div className="text-4xl mb-2 text-gray-400">🥈</div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Runner Up</span>
                    <h3 className="text-2xl font-black text-white truncate mb-1">{result.runnerUp?.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">Owner: {result.runnerUp?.ownerName}</p>
                </div>

                {/* 1st Place */}
                <div className="bg-gradient-to-b from-yellow-500/10 via-yellow-600/5 to-gray-900 border-2 border-yellow-500/80 hover:border-yellow-400 rounded-2xl p-8 text-center order-1 md:order-2 h-[280px] flex flex-col justify-center shadow-[0_0_35px_rgba(234,179,8,0.15)] scale-105 transition-all">
                    <div className="text-5xl mb-3">🏆</div>
                    <span className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-1.5">Champion</span>
                    <h3 className="text-3xl font-black text-white truncate mb-1.5">{result.winner?.name}</h3>
                    <p className="text-sm text-yellow-200/70 font-semibold mb-4">Owner: {result.winner?.ownerName}</p>
                    <div className="bg-yellow-500/15 border border-yellow-500/30 text-yellow-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mx-auto">
                        Winner
                    </div>
                </div>

                {/* 3rd Place */}
                {result.secondRunner && (
                    <div className="bg-gradient-to-b from-amber-900/40 to-gray-900 border border-amber-800/40 hover:border-amber-700 rounded-2xl p-6 text-center order-3 md:order-3 h-[220px] flex flex-col justify-center shadow-lg transition-all">
                        <div className="text-4xl mb-2">🥉</div>
                        <span className="text-xs font-bold text-amber-500/80 uppercase tracking-widest mb-1">2nd Runner Up</span>
                        <h3 className="text-2xl font-black text-white truncate mb-1">{result.secondRunner?.name}</h3>
                        <p className="text-sm text-gray-500 font-medium">Owner: {result.secondRunner?.ownerName}</p>
                    </div>
                )}
            </div>

            {/* Individual Honors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Golden Boot (Top Scorer) */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-md flex items-center space-x-6">
                    <div className="text-5xl bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">⚽</div>
                    <div className="flex-1">
                        <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest bg-yellow-500/10 border border-yellow-500/25 px-2.5 py-0.5 rounded">
                            Golden Boot
                        </span>
                        {result.topScorer ? (
                            <>
                                <h4 className="text-xl font-black text-white mt-2 mb-1">{result.topScorer.playerName}</h4>
                                <p className="text-sm text-gray-400 font-semibold">{result.topScorer.teamName}</p>
                                <p className="text-lg font-black text-yellow-500 mt-2">
                                    {result.topScorer.count} Goals
                                </p>
                            </>
                        ) : (
                            <p className="text-sm text-gray-500 mt-2">No goals scored in this tournament.</p>
                        )}
                    </div>
                </div>

                {/* Playmaker of the Tournament (Top Assister) */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-md flex items-center space-x-6">
                    <div className="text-5xl bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">🎯</div>
                    <div className="flex-1">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/25 px-2.5 py-0.5 rounded">
                            Playmaker
                        </span>
                        {result.topAssister ? (
                            <>
                                <h4 className="text-xl font-black text-white mt-2 mb-1">{result.topAssister.playerName}</h4>
                                <p className="text-sm text-gray-400 font-semibold">{result.topAssister.teamName}</p>
                                <p className="text-lg font-black text-blue-400 mt-2">
                                    {result.topAssister.count} Assists
                                </p>
                            </>
                        ) : (
                            <p className="text-sm text-gray-500 mt-2">No assists recorded in this tournament.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
