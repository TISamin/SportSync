import { generateKnockout } from '../api/tournamentApi';

export default function KnockoutBracket({ fixtures, isAdmin, tournamentId, onRefresh, onEnterResult }) {
    const semis = fixtures.filter(f => f.round === 'SEMI');
    const finalMatch = fixtures.find(f => f.round === 'FINAL');

    const handleGenerate = async () => {
        try {
            const res = await generateKnockout(tournamentId);
            if (res.success) {
                onRefresh();
            } else {
                alert(res.error || 'Failed to generate knockout fixtures.');
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to generate knockout fixtures. Ensure all group matches are done.');
        }
    };

    if (fixtures.length === 0) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center shadow-lg">
                <div className="text-5xl mb-4">🏆</div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Knockout Stage</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6 text-sm">
                    The knockout stage features the top 4 teams from the group stage playing in Semi-Finals and the Final.
                </p>
                {isAdmin ? (
                    <button
                        onClick={handleGenerate}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-6 py-3 rounded-lg uppercase tracking-wider transition-all"
                    >
                        Generate Knockout Fixtures
                    </button>
                ) : (
                    <div className="inline-block bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs px-4 py-2 rounded-full font-bold">
                        Awaiting Group Stage Completion
                    </div>
                )}
            </div>
        );
    }

    const renderMatchCard = (match, label) => {
        if (!match) return (
            <div className="bg-gray-800/40 border border-gray-800/80 border-dashed rounded-xl p-5 text-center text-gray-500 min-w-[240px]">
                <p className="text-xs uppercase tracking-wider font-bold text-gray-600 mb-1">{label}</p>
                <p className="text-sm font-semibold">TBD</p>
            </div>
        );

        const isHomeWinner = match.status === 'DONE' && match.homeScore > match.awayScore;
        const isAwayWinner = match.status === 'DONE' && match.awayScore > match.homeScore;

        return (
            <div className="bg-gray-900 border border-gray-800 hover:border-gray-700/80 rounded-xl p-5 min-w-[260px] shadow-md transition-all relative group">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                        {label}
                    </span>
                    {match.status === 'DONE' && (
                        <span className="text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                            Done
                        </span>
                    )}
                </div>

                <div className="space-y-2.5">
                    {/* Home Team Row */}
                    <div className="flex justify-between items-center">
                        <span className={`text-sm font-semibold truncate ${
                            match.status === 'DONE' ? (isHomeWinner ? 'text-white' : 'text-gray-500') : 'text-gray-300'
                        }`}>
                            {match.homeTeamName}
                        </span>
                        {match.status === 'DONE' ? (
                            <span className={`text-sm font-black font-mono px-2 py-0.5 rounded ${
                                isHomeWinner ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-gray-800 text-gray-500'
                            }`}>
                                {match.homeScore}
                            </span>
                        ) : (
                            <span className="text-xs text-gray-500 font-semibold uppercase font-mono">-</span>
                        )}
                    </div>

                    {/* Away Team Row */}
                    <div className="flex justify-between items-center">
                        <span className={`text-sm font-semibold truncate ${
                            match.status === 'DONE' ? (isAwayWinner ? 'text-white' : 'text-gray-500') : 'text-gray-300'
                        }`}>
                            {match.awayTeamName}
                        </span>
                        {match.status === 'DONE' ? (
                            <span className={`text-sm font-black font-mono px-2 py-0.5 rounded ${
                                isAwayWinner ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-gray-800 text-gray-500'
                            }`}>
                                {match.awayScore}
                            </span>
                        ) : (
                            <span className="text-xs text-gray-500 font-semibold uppercase font-mono">-</span>
                        )}
                    </div>
                </div>

                {isAdmin && match.status !== 'DONE' && (
                    <button
                        onClick={() => onEnterResult(match)}
                        className="w-full mt-4 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-transparent text-xs font-bold py-2 rounded-lg uppercase tracking-wider transition-all"
                    >
                        Enter Result
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <h3 className="text-2xl font-black text-white uppercase tracking-wider border-b border-gray-800 pb-3">
                Knockout Bracket
            </h3>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 py-6 overflow-x-auto">
                {/* Semis Column */}
                <div className="flex flex-col gap-6 w-full md:w-auto">
                    <h4 className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Semi-Finals</h4>
                    {renderMatchCard(semis[0], 'Semi-Final 1')}
                    {renderMatchCard(semis[1], 'Semi-Final 2')}
                </div>

                {/* Connecting Line (Visual element) */}
                <div className="hidden md:flex flex-col justify-center items-center h-full">
                    <div className="w-8 h-0.5 bg-gray-800"></div>
                </div>

                {/* Final Column */}
                <div className="flex flex-col justify-center items-center w-full md:w-auto">
                    <h4 className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Grand Final</h4>
                    {renderMatchCard(finalMatch, 'Grand Final')}
                </div>
            </div>
        </div>
    );
}
