import React from 'react';

export default function SuperOverScreen({ matchState }) {
    if (!matchState) return null;

    const { status, inningsNumber, battingTeamName, bowlingTeamName } = matchState;
    const isSuperOver = status === 'SUPER_OVER_1' || status === 'SUPER_OVER_2';

    if (!isSuperOver) return null;

    const superOverNum = status === 'SUPER_OVER_1' ? '1st' : '2nd'; // or can be derived

    return (
        <div className="bg-gradient-to-r from-red-950/40 via-purple-900/40 to-red-950/40 border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-4 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <span className="text-3xl">⚡</span>
                    <div>
                        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400 uppercase tracking-widest">
                            SUPER OVER ACTIVE
                        </h2>
                        <p className="text-xs text-gray-300 font-bold uppercase tracking-wider mt-0.5">
                            Match Tied! Proceeding to Super Over
                        </p>
                    </div>
                </div>
                <div className="bg-red-500/20 border border-red-500/45 text-red-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    Tie-breaker
                </div>
            </div>

            <div className="text-sm text-gray-300 border-t border-gray-800/80 pt-3 space-y-2">
                <p>
                    <span className="font-bold text-white">Super Over Rules:</span> Each team gets 1 over (6 legal balls) to bat. A maximum of 2 wickets (all-out at 2 wickets) can fall. The team with the highest runs wins.
                </p>
                <p>
                    Current Phase: <span className="text-yellow-400 font-extrabold uppercase font-mono">{superOverNum} Innings {inningsNumber}</span>
                </p>
                <p className="text-xs text-gray-400">
                    Batting Team: <span className="text-white font-bold">{battingTeamName}</span> | Bowling Team: <span className="text-white font-bold">{bowlingTeamName}</span>
                </p>
            </div>
        </div>
    );
}
