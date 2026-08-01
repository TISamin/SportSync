/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
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
import ThemeToggle from '../components/ThemeToggle';


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

    const getTeamForm = (teamId) => {
        const teamFixtures = fixtures.filter(f => 
            f.status === 'DONE' && (f.homeTeamId === teamId || f.awayTeamId === teamId)
        );
        const sorted = [...teamFixtures].sort((a, b) => a.id - b.id);
        const last5 = sorted.slice(-5);
        return last5.map(f => {
            const isHome = f.homeTeamId === teamId;
            const myScore = isHome ? f.homeScore : f.awayScore;
            const oppScore = isHome ? f.awayScore : f.homeScore;
            if (myScore > oppScore) return 'W';
            if (myScore < oppScore) return 'L';
            return 'D';
        });
    };

    const getPlayerCountry = (playerName) => {
        const lower = playerName.toLowerCase();
        if (lower.includes('messi')) return { flag: '🇦🇷', name: 'Argentina' };
        if (lower.includes('ronaldo')) return { flag: '🇵🇹', name: 'Portugal' };
        if (lower.includes('mbappe') || lower.includes('mbappé')) return { flag: '🇫🇷', name: 'France' };
        if (lower.includes('haaland')) return { flag: '🇳🇴', name: 'Norway' };
        if (lower.includes('bellingham')) return { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England' };
        if (lower.includes('de bruyne')) return { flag: '🇧🇪', name: 'Belgium' };
        if (lower.includes('modric') || lower.includes('modrić')) return { flag: '🇭🇷', name: 'Croatia' };
        if (lower.includes('van dijk')) return { flag: '🇳🇱', name: 'Netherlands' };
        if (lower.includes('alisson')) return { flag: '🇧🇷', name: 'Brazil' };
        if (lower.includes('saka')) return { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England' };
        if (lower.includes('rice')) return { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England' };
        if (lower.includes('saliba')) return { flag: '🇫🇷', name: 'France' };
        if (lower.includes('pedri')) return { flag: '🇪🇸', name: 'Spain' };
        if (lower.includes('gavi')) return { flag: '🇪🇸', name: 'Spain' };
        if (lower.includes('yamal')) return { flag: '🇪🇸', name: 'Spain' };
        return { flag: '🌍', name: 'International' };
    };

    const getPlayerImage = (playerName) => {
        const lower = playerName.toLowerCase();
        if (lower.includes('messi')) return '/players/messi.png';
        if (lower.includes('ronaldo')) return '/players/ronaldo.png';
        if (lower.includes('mbappe') || lower.includes('mbappé')) return '/players/mbappe.png';
        if (lower.includes('haaland')) return '/players/haaland.png';
        if (lower.includes('bellingham')) return '/players/bellingham.png';
        return '/players/generic.png';
    };


    const fetchStandingsData = useCallback(async (phase, group) => {
        try {
            const res = await getTournamentStandings(id, phase, group);
            if (res.success) {
                setStandings(res.data);
            }
        } catch (err) {
            console.error('Error fetching standings', err);
        }
    }, [id]);

    const refreshData = useCallback(async () => {
        try {
            const metadataRes = await getTournament(id);
            if (metadataRes.success) {
                const tournamentData = metadataRes.data;
                setTournament(tournamentData);
                const [fixRes, koRes, scorersRes, assistersRes, teamsRes] = await Promise.all([
                    getTournamentFixtures(id),
                    getKnockoutFixtures(id),
                    getTopScorers(id),
                    getTopAssisters(id),
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
        } catch {
            setError('Failed to fetch tournament data.');
        } finally {
            setLoading(false);
        }
    }, [id, selectedPhase, selectedGroup, fetchStandingsData]);

    useEffect(() => {
        refreshData();
    }, [id, refreshData]);

    // Re-fetch standings whenever selectedPhase or selectedGroup changes
    useEffect(() => {
        if (tournament) {
            fetchStandingsData(selectedPhase, selectedGroup);
        }
    }, [selectedPhase, selectedGroup, tournament, fetchStandingsData]);

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
        return <div className="min-h-screen bg-base flex items-center justify-center text-txt text-lg">Loading...</div>;
    }

    if (error || !tournament) {
        return (
            <div className="min-h-screen bg-base flex items-center justify-center text-red-500 p-6 text-center">
                <div>
                    <h2 className="text-2xl font-black mb-4">Error</h2>
                    <p className="mb-6">{error || 'Tournament not found.'}</p>
                    <button onClick={() => navigate('/')} className="bg-indigo-600 px-6 py-2 rounded font-bold uppercase text-white cursor-pointer">Go Home</button>
                </div>
            </div>
        );
    }

    const isDouble = tournament.type === 'DOUBLE';
    
    // Check stages progression
    const hasPhase2Fixtures = fixtures.some(f => f.phaseNumber === 2);
    const pendingPhase1Count = fixtures.filter(f => f.phaseNumber === 1 && f.round === 'GROUP' && f.status === 'PENDING').length;

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
        <div className="min-h-screen bg-base text-txt p-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-surface border border-border p-6 rounded-2xl shadow-lg">
                <div>
                    <h1 className="text-3xl font-black tracking-widest uppercase text-txt">
                        Sport<span className="text-indigo-500">Sync</span> Tournament
                    </h1>
                    <p className="text-muted text-sm mt-1">
                        Name: <span className="text-txt font-bold">{tournament.name}</span> | Type: <span className="text-indigo-600 dark:text-indigo-400 font-bold font-mono">{tournament.type}</span>
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsAdmin(!isAdmin)}
                        className={`text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider transition-all cursor-pointer ${
                            isAdmin 
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/25'
                                : 'bg-input text-muted border border-transparent'
                        }`}
                    >
                        {isAdmin ? 'Admin View: ON' : 'Admin View: OFF'}
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="text-xs bg-input hover:bg-opacity-80 border border-border text-txt font-bold px-4 py-2 rounded-full uppercase tracking-wider transition-all cursor-pointer"
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
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-6 py-3 rounded-lg text-xs uppercase tracking-widest transition-all cursor-pointer"
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
            <div className="flex border-b border-border mb-8 overflow-x-auto gap-6">
                {['standings', 'fixtures', 'knockout', 'stats', 'analytics'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`text-sm font-black uppercase tracking-widest pb-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                            activeTab === tab
                                ? 'text-indigo-500 border-indigo-500'
                                : 'text-muted border-transparent hover:text-txt'
                        }`}
                    >
                        {tab === 'knockout' ? 'Knockout Stage' : tab === 'stats' ? 'Player Stats' : tab === 'analytics' ? 'Analytics' : tab}
                    </button>
                ))}
            </div>

            {/* Phase / Group Selectors (Only shown for standings and fixtures tabs) */}
            {(activeTab === 'standings' || activeTab === 'fixtures') && (
                <div className="bg-surface/30 border border-border p-5 rounded-2xl mb-8 space-y-4">
                    {/* Phase Selector */}
                    {isDouble && (
                        <div className="flex items-center space-x-4">
                            <span className="text-xs text-muted font-bold uppercase tracking-wider min-w-[60px]">Phase:</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedPhase(1);
                                        setSelectedGroup(1);
                                    }}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                                        selectedPhase === 1
                                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                            : 'bg-surface border-border text-muted hover:text-txt'
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
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                                        !hasPhase2Fixtures 
                                            ? 'opacity-40 cursor-not-allowed bg-surface border-border text-muted'
                                            : selectedPhase === 2
                                                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                                : 'bg-surface border-border text-muted hover:text-txt'
                                    }`}
                                >
                                    Phase 2 (Groups 1-4)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Group Selector */}
                    <div className="flex items-center space-x-4 overflow-x-auto">
                        <span className="text-xs text-muted font-bold uppercase tracking-wider min-w-[60px]">Group:</span>
                        <div className="flex gap-1.5">
                            {Array.from({ length: selectedPhase === 1 && isDouble ? 8 : (selectedPhase === 2 ? 4 : 1) }).map((_, idx) => {
                                const groupNum = idx + 1;
                                return (
                                    <button
                                        key={groupNum}
                                        onClick={() => setSelectedGroup(groupNum)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                                            selectedGroup === groupNum
                                                ? 'bg-indigo-600 border-transparent text-white shadow-md'
                                                : 'bg-surface border-border text-muted hover:border-indigo-500/50'
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
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg">
                        
                        {/* SofaScore Styled Standings Header */}
                        <div className="flex justify-between items-center mb-6 pb-3 border-b border-border">
                            <div className="flex items-center space-x-2.5">
                                <span className="text-xl">🏆</span>
                                <h3 className="text-lg font-black uppercase tracking-wider text-txt flex items-center">
                                    {tournament?.name || 'Tournament Standings'}
                                </h3>
                            </div>
                        </div>
                        
                        <div className="w-full">
                            {/* Table Header */}
                            <div className="flex items-center text-xs font-bold uppercase tracking-wider text-muted px-4 py-2 mb-2 border-b border-border/40 pb-3">
                                <div className="w-12 text-center">Pos</div>
                                <div className="flex-1 pl-4">Club</div>
                                <div className="w-12 text-center">W</div>
                                <div className="w-12 text-center">D</div>
                                <div className="w-12 text-center">L</div>
                                <div className="w-16 text-center text-indigo-500 dark:text-indigo-400">Poin</div>
                                <div className="w-32 text-center hidden md:block">Last Match</div>
                            </div>
                            
                            {/* Standings Rows */}
                            <div className="space-y-3">
                                {standings.map((standing, index) => {
                                    const team = teams.find(t => t.id === standing.teamId);
                                    const form = getTeamForm(standing.teamId);
                                    const pos = index + 1;

                                    return (
                                        <div 
                                            key={standing.id} 
                                            className="flex items-center bg-input/20 border border-border/60 hover:border-indigo-500/50 rounded-xl px-4 py-3.5 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(79,70,229,0.06)]"
                                        >
                                            {/* Position */}
                                            <div className="w-12 text-center font-bold text-sm text-muted">{pos}</div>
                                            
                                            {/* Club Name & Logo */}
                                            <div className="flex-1 flex items-center space-x-3 min-w-0 pl-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-550 to-indigo-700 dark:from-indigo-500 dark:to-indigo-650 flex items-center justify-center text-white font-black text-[11px] shadow-sm flex-shrink-0">
                                                    {team?.name ? team.name.substring(0, 2).toUpperCase() : 'TM'}
                                                </div>
                                                <div className="font-bold text-txt text-sm truncate">{team?.name || `Team ${standing.teamId}`}</div>
                                            </div>
                                            
                                            {/* Stats */}
                                            <div className="w-12 text-center text-sm font-semibold text-txt">{standing.won}</div>
                                            <div className="w-12 text-center text-sm font-semibold text-muted">{standing.drawn}</div>
                                            <div className="w-12 text-center text-sm font-semibold text-red-650 dark:text-red-400">{standing.lost}</div>
                                            <div className="w-16 text-center font-black text-sm text-indigo-500 dark:text-indigo-400">{standing.points}</div>
                                            
                                            {/* Form circles */}
                                            <div className="w-32 hidden md:flex items-center justify-center space-x-1.5">
                                                {form.length === 0 ? (
                                                    <span className="text-[10px] text-muted font-bold">-</span>
                                                ) : (
                                                    form.map((result, idx) => (
                                                        <span 
                                                            key={idx} 
                                                            className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black shadow-sm ${
                                                                result === 'W' ? 'bg-green-500 shadow-green-500/20' : 
                                                                result === 'L' ? 'bg-red-500 shadow-red-500/20' : 
                                                                'bg-gray-400 dark:bg-gray-650'
                                                            }`}
                                                        >
                                                            {result === 'W' ? '✓' : result === 'L' ? '✗' : '-'}
                                                        </span>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {standings.length === 0 && (
                                    <p className="text-center py-8 text-muted font-medium">No standings found for this group.</p>
                                )}
                            </div>
                        </div>

                    </div>
                )}

                {activeTab === 'fixtures' && (
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg">
                        <h3 className="text-xl font-black uppercase tracking-wider mb-6 border-b border-border pb-3 text-txt">
                            Fixtures — {getGroupLabel(selectedGroup, selectedPhase)}
                        </h3>
                        
                        {filteredFixtures.length === 0 ? (
                            <p className="text-muted text-center py-8">No group stage fixtures found for this group.</p>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {filteredFixtures.map(fixture => {
                                    const homeInitials = fixture.homeTeamName ? fixture.homeTeamName.substring(0, 2).toUpperCase() : 'TM';
                                    const awayInitials = fixture.awayTeamName ? fixture.awayTeamName.substring(0, 2).toUpperCase() : 'TM';
                                    
                                    const mockHour = 6 + (fixture.id % 3);
                                    const mockMinute = (fixture.id % 2 === 0) ? '00' : '30';
                                    const timeString = `${mockHour}:${mockMinute} PM`;

                                    return (
                                        <div 
                                            key={fixture.id} 
                                            className="group flex items-center justify-between py-4 px-4 bg-input/10 border border-border/50 hover:border-indigo-500/50 rounded-xl hover:bg-input/20 transition-all shadow-sm"
                                        >
                                            {/* Home Team Name (aligned right) */}
                                            <div className="flex-1 text-right font-black text-sm text-txt pr-4 truncate">
                                                {fixture.homeTeamName}
                                            </div>

                                            {/* Center section: home shield, time/score, away shield */}
                                            <div className="flex items-center space-x-3 flex-shrink-0">
                                                {/* Home Logo */}
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-550 to-indigo-700 dark:from-indigo-500 dark:to-indigo-655 flex items-center justify-center text-white font-black text-[9px] shadow-sm flex-shrink-0">
                                                    {homeInitials}
                                                </div>

                                                {/* Time or Score */}
                                                <div className="w-20 text-center flex-shrink-0">
                                                    {fixture.status === 'DONE' ? (
                                                        <span className="font-mono font-black text-sm bg-indigo-500/10 text-indigo-500 px-2.5 py-1.5 rounded-lg border border-indigo-500/20">
                                                            {fixture.homeScore} - {fixture.awayScore}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted font-bold tracking-tight bg-input/40 px-2.5 py-1.5 rounded-lg border border-border/40">
                                                            {timeString}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Away Logo */}
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-550 to-green-700 dark:from-green-500 dark:to-green-655 flex items-center justify-center text-white font-black text-[9px] shadow-sm flex-shrink-0">
                                                    {awayInitials}
                                                </div>
                                            </div>

                                            {/* Away Team Name (aligned left) */}
                                            <div className="flex-1 text-left font-black text-sm text-txt pl-4 truncate">
                                                {fixture.awayTeamName}
                                            </div>

                                            {/* Action Button */}
                                            {isAdmin && (
                                                <div className="w-16 text-right flex-shrink-0">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedFixture(fixture);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black px-2.5 py-1.5 rounded uppercase tracking-wider cursor-pointer shadow-sm shadow-indigo-650/20"
                                                    >
                                                        {fixture.status === 'DONE' ? 'Edit' : 'Enter'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
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
                            setSelectedFixture(fixture);
                            setIsModalOpen(true);
                        }}
                    />
                )}

                {activeTab === 'stats' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Top Scorers */}
                        <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-center mb-6 pb-3 border-b border-border/40">
                                    <h3 className="text-lg font-black uppercase tracking-wider text-txt flex items-center">
                                        Top Scorer
                                    </h3>
                                    <span className="text-muted hover:text-indigo-500 font-bold cursor-pointer text-sm font-sans transition-colors">{">"}</span>
                                </div>
                                {topScorers.length === 0 ? (
                                    <p className="text-muted text-sm py-4">No goals recorded yet.</p>
                                ) : (
                                    <div className="flex flex-col">
                                        {topScorers.map((stat, idx) => {
                                            const country = getPlayerCountry(stat.playerName);
                                            const playerImg = getPlayerImage(stat.playerName);
                                            return (
                                                <div 
                                                    key={idx} 
                                                    className={`flex justify-between items-center py-3.5 ${
                                                        idx < topScorers.length - 1 ? 'border-b border-border/40' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        {/* Player Avatar */}
                                                        <img 
                                                            src={playerImg} 
                                                            alt={stat.playerName} 
                                                            className="w-10 h-10 rounded-full object-cover border border-border bg-input/40 flex-shrink-0"
                                                        />
                                                        <div>
                                                            <p className="font-bold text-sm text-txt">{stat.playerName}</p>
                                                            <p className="text-[10px] text-muted font-bold flex items-center space-x-1 mt-0.5">
                                                                <span className="text-xs">{country.flag}</span>
                                                                <span>{country.name}</span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Count pill or number */}
                                                    {idx === 0 ? (
                                                        <span className="w-8 h-8 rounded-full bg-indigo-650 text-white flex items-center justify-center text-xs font-black shadow-sm font-mono">
                                                            {stat.count}
                                                        </span>
                                                    ) : (
                                                        <span className="w-8 h-8 flex items-center justify-end text-sm font-black text-txt font-mono pr-2">
                                                            {stat.count}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Top Assisters */}
                        <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-center mb-6 pb-3 border-b border-border/40">
                                    <h3 className="text-lg font-black uppercase tracking-wider text-txt flex items-center">
                                        Assists
                                    </h3>
                                    <span className="text-muted hover:text-indigo-500 font-bold cursor-pointer text-sm font-sans transition-colors">{">"}</span>
                                </div>
                                {topAssisters.length === 0 ? (
                                    <p className="text-muted text-sm py-4">No assists recorded yet.</p>
                                ) : (
                                    <div className="flex flex-col">
                                        {topAssisters.map((stat, idx) => {
                                            const country = getPlayerCountry(stat.playerName);
                                            const playerImg = getPlayerImage(stat.playerName);
                                            return (
                                                <div 
                                                    key={idx} 
                                                    className={`flex justify-between items-center py-3.5 ${
                                                        idx < topAssisters.length - 1 ? 'border-b border-border/40' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        {/* Player Avatar */}
                                                        <img 
                                                            src={playerImg} 
                                                            alt={stat.playerName} 
                                                            className="w-10 h-10 rounded-full object-cover border border-border bg-input/40 flex-shrink-0"
                                                        />
                                                        <div>
                                                            <p className="font-bold text-sm text-txt">{stat.playerName}</p>
                                                            <p className="text-[10px] text-muted font-bold flex items-center space-x-1 mt-0.5">
                                                                <span className="text-xs">{country.flag}</span>
                                                                <span>{country.name}</span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Count pill or number */}
                                                    {idx === 0 ? (
                                                        <span className="w-8 h-8 rounded-full bg-indigo-650 text-white flex items-center justify-center text-xs font-black shadow-sm font-mono">
                                                            {stat.count}
                                                        </span>
                                                    ) : (
                                                        <span className="w-8 h-8 flex items-center justify-end text-sm font-black text-txt font-mono pr-2">
                                                            {stat.count}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Completion rate progress bar */}
                        <div className="bg-surface border border-border p-6 rounded-2xl shadow-md">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-sm font-black uppercase tracking-widest text-muted">Tournament Progress</h4>
                                <span className="font-mono font-black text-indigo-500 text-sm">
                                    {fixtures.filter(f => f.status === 'DONE').length} / {fixtures.length} Matches Played ({
                                        fixtures.length > 0
                                            ? Math.round((fixtures.filter(f => f.status === 'DONE').length / fixtures.length) * 100)
                                            : 0
                                    }%)
                                </span>
                            </div>
                            <div className="w-full bg-input h-4 rounded-full overflow-hidden">
                                <div
                                    className="bg-indigo-500 h-full transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                                    style={{
                                        width: `${
                                            fixtures.length > 0
                                                ? (fixtures.filter(f => f.status === 'DONE').length / fixtures.length) * 100
                                                : 0
                                        }%`
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* Top overview metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-surface border border-border p-6 rounded-2xl shadow-md flex items-center space-x-4">
                                <div className="text-4xl bg-indigo-500/10 p-3 rounded-xl">⚽</div>
                                <div>
                                    <p className="text-muted text-[10px] font-black uppercase tracking-widest mb-1">Total Goals Scored</p>
                                    <p className="text-3xl font-black text-txt font-mono">
                                        {fixtures.filter(f => f.status === 'DONE').reduce((sum, f) => sum + f.homeScore + f.awayScore, 0)}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-surface border border-border p-6 rounded-2xl shadow-md flex items-center space-x-4">
                                <div className="text-4xl bg-indigo-500/10 p-3 rounded-xl">⏱️</div>
                                <div>
                                    <p className="text-muted text-[10px] font-black uppercase tracking-widest mb-1">Average Goals / Match</p>
                                    <p className="text-3xl font-black text-txt font-mono">
                                        {(() => {
                                            const played = fixtures.filter(f => f.status === 'DONE').length;
                                            const goals = fixtures.filter(f => f.status === 'DONE').reduce((sum, f) => sum + f.homeScore + f.awayScore, 0);
                                            return played > 0 ? (goals / played).toFixed(2) : '0.00';
                                        })()}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-surface border border-border p-6 rounded-2xl shadow-md flex items-center space-x-4">
                                <div className="text-4xl bg-indigo-500/10 p-3 rounded-xl">🔥</div>
                                <div>
                                    <p className="text-muted text-[10px] font-black uppercase tracking-widest mb-1">Active Teams</p>
                                    <p className="text-3xl font-black text-txt font-mono">{teams.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Top performances */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Best Attack & Defense */}
                            <div className="bg-surface border border-border p-6 rounded-2xl shadow-md space-y-6">
                                <h3 className="text-lg font-black uppercase tracking-wider border-b border-border pb-3 text-txt">Team Standouts</h3>
                                
                                <div className="space-y-4">
                                    {/* Best Attack */}
                                    {(() => {
                                        const sorted = [...standings].sort((a, b) => (b.goalsFor || 0) - (a.goalsFor || 0));
                                        const best = sorted[0];
                                        if (!best) return null;
                                        return (
                                            <div className="flex justify-between items-center bg-input/40 p-4 rounded-xl border border-border/50">
                                                <div>
                                                    <span className="text-[9px] font-black uppercase tracking-wider bg-green-500/10 text-green-600 dark:text-green-400 px-2.5 py-0.5 rounded border border-green-500/20">Most Explosive Attack</span>
                                                    <h4 className="text-base font-black text-txt mt-2">{best.teamName}</h4>
                                                    <p className="text-xs text-muted">Goals For (GF): {best.goalsFor}</p>
                                                </div>
                                                <span className="text-2xl font-black text-green-500 font-mono">+{best.goalsFor}</span>
                                            </div>
                                        );
                                    })()}

                                    {/* Best Defense */}
                                    {(() => {
                                        const withPlayed = standings.filter(s => (s.played || 0) > 0);
                                        const sorted = [...withPlayed].sort((a, b) => (a.goalsAgainst || 0) - (b.goalsAgainst || 0));
                                        const best = sorted[0];
                                        if (!best) return null;
                                        return (
                                            <div className="flex justify-between items-center bg-input/40 p-4 rounded-xl border border-border/50">
                                                <div>
                                                    <span className="text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded border border-blue-500/20">Rock-Solid Defense</span>
                                                    <h4 className="text-base font-black text-txt mt-2">{best.teamName}</h4>
                                                    <p className="text-xs text-muted">Goals Conceded (GA): {best.goalsAgainst} (in {best.played} matches)</p>
                                                </div>
                                                <span className="text-2xl font-black text-blue-500 font-mono">-{best.goalsAgainst}</span>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Record match */}
                            <div className="bg-surface border border-border p-6 rounded-2xl shadow-md flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-wider border-b border-border pb-3 mb-6 text-txt">Highest Scoring Match</h3>
                                    {(() => {
                                        const completed = fixtures.filter(f => f.status === 'DONE');
                                        let recordMatch = null;
                                        let maxGoals = 0;
                                        completed.forEach(f => {
                                            const total = f.homeScore + f.awayScore;
                                            if (total > maxGoals) {
                                                maxGoals = total;
                                                recordMatch = f;
                                            }
                                        });

                                        if (!recordMatch) {
                                            return <p className="text-muted text-sm">No completed matches recorded yet.</p>;
                                        }

                                        return (
                                            <div className="text-center bg-input/40 p-6 rounded-2xl border border-border/60">
                                                <span className="text-[9px] font-black uppercase tracking-wider bg-yellow-500/15 text-yellow-650 dark:text-yellow-500 px-2.5 py-1 rounded border border-yellow-500/20">
                                                    Matchday Record
                                                </span>
                                                <div className="flex justify-center items-center space-x-6 mt-6 mb-4">
                                                    <span className="font-bold text-sm text-txt max-w-[100px] truncate">{recordMatch.homeTeamName}</span>
                                                    <span className="text-2xl font-black font-mono bg-indigo-500/10 text-indigo-500 px-3 py-1.5 rounded-lg border border-indigo-500/25">
                                                        {recordMatch.homeScore} - {recordMatch.awayScore}
                                                    </span>
                                                    <span className="font-bold text-sm text-txt max-w-[100px] truncate">{recordMatch.awayTeamName}</span>
                                                </div>
                                                <p className="text-xs text-muted">A total of <span className="font-black text-indigo-500">{maxGoals}</span> goals were scored in this fixture!</p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Enter result modal */}
            {isModalOpen && (
                <MatchResultModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    fixture={selectedFixture}
                    teams={teams}
                    onSaved={refreshData}
                />
            )}
        </div>
    );
}

