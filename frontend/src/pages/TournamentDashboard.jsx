import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getTournamentFixtures,
    getTournamentStandings,
    getKnockoutFixtures,
    getTopScorers,
    getTopAssisters,
    getTournamentTeams
} from '../api/tournamentApi';
import MatchResultModal from '../components/MatchResultModal';
import KnockoutBracket from '../components/KnockoutBracket';
import TournamentEnd from '../components/TournamentEnd';

export default function TournamentDashboard() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('standings');
    const [fixtures, setFixtures] = useState([]);
    const [standings, setStandings] = useState([]);
    const [knockouts, setKnockouts] = useState([]);
    const [topScorers, setTopScorers] = useState([]);
    const [topAssisters, setTopAssisters] = useState([]);
    const [teams, setTeams] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFixture, setSelectedFixture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // For now, since there's no auth, let the user toggle Admin view easily for testing/operations
    const [isAdmin, setIsAdmin] = useState(true);

    const refreshData = async () => {
        try {
            const [fixRes, standRes, koRes, scorersRes, assistersRes, teamsRes] = await Promise.all([
                getTournamentFixtures(id),
                getTournamentStandings(id),
                getKnockoutFixtures(id),
                getTopScorers(id),
                getTopAssisters(id),
                getTournamentTeams(id)
            ]);

            if (fixRes.success) setFixtures(fixRes.data);
            if (standRes.success) setStandings(standRes.data);
            if (koRes.success) setKnockouts(koRes.data);
            if (scorersRes.success) setTopScorers(scorersRes.data);
            if (assistersRes.success) setTopAssisters(assistersRes.data);
            if (teamsRes.success) setTeams(teamsRes.data);
        } catch (err) {
            setError('Failed to fetch tournament data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, [id]);

    if (loading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white text-lg">Loading...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-red-500 p-6 text-center">
                <div>
                    <h2 className="text-2xl font-black mb-4">Error</h2>
                    <p className="mb-6">{error}</p>
                    <button onClick={() => navigate('/')} className="bg-indigo-600 px-6 py-2 rounded font-bold uppercase">Go Home</button>
                </div>
            </div>
        );
    }

    // A tournament is done if the final match exists and is completed
    const finalMatch = knockouts.find(k => k.round === 'FINAL');
    const isTournamentComplete = finalMatch && finalMatch.status === 'DONE';

    return (
        <div className="min-h-screen bg-black text-white p-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg">
                <div>
                    <h1 className="text-3xl font-black tracking-widest uppercase">
                        Sport<span className="text-indigo-500">Sync</span> Tournament
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Tournament ID: <span className="text-indigo-400 font-mono font-bold">{id}</span></p>
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

            {/* Tab Contents */}
            <div className="space-y-6">
                {activeTab === 'standings' && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-xl font-black uppercase tracking-wider mb-4 border-b border-gray-800 pb-3">Standings</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-800 text-xs text-gray-500 font-bold uppercase tracking-wider">
                                        <th className="py-3 px-4">Pos</th>
                                        <th className="py-3 px-4">Team</th>
                                        <th className="py-3 px-4 text-center">P</th>
                                        <th className="py-3 px-4 text-center">W</th>
                                        <th className="py-3 px-4 text-center">D</th>
                                        <th className="py-3 px-4 text-center">L</th>
                                        <th className="py-3 px-4 text-center">GD</th>
                                        <th className="py-3 px-4 text-center">GF</th>
                                        <th className="py-3 px-4 text-center">GA</th>
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
                                                <td className={`py-3.5 px-4 text-center text-sm font-mono font-bold ${
                                                    standing.goalDifference > 0 ? 'text-green-400' : standing.goalDifference < 0 ? 'text-red-400' : 'text-gray-400'
                                                }`}>
                                                    {standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}
                                                </td>
                                                <td className="py-3.5 px-4 text-center text-sm font-mono text-gray-400">{standing.goalsFor}</td>
                                                <td className="py-3.5 px-4 text-center text-sm font-mono text-gray-400">{standing.goalsAgainst}</td>
                                                <td className="py-3.5 px-4 text-center font-black text-sm text-indigo-400">{standing.points}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'fixtures' && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-xl font-black uppercase tracking-wider mb-4 border-b border-gray-800 pb-3">Fixtures</h3>
                        
                        {fixtures.filter(f => f.round === 'GROUP').length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No group stage fixtures found.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {fixtures.filter(f => f.round === 'GROUP').map(fixture => (
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
                                                                setSelectedFixture(fixture);
                                                                setIsModalOpen(true);
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
                        onRefresh={refreshData}
                        onEnterResult={(fixture) => {
                            setSelectedFixture(fixture);
                            setIsModalOpen(true);
                        }}
                    />
                )}

                {activeTab === 'stats' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Top Scorers */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
                            <h3 className="text-lg font-black uppercase tracking-wider mb-4 border-b border-gray-800 pb-3 flex items-center">
                                <span className="mr-2">⚽</span> Top Scorers
                            </h3>
                            {topScorers.length === 0 ? (
                                <p className="text-gray-500 text-sm">No goals recorded yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {topScorers.map((stat, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-gray-800/40 p-3 rounded-lg border border-gray-800/50">
                                            <div>
                                                <p className="font-bold text-sm text-white">{stat.playerName}</p>
                                                <p className="text-xs text-gray-400 font-semibold">{stat.teamName}</p>
                                            </div>
                                            <span className="font-black text-indigo-400 font-mono text-base bg-indigo-500/10 px-3 py-1 rounded">
                                                {stat.statValue}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Top Assisters */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
                            <h3 className="text-lg font-black uppercase tracking-wider mb-4 border-b border-gray-800 pb-3 flex items-center">
                                <span className="mr-2">🎯</span> Top Assisters
                            </h3>
                            {topAssisters.length === 0 ? (
                                <p className="text-gray-500 text-sm">No assists recorded yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {topAssisters.map((stat, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-gray-800/40 p-3 rounded-lg border border-gray-800/50">
                                            <div>
                                                <p className="font-bold text-sm text-white">{stat.playerName}</p>
                                                <p className="text-xs text-gray-400 font-semibold">{stat.teamName}</p>
                                            </div>
                                            <span className="font-black text-indigo-400 font-mono text-base bg-indigo-500/10 px-3 py-1 rounded">
                                                {stat.statValue}
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
