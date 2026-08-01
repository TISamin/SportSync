import { generateKnockout, generatePhase2Knockout } from '../api/tournamentApi';

export default function KnockoutBracket({ fixtures, isAdmin, tournamentId, tournamentType, onRefresh, onEnterResult }) {
    const isDouble = tournamentType === 'DOUBLE';
    
    const r16Matches = fixtures.filter(f => f.round === 'ROUND_OF_16');
    const quarters = fixtures.filter(f => f.round === 'QUARTER');
    const semis = fixtures.filter(f => f.round === 'SEMI');
    const finalMatch = fixtures.find(f => f.round === 'FINAL');

    const handleGenerate = async () => {
        try {
            const res = isDouble ? await generatePhase2Knockout(tournamentId) : await generateKnockout(tournamentId);
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
            <div className="bg-surface border border-border rounded-2xl p-8 text-center shadow-lg">
                <div className="text-5xl mb-4">🏆</div>
                <h3 className="text-xl font-black text-txt uppercase tracking-wider mb-2">Knockout Stage</h3>
                <p className="text-muted max-w-md mx-auto mb-6 text-sm">
                    {isDouble 
                        ? 'The knockout stage features the top 16 teams (top 4 from each of the 4 Phase 2 groups) playing in a bracket from Round of 16 to the Grand Final.' 
                        : 'The knockout stage features the top 4 teams from the group stage playing in Semi-Finals and the Final.'
                    }
                </p>
                {isAdmin ? (
                    <button
                        onClick={handleGenerate}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-6 py-3 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                    >
                        Generate Knockout Fixtures
                    </button>
                ) : (
                    <div className="inline-block bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs px-4 py-2 rounded-full font-bold">
                        Awaiting Group Stage Completion
                    </div>
                )}
            </div>
        );
    }

    const renderMatchCard = (match, label, key) => {
        if (!match) return (
            <div key={key} className="bg-input/40 border border-border/80 border-dashed rounded-xl p-5 text-center text-muted min-w-[220px]">
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted mb-1 opacity-70">{label}</p>
                <p className="text-sm font-semibold">TBD</p>
            </div>
        );

        const isHomeWinner = match.status === 'DONE' && match.homeScore > match.awayScore;
        const isAwayWinner = match.status === 'DONE' && match.awayScore > match.homeScore;

        return (
            <div key={match.id} className="bg-surface border border-border hover:border-indigo-500/30 rounded-xl p-4 min-w-[240px] shadow-md transition-all relative group flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                            {label}
                        </span>
                        {match.status === 'DONE' && (
                            <span className="text-[9px] font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                                Done
                            </span>
                        )}
                    </div>

                    <div className="space-y-2">
                        {/* Home Team Row */}
                        <div className="flex justify-between items-center">
                            <span className={`text-xs font-semibold truncate max-w-[150px] ${
                                match.status === 'DONE' ? (isHomeWinner ? 'text-txt' : 'text-muted') : 'text-txt'
                            }`}>
                                {match.homeTeamName}
                            </span>
                            {match.status === 'DONE' ? (
                                <span className={`text-xs font-black font-mono px-2 py-0.5 rounded ${
                                    isHomeWinner ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25' : 'bg-input text-muted'
                                }`}>
                                    {match.homeScore}
                                </span>
                            ) : (
                                <span className="text-xs text-muted font-semibold font-mono">-</span>
                            )}
                        </div>

                        {/* Away Team Row */}
                        <div className="flex justify-between items-center">
                            <span className={`text-xs font-semibold truncate max-w-[150px] ${
                                match.status === 'DONE' ? (isAwayWinner ? 'text-txt' : 'text-muted') : 'text-txt'
                            }`}>
                                {match.awayTeamName}
                            </span>
                            {match.status === 'DONE' ? (
                                <span className={`text-xs font-black font-mono px-2 py-0.5 rounded ${
                                    isAwayWinner ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25' : 'bg-input text-muted'
                                }`}>
                                    {match.awayScore}
                                </span>
                            ) : (
                                <span className="text-xs text-muted font-semibold font-mono">-</span>
                            )}
                        </div>
                    </div>
                </div>

                {isAdmin && match.status !== 'DONE' && (
                    <button
                        onClick={() => onEnterResult(match)}
                        className="w-full mt-3 bg-indigo-500/10 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-transparent text-[10px] font-bold py-1.5 rounded uppercase tracking-wider transition-all cursor-pointer"
                    >
                        Enter Result
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <h3 className="text-2xl font-black text-txt uppercase tracking-wider border-b border-border pb-3">
                Knockout Bracket
            </h3>

            <div className="flex flex-row gap-6 md:gap-10 py-6 overflow-x-auto items-start select-none">
                {/* Round of 16 Column */}
                {isDouble && (
                    <div className="flex flex-col gap-4 min-w-[240px]">
                        <h4 className="text-center text-[10px] font-black text-muted uppercase tracking-widest mb-1 bg-surface border border-border py-1.5 rounded-lg">Round of 16</h4>
                        <div className="flex flex-col gap-4">
                            {Array.from({ length: 8 }).map((_, idx) => 
                                renderMatchCard(r16Matches[idx], `Match R16-${idx + 1}`, `r16-${idx}`)
                            )}
                        </div>
                    </div>
                )}

                {/* Quarter-Finals Column */}
                {isDouble && (
                    <div className="flex flex-col gap-4 min-w-[240px] md:mt-16">
                        <h4 className="text-center text-[10px] font-black text-muted uppercase tracking-widest mb-1 bg-surface border border-border py-1.5 rounded-lg">Quarter-Finals</h4>
                        <div className="flex flex-col gap-12">
                            {Array.from({ length: 4 }).map((_, idx) => 
                                renderMatchCard(quarters[idx], `Match QF-${idx + 1}`, `qf-${idx}`)
                            )}
                        </div>
                    </div>
                )}

                {/* Semi-Finals Column */}
                <div className="flex flex-col gap-4 min-w-[240px] md:mt-32">
                    <h4 className="text-center text-[10px] font-black text-muted uppercase tracking-widest mb-1 bg-surface border border-border py-1.5 rounded-lg">Semi-Finals</h4>
                    <div className="flex flex-col gap-28">
                        {Array.from({ length: 2 }).map((_, idx) => 
                            renderMatchCard(semis[idx], `Match SF-${idx + 1}`, `sf-${idx}`)
                        )}
                    </div>
                </div>

                {/* Grand Final Column */}
                <div className="flex flex-col gap-4 min-w-[240px] md:mt-56">
                    <h4 className="text-center text-[10px] font-black text-muted uppercase tracking-widest mb-1 bg-surface border border-border py-1.5 rounded-lg">Grand Final</h4>
                    <div className="flex flex-col gap-4">
                        {renderMatchCard(finalMatch, 'Grand Final', 'final')}
                    </div>
                </div>
            </div>
        </div>
    );
}

