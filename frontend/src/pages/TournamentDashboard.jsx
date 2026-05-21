import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getTournament,
    getTournamentFixtures,
    getTournamentStandings,
    getKnockoutFixtures,
    getTopScorers,
    getTopAssisters,
    getTournamentTeams,
    generatePhase2
} from '../api/tournamentApi';
import MatchResultModal from '../components/MatchResultModal';
import KnockoutBracket from '../components/KnockoutBracket';
import TournamentEnd from '../components/TournamentEnd';
import { getCricketTopScorers, getCricketTopWicketTakers } from '../api/cricketApi';

export default function TournamentDashboard() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [tournament, setTournament] = useState(null);
    const [activeTab, setActiveTab] = useState('standings');
    const [fixtures, setFixtures] = useState([]);
    const [standings, setStandings] = useState([]);
    const [knockouts, setKnockouts] = useState([]);
    const [topScorers, setTopScorers] = useState([]);
    const [topAssisters, setTopAssisters] = useState([]);
    const [teams, setTeams] = useState([]);

    // Double Phase Selectors
    const [selectedPhase, setSelectedPhase] = useState(1);
    const [selectedGroup, setSelectedGroup] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFixture, setSelectedFixture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isAdmin, setIsAdmin] = useState(true);
    const [generatingPhase2Loading, setGeneratingPhase2Loading] = useState(false);

    const fetchMetadata = async () => {
        try {
            const res = await getTournament(id);
            if (res.success) {
                setTournament(res.data);
            }
        } catch (err) {
            console.error('Error fetching tournament metadata', err);
        }
    };

    const fetchStandingsData = async (phase, group) => {
        try {
            const res = await getTournamentStandings(id, phase, group);
            if (res.success) {
                setStandings(res.data);
            }
        } catch (err) {
            console.error('Error fetching standings', err);
        }
    };

    const refreshData = async () => {
        try {
            const metadataRes = await getTournament(id);
            if (metadataRes.success) {
                const tournamentData = metadataRes.data;
                setTournament(tournamentData);
                const isCricket = tournamentData.sport === 'CRICKET';

                const [fixRes, koRes, scorersRes, assistersRes, teamsRes] = await Promise.all([
                    getTournamentFixtures(id),
                    getKnockoutFixtures(id),
                    isCricket ? getCricketTopScorers(id) : getTopScorers(id),
                    isCricket ? getCricketTopWicketTakers(id) : getTopAssisters(id),
                    getTournamentTeams(id)
                ]);

                if (fixRes.success) setFixtures(fixRes.data);
                if (koRes.success) setKnockouts(koRes.data);
                if (scorersRes.success) setTopScorers(scorersRes.data);
                if (assistersRes.success) setTopAssisters(assistersRes.data);
                if (teamsRes.success) setTeams(teamsRes.data);

                await fetchStandingsData(selectedPhase, selectedGroup);
            } else {
                setError('Failed to fetch tournament metadata.');
            }
        } catch (err) {
            setError('Failed to fetch tournament data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, [id]);

    // Re-fetch standings whenever selectedPhase or selectedGroup changes
    useEffect(() => {
        if (tournament) {
            fetchStandingsData(selectedPhase, selectedGroup);
        }
    }, [selectedPhase, selectedGroup]);

    const handleGeneratePhase2 = async () => {
        setGeneratingPhase2Loading(true);
        try {
            const res = await generatePhase2(id);
            if (res.success) {
                setSelectedPhase(2);
                setSelectedGroup(1);
                await refreshData();
            } else {
                alert(res.error || 'Failed to generate Phase 2 groups.');
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to generate Phase 2. Ensure all Phase 1 matches are done.');
        } finally {
            setGeneratingPhase2Loading(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white text-lg">Loading...</div>;
    }

    if (error || !tournament) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-red-500 p-6 text-center">
                <div>
                    <h2 className="text-2xl font-black mb-4">Error</h2>
                    <p className="mb-6">{error || 'Tournament not found.'}</p>
                    <button onClick={() => navigate('/')} className="bg-indigo-600 px-6 py-2 rounded font-bold uppercase">Go Home</button>
                </div>
            </div>
        );
    }

    const isDouble = tournament.type === 'DOUBLE';
    
    // Check stages progression
    const hasPhase2Fixtures = fixtures.some(f => f.phaseNumber === 2);
    const pendingPhase1Count = fixtures.filter(f => f.phaseNumber === 1 && f.round === 'GROUP' && f.status === 'PENDING').length;
    const pendingPhase2Count = fixtures.filter(f => f.phaseNumber === 2 && f.round === 'GROUP' && f.status === 'PENDING').length;

    // A tournament is done if the final match exists and is completed
    const finalMatch = knockouts.find(k => k.round === 'FINAL');
    const isTournamentComplete = finalMatch && finalMatch.status === 'DONE';

    // Phase 1 Group Label mapping
    const getGroupLabel = (groupNum, phase) => {
        if (phase === 1 && isDouble) {
            return `Group ${String.fromCharCode(64 + groupNum)}`; // Group A to H
        }
        return `Group ${groupNum}`;
    };

    // Filter fixtures based on active phase and group tabs
    const filteredFixtures = fixtures.filter(
        f => f.phaseNumber === selectedPhase && f.groupNumber === selectedGroup && f.round === 'GROUP'
    );

    return (
        <div className="min-h-screen bg-black text-white p-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg">
                <div>
                    <h1 className="text-3xl font-black tracking-widest uppercase">
                        Sport<span className="text-indigo-500">Sync</span> Tournament
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Name: <span className="text-white font-bold">{tournament.name}</span> | Type: <span className="text-indigo-400 font-bold font-mono">{tournament.type}</span>
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setIsAdmin(!isAdmin)}
                        className={`text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider transition-all ${
                            isAdmin 
                                ? 'bg-green-500/10 text-green-400 border border-green-500/25'
                                : 'bg-gray-800 text-gray-500 border border-transparent'
                        }`}
                    >
                        {isAdmin ? 'Admin View: ON' : 'Admin View: OFF'}
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="text-xs bg-gray-800 hover:bg-gray-700 font-bold px-4 py-2 rounded-full uppercase tracking-wider transition-all"
                    >
                        Main Menu
                    </button>
                </div>
            </header>

            {/* Manual Action banners for Double Phase flow */}
            {isDouble && isAdmin && !hasPhase2Fixtures && pendingPhase1Count === 0 && (
                <div className="mb-8 bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 border border-indigo-500/40 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
                    <div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Phase 1 Finished!</h3>
                        <p className="text-xs text-indigo-200">All 224 matches of the first phase are complete. Generate Phase 2 groups.</p>
                    </div>
                    <button
                        onClick={handleGeneratePhase2}
                        disabled={generatingPhase2Loading}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-6 py-3 rounded-lg text-xs uppercase tracking-widest transition-all"
                    >
                        {generatingPhase2Loading ? 'Generating...' : 'Generate Phase 2 Groups'}
                    </button>
                </div>
            )}

            {/* Complete Tournament Summary View */}
            {isTournamentComplete && (
                <div className="mb-8">
                    <TournamentEnd tournamentId={id} />
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-800 mb-8 overflow-x-auto gap-6">
                {['standings', 'fixtures', 'knockout', 'stats'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`text-sm font-black uppercase tracking-widest pb-3 border-b-2 transition-all whitespace-nowrap ${
                            activeTab === tab
                                ? 'text-indigo-500 border-indigo-500'
                                : 'text-gray-500 border-transparent hover:text-gray-300'
                        }`}
                    >
                        {tab === 'knockout' ? 'Knockout Stage' : tab}
                    </button>
                ))}
            </div>

            {/* Phase / Group Selectors (Only shown for standings and fixtures tabs) */}
            {(activeTab === 'standings' || activeTab === 'fixtures') && (
                <div className="bg-gray-900/30 border border-gray-850 p-5 rounded-2xl mb-8 space-y-4">
                    {/* Phase Selector */}
                    {isDouble && (
                        <div className="flex items-center space-x-4">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider min-w-[60px]">Phase:</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedPhase(1);
                                        setSelectedGroup(1);
                                    }}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all border ${
                                        selectedPhase === 1
                                            ? 'bg-indigo-600/10 border-indigo-500 text-white'
                                            : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-300'
                                    }`}
                                >
                                    Phase 1 (Groups A-H)
                                </button>
                                <button
                                    onClick={() => {
                                        if (!hasPhase2Fixtures) {
                                            alert('Phase 2 has not been generated yet. Finish Phase 1 matches first.');
                                            return;
                                        }
                                        setSelectedPhase(2);
                                        setSelectedGroup(1);
                                    }}
                                    disabled={!hasPhase2Fixtures}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all border ${
                                        !hasPhase2Fixtures 
                                            ? 'opacity-40 cursor-not-allowed bg-gray-900 border-gray-800 text-gray-600'
                                            : selectedPhase === 2
                                                ? 'bg-indigo-600/10 border-indigo-500 text-white'
                                                : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-300'
                                    }`}
                                >
                                    Phase 2 (Groups 1-4)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Group Selector */}
                    <div className="flex items-center space-x-4 overflow-x-auto">
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider min-w-[60px]">Group:</span>
                        <div className="flex gap-1.5">
                            {Array.from({ length: selectedPhase === 1 && isDouble ? 8 : (selectedPhase === 2 ? 4 : 1) }).map((_, idx) => {
                                const groupNum = idx + 1;
                                return (
                                    <button
                                        key={groupNum}
                                        onClick={() => setSelectedGroup(groupNum)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                            selectedGroup === groupNum
                                                ? 'bg-indigo-600 border-transparent text-white shadow-md'
                                                : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                                        }`}
                                    >
                                        {getGroupLabel(groupNum, selectedPhase)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Contents */}
            <div className="space-y-6">
                {activeTab === 'standings' && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-xl font-black uppercase tracking-wider mb-4 border-b border-gray-800 pb-3">
                            Standings — {getGroupLabel(selectedGroup, selectedPhase)}
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-800 text-xs text-gray-500 font-bold uppercase tracking-wider">
                                        <th className="py-3 px-4">Pos</th>
                                        <th className="py-3 px-4">Team</th>
                                        <th className="py-3 px-4 text-center">P</th>
                                        <th className="py-3 px-4 text-center">W</th>
                                        <th className="py-3 px-4 text-center">{tournament.sport === 'CRICKET' ? 'T' : 'D'}</th>
                                        <th className="py-3 px-4 text-center">L</th>
                                        {tournament.sport === 'CRICKET' ? (
                                            <th className="py-3 px-4 text-center">NRR</th>
                                        ) : (
                                            <>
                                                <th className="py-3 px-4 text-center">GD</th>
                                                <th className="py-3 px-4 text-center">GF</th>
                                                <th className="py-3 px-4 text-center">GA</th>
                                            </>
                                        )}
                                        <th className="py-3 px-4 text-center text-indigo-400">Pts</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/40">
                                    {standings.map((standing, index) => {
                                        const team = teams.find(t => t.id === standing.teamId);
                                        return (
                                            <tr key={standing.id} className="hover:bg-gray-800/10 transition-colors">
                                                <td className="py-3.5 px-4 font-bold text-sm text-gray-400">{index + 1}</td>
                                                <td className="py-3.5 px-4 font-bold text-white text-sm">{team?.name || `Team ${standing.teamId}`}</td>
                                                <td className="py-3.5 px-4 text-center text-sm font-semibold">{standing.played}</td>
                                                <td className="py-3.5 px-4 text-center text-sm text-green-400 font-semibold">{standing.won}</td>
                                                <td className="py-3.5 px-4 text-center text-sm text-gray-400 font-semibold">{standing.drawn}</td>
                                                <td className="py-3.5 px-4 text-center text-sm text-red-400 font-semibold">{standing.lost}</td>
                                                {tournament.sport === 'CRICKET' ? (
                                                    <td className={`py-3.5 px-4 text-center text-sm font-mono font-bold ${
                                                        (standing.nrr || 0) > 0 ? 'text-green-400' : (standing.nrr || 0) < 0 ? 'text-red-400' : 'text-gray-400'
                                                    }`}>
                                                        {(standing.nrr || 0) > 0 ? `+${(standing.nrr || 0).toFixed(3)}` : (standing.nrr || 0).toFixed(3)}
                                                    </td>
                                                ) : (
                                                    <>
                                                        <td className={`py-3.5 px-4 text-center text-sm font-mono font-bold ${
                                                            standing.goalDifference > 0 ? 'text-green-400' : standing.goalDifference < 0 ? 'text-red-400' : 'text-gray-400'
                                                        }`}>
                                                            {standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center text-sm font-mono text-gray-400">{standing.goalsFor}</td>
                                                        <td className="py-3.5 px-4 text-center text-sm font-mono text-gray-400">{standing.goalsAgainst}</td>
                                                    </>
                                                )}
                                                <td className="py-3.5 px-4 text-center font-black text-sm text-indigo-400">{standing.points}</td>
                                            </tr>
                                        );
                                    })}
                                    {standings.length === 0 && (
                                        <tr>
                                            <td colSpan={tournament.sport === 'CRICKET' ? 8 : 10} className="text-center py-8 text-gray-500 font-medium">No standings found for this group.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'fixtures' && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-xl font-black uppercase tracking-wider mb-4 border-b border-gray-800 pb-3">
                            Fixtures — {getGroupLabel(selectedGroup, selectedPhase)}
                        </h3>
                        
                        {filteredFixtures.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No group stage fixtures found for this group.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredFixtures.map(fixture => (
                                    <div key={fixture.id} className="bg-gray-800/35 border border-gray-800 rounded-xl p-4 flex justify-between items-center">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className={`font-semibold ${fixture.status === 'DONE' && fixture.homeScore > fixture.awayScore ? 'text-white' : 'text-gray-400'}`}>
                                                    {fixture.homeTeamName}
                                                </span>
                                                <span className="font-bold font-mono">
                                                    {fixture.status === 'DONE' ? fixture.homeScore : '-'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className={`font-semibold ${fixture.status === 'DONE' && fixture.awayScore > fixture.homeScore ? 'text-white' : 'text-gray-400'}`}>
                                                    {fixture.awayTeamName}
                                                </span>
                                                <span className="font-bold font-mono">
                                                    {fixture.status === 'DONE' ? fixture.awayScore : '-'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="ml-6 border-l border-gray-800 pl-4 flex flex-col items-center justify-center">
                                            {fixture.status === 'DONE' ? (
                                                <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-bold uppercase">
                                                    Done
                                                </span>
                                            ) : (
                                                <>
                                                    {isAdmin ? (
                                                        <button
                                                            onClick={() => {
                                                                if (tournament.sport === 'CRICKET') {
                                                                    navigate(`/tournament/${id}/cricket-match/${fixture.id}`);
                                                                } else {
                                                                    setSelectedFixture(fixture);
                                                                    setIsModalOpen(true);
                                                                }
                                                            }}
                                                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider transition-all"
                                                        >
                                                            Enter
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] bg-gray-800 text-gray-500 border border-gray-700/50 px-2 py-0.5 rounded font-bold uppercase">
                                                            Pending
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'knockout' && (
                    <KnockoutBracket
                        fixtures={knockouts}
                        isAdmin={isAdmin}
                        tournamentId={id}
                        tournamentType={tournament.type}
                        onRefresh={refreshData}
                        onEnterResult={(fixture) => {
                            if (tournament.sport === 'CRICKET') {
                                navigate(`/tournament/${id}/cricket-match/${fixture.id}`);
                            } else {
                                setSelectedFixture(fixture);
                                setIsModalOpen(true);
                            }
                        }}
                    />
                )}

                {activeTab === 'stats' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Top Scorers */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
                            <h3 className="text-lg font-black uppercase tracking-wider mb-4 border-b border-gray-800 pb-3 flex items-center">
                                <span className="mr-2">{tournament.sport === 'CRICKET' ? '🏏' : '⚽'}</span>
                                {tournament.sport === 'CRICKET' ? 'Top Run Scorers' : 'Top Scorers'}
                            </h3>
                            {topScorers.length === 0 ? (
                                <p className="text-gray-500 text-sm">
                                    {tournament.sport === 'CRICKET' ? 'No runs recorded yet.' : 'No goals recorded yet.'}
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {topScorers.map((stat, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-gray-800/40 p-3 rounded-lg border border-gray-800/50">
                                            <div>
                                                <p className="font-bold text-sm text-white">{stat.playerName}</p>
                                                <p className="text-xs text-gray-400 font-semibold">{stat.teamName}</p>
                                            </div>
                                            <span className="font-black text-indigo-400 font-mono text-base bg-indigo-500/10 px-3 py-1 rounded">
                                                {tournament.sport === 'CRICKET' ? `${stat.runs} Runs` : stat.statValue}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Top Assisters */}
                        <div className="bg-gray-900 border border-gray-850 rounded-2xl p-6 shadow-lg">
                            <h3 className="text-lg font-black uppercase tracking-wider mb-4 border-b border-gray-800 pb-3 flex items-center">
                                <span className="mr-2">{tournament.sport === 'CRICKET' ? '🥎' : '🎯'}</span>
                                {tournament.sport === 'CRICKET' ? 'Top Wicket Takers' : 'Top Assisters'}
                            </h3>
                            {topAssisters.length === 0 ? (
                                <p className="text-gray-500 text-sm">
                                    {tournament.sport === 'CRICKET' ? 'No wickets recorded yet.' : 'No assists recorded yet.'}
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {topAssisters.map((stat, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-gray-800/40 p-3 rounded-lg border border-gray-800/50">
                                            <div>
                                                <p className="font-bold text-sm text-white">{stat.playerName}</p>
                                                <p className="text-xs text-gray-400 font-semibold">{stat.teamName}</p>
                                            </div>
                                            <span className="font-black text-indigo-400 font-mono text-base bg-indigo-500/10 px-3 py-1 rounded">
                                                {tournament.sport === 'CRICKET' ? `${stat.wickets} Wkts` : stat.statValue}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Enter result modal */}
            <MatchResultModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                fixture={selectedFixture}
                teams={teams}
                onSaved={refreshData}
            />
        </div>
    );
}
