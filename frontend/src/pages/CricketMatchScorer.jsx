import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    getMatchState, 
    setupToss, 
    startInnings, 
    submitBall, 
    swapStriker, 
    setNextBatsman, 
    setNextBowler,
    getScorecard
} from '../api/cricketApi';
import { getTournament, getTournamentFixtures, getTournamentTeams } from '../api/tournamentApi';
import { useCricketSocket } from '../socket/useCricketSocket';
import CricketScorecard from '../components/CricketScorecard';
import SuperOverScreen from '../components/SuperOverScreen';
import NextBatsmanModal from '../components/NextBatsmanModal';
import NextBowlerModal from '../components/NextBowlerModal';

export default function CricketMatchScorer() {
    const { id: tournamentId, matchId } = useParams();
    const navigate = useNavigate();

    // Data states
    const [tournament, setTournament] = useState(null);
    const [fixture, setFixture] = useState(null);
    const [teams, setTeams] = useState([]);
    const [matchState, setMatchState] = useState(null);
    const [scorecardData, setScorecardData] = useState(null);

    // UX states
    const [activeTab, setActiveTab] = useState('scoring'); // 'scoring' | 'scorecard'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAdmin, setIsAdmin] = useState(true); // default to true to allow scoring
    const [scorecardRefresh, setScorecardRefresh] = useState(0);

    // Toss inputs
    const [tossWinnerId, setTossWinnerId] = useState('');
    const [tossDecision, setTossDecision] = useState('BAT'); // 'BAT' | 'BOWL'

    // Openers setup inputs
    const [strikerId, setStrikerId] = useState('');
    const [nonStrikerId, setNonStrikerId] = useState('');
    const [bowlerId, setBowlerId] = useState('');

    // Scoring sub-panels
    const [activePanel, setActivePanel] = useState(null); // null | 'wicket' | 'runout' | 'wide' | 'noball'
    const [wicketType, setWicketType] = useState('BOWLED');
    const [runOutPlayerId, setRunOutPlayerId] = useState('');
    const [runOutRuns, setRunOutRuns] = useState(0);
    const [wideRuns, setWideRuns] = useState(0);
    const [noBallRuns, setNoBallRuns] = useState(0);
    const [noBallFreeHit, setNoBallFreeHit] = useState(true);

    // Track last bowler to prevent consecutive overs
    const [lastBowlerId, setLastBowlerId] = useState(null);
    const prevBowlerIdRef = useRef(null);

    // Fetch initial metadata
    const fetchData = async () => {
        try {
            const [tourneyRes, fixRes, teamsRes, stateRes] = await Promise.all([
                getTournament(tournamentId),
                getTournamentFixtures(tournamentId),
                getTournamentTeams(tournamentId),
                getMatchState(matchId)
            ]);

            if (tourneyRes.success) setTournament(tourneyRes.data);
            if (fixRes.success) {
                const currentFix = fixRes.data.find(f => f.id === Number(matchId));
                setFixture(currentFix);
            }
            if (teamsRes.success) setTeams(teamsRes.data);
            if (stateRes.success) {
                setMatchState(stateRes.data);
                if (stateRes.data.currentBowlerId) {
                    prevBowlerIdRef.current = stateRes.data.currentBowlerId;
                }
            }
        } catch (err) {
            console.error('Error fetching scorer page data', err);
            setError('Failed to fetch match or tournament details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tournamentId, matchId]);

    // WebSocket state synchronization
    useCricketSocket(matchId, (newState) => {
        // Track the last bowler when the bowler ID changes to null (end of over)
        if (matchState && matchState.currentBowlerId && newState.currentBowlerId === null) {
            setLastBowlerId(matchState.currentBowlerId);
        }
        setMatchState(newState);
        setScorecardRefresh(prev => prev + 1);
    });

    const handleTossSubmit = async () => {
        if (!tossWinnerId) {
            alert('Please select a toss winner.');
            return;
        }
        try {
            setLoading(true);
            const res = await setupToss(matchId, Number(tossWinnerId), tossDecision);
            if (res.success) {
                setMatchState(res.data);
            } else {
                alert(res.error || 'Failed to setup toss.');
            }
        } catch (err) {
            alert('Toss submission failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleInningsStartSubmit = async () => {
        if (!strikerId || !nonStrikerId || !bowlerId) {
            alert('Please select all opening batsmen and the bowler.');
            return;
        }
        if (strikerId === nonStrikerId) {
            alert('Striker and Non-Striker must be different players.');
            return;
        }
        try {
            setLoading(true);
            const res = await startInnings(matchId, Number(strikerId), Number(nonStrikerId), Number(bowlerId));
            if (res.success) {
                // Fetch new state to force UI update
                const stateRes = await getMatchState(matchId);
                if (stateRes.success) {
                    setMatchState(stateRes.data);
                }
                setStrikerId('');
                setNonStrikerId('');
                setBowlerId('');
            } else {
                alert(res.error || 'Failed to start innings.');
            }
        } catch (err) {
            alert('Innings start submission failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleStandardBallSubmit = async (outcome) => {
        try {
            const res = await submitBall(matchId, {
                outcome: outcome,
                extraRuns: 0
            });
            if (!res.success) {
                alert(res.error || 'Failed to enter ball outcome.');
            }
        } catch (err) {
            alert('Error entering ball outcome.');
        }
    };

    const handleSwapStriker = async () => {
        try {
            await swapStriker(matchId);
        } catch (err) {
            alert('Failed to swap striker.');
        }
    };

    const handleWicketSubmit = async () => {
        try {
            const res = await submitBall(matchId, {
                outcome: 'WICKET',
                dismissalType: wicketType,
                extraRuns: 0
            });
            if (res.success) {
                setActivePanel(null);
                setWicketType('BOWLED');
            } else {
                alert(res.error || 'Failed to record wicket.');
            }
        } catch (err) {
            alert('Error submitting wicket.');
        }
    };

    const handleRunOutSubmit = async () => {
        if (!runOutPlayerId) {
            alert('Please select the dismissed batsman.');
            return;
        }
        try {
            const res = await submitBall(matchId, {
                outcome: 'RUNOUT',
                dismissedPlayerId: Number(runOutPlayerId),
                extraRuns: Number(runOutRuns),
                dismissalType: 'RUN_OUT'
            });
            if (res.success) {
                setActivePanel(null);
                setRunOutPlayerId('');
                setRunOutRuns(0);
            } else {
                alert(res.error || 'Failed to record run out.');
            }
        } catch (err) {
            alert('Error submitting run out.');
        }
    };

    const handleWideSubmit = async () => {
        try {
            const res = await submitBall(matchId, {
                outcome: 'WIDE',
                extraRuns: Number(wideRuns)
            });
            if (res.success) {
                setActivePanel(null);
                setWideRuns(0);
            } else {
                alert(res.error || 'Failed to record wide.');
            }
        } catch (err) {
            alert('Error submitting wide.');
        }
    };

    const handleNoBallSubmit = async () => {
        try {
            const res = await submitBall(matchId, {
                outcome: noBallFreeHit ? 'NOBALL_FREE_HIT' : 'NOBALL_NO_FREE_HIT',
                extraRuns: Number(noBallRuns)
            });
            if (res.success) {
                setActivePanel(null);
                setNoBallRuns(0);
                setNoBallFreeHit(true);
            } else {
                alert(res.error || 'Failed to record no ball.');
            }
        } catch (err) {
            alert('Error submitting no ball.');
        }
    };

    const handleNextBatsmanSelect = async (playerId) => {
        try {
            await setNextBatsman(matchId, playerId);
        } catch (err) {
            alert('Failed to set next batsman.');
        }
    };

    const handleNextBowlerSelect = async (playerId) => {
        try {
            await setNextBowler(matchId, playerId);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to set next bowler.');
        }
    };

    // Load active scorecards to filter batsman selection
    const [scorecardBattingRoster, setScorecardBattingRoster] = useState([]);
    useEffect(() => {
        const fetchInningsScorecard = async () => {
            if (matchState && (matchState.strikerId === null || matchState.nonStrikerId === null)) {
                try {
                    const res = await getScorecard(matchId);
                    if (res.success && res.data) {
                        const currentInningsData = matchState.inningsNumber === 1 ? res.data.innings1 : res.data.innings2;
                        if (currentInningsData) {
                            setScorecardBattingRoster(currentInningsData.batting || []);
                        }
                    }
                } catch (err) {
                    console.error('Error fetching scorecard details inside match scorer', err);
                }
            }
        };
        fetchInningsScorecard();
    }, [matchState, matchId]);

    if (loading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white text-lg">Loading scorer panel...</div>;
    }

    if (error || !matchState || !fixture) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-red-500 p-6 text-center">
                <div>
                    <h2 className="text-2xl font-black mb-4">Error</h2>
                    <p className="mb-6">{error || 'Match details could not be retrieved.'}</p>
                    <button onClick={() => navigate(`/tournament/${tournamentId}`)} className="bg-indigo-600 px-6 py-2 rounded font-bold uppercase">Back to Tournament</button>
                </div>
            </div>
        );
    }

    // Identify teams and rosters
    const homeTeam = teams.find(t => Number(t.id) === Number(fixture.homeTeamId));
    const awayTeam = teams.find(t => Number(t.id) === Number(fixture.awayTeamId));
    const homeRoster = homeTeam?.roster || [];
    const awayRoster = awayTeam?.roster || [];

    // Identify active rosters
    const isTossPhase = matchState.status === 'TOSS';
    const isCompleted = matchState.status === 'COMPLETED';

    // Resolve batting and bowling teams (fallback to toss decision if innings hasn't started yet)
    let activeBattingTeamId = matchState.battingTeamId;
    let activeBowlingTeamId = matchState.bowlingTeamId;

    if (!activeBattingTeamId && matchState.tossWinnerId) {
        const tossWinnerBats = matchState.tossDecision === 'BAT';
        const homeIsTossWinner = Number(matchState.tossWinnerId) === Number(fixture.homeTeamId);

        if (matchState.inningsNumber === 1) {
            if (homeIsTossWinner) {
                activeBattingTeamId = tossWinnerBats ? fixture.homeTeamId : fixture.awayTeamId;
                activeBowlingTeamId = tossWinnerBats ? fixture.awayTeamId : fixture.homeTeamId;
            } else {
                activeBattingTeamId = tossWinnerBats ? fixture.awayTeamId : fixture.homeTeamId;
                activeBowlingTeamId = tossWinnerBats ? fixture.homeTeamId : fixture.awayTeamId;
            }
        } else {
            if (homeIsTossWinner) {
                activeBattingTeamId = tossWinnerBats ? fixture.awayTeamId : fixture.homeTeamId;
                activeBowlingTeamId = tossWinnerBats ? fixture.homeTeamId : fixture.awayTeamId;
            } else {
                activeBattingTeamId = tossWinnerBats ? fixture.homeTeamId : fixture.awayTeamId;
                activeBowlingTeamId = tossWinnerBats ? fixture.awayTeamId : fixture.homeTeamId;
            }
        }
    }

    const battingTeamRoster = Number(activeBattingTeamId) === Number(fixture.homeTeamId) ? homeRoster : awayRoster;
    const bowlingTeamRoster = Number(activeBowlingTeamId) === Number(fixture.homeTeamId) ? homeRoster : awayRoster;

    const activeBattingTeamName = Number(activeBattingTeamId) === Number(fixture.homeTeamId) ? fixture.homeTeamName : fixture.awayTeamName;
    const activeBowlingTeamName = Number(activeBowlingTeamId) === Number(fixture.homeTeamId) ? fixture.homeTeamName : fixture.awayTeamName;

    // Detect if openers setup is needed
    // Striker, non-striker, and bowler are all null at the beginning of an innings
    const isInitialOpenersSetup = 
        !isTossPhase && 
        !isCompleted && 
        matchState.strikerId === null && 
        matchState.nonStrikerId === null && 
        matchState.currentBowlerId === null;

    // Detect if a batsman is dismissed and we need to choose the next batsman
    // If one of the batsmen is null but NOT both (or both null but some runs/overs have been recorded)
    const isBatsmanDismissed =
        !isTossPhase &&
        !isCompleted &&
        !isInitialOpenersSetup &&
        (matchState.strikerId === null || matchState.nonStrikerId === null);

    // Detect if bowler needs to be chosen
    const isNewBowlerNeeded =
        !isTossPhase &&
        !isCompleted &&
        !isInitialOpenersSetup &&
        !isBatsmanDismissed &&
        matchState.currentBowlerId === null;

    return (
        <div className="min-h-screen bg-black text-white p-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg">
                <div>
                    <h1 className="text-3xl font-black tracking-widest uppercase">
                        Cricket Scorer <span className="text-indigo-500">Cockpit</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Tournament: <span className="text-white font-bold">{tournament?.name}</span> | Match: <span className="text-indigo-400 font-bold">{fixture.homeTeamName} vs {fixture.awayTeamName}</span>
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsAdmin(!isAdmin)}
                        className={`text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider transition-all ${
                            isAdmin 
                                ? 'bg-green-500/10 text-green-400 border border-green-500/25'
                                : 'bg-gray-800 text-gray-500 border border-transparent'
                        }`}
                    >
                        {isAdmin ? 'Scoring Mode: Active' : 'Scoring Mode: View Only'}
                    </button>
                    <button
                        onClick={() => navigate(`/tournament/${tournamentId}`)}
                        className="text-xs bg-gray-800 hover:bg-gray-700 font-bold px-4 py-2 rounded-full uppercase tracking-wider transition-all"
                    >
                        Back to Tournament
                    </button>
                </div>
            </header>

            {/* Super Over Screen Overlay */}
            {(matchState.status === 'SUPER_OVER_1' || matchState.status === 'SUPER_OVER_2') && (
                <div className="mb-6">
                    <SuperOverScreen matchState={matchState} />
                </div>
            )}

            {/* Main Tabs */}
            <div className="flex border-b border-gray-800 mb-8 overflow-x-auto gap-6">
                <button
                    onClick={() => setActiveTab('scoring')}
                    className={`text-sm font-black uppercase tracking-widest pb-3 border-b-2 transition-all whitespace-nowrap ${
                        activeTab === 'scoring'
                            ? 'text-indigo-500 border-indigo-500'
                            : 'text-gray-500 border-transparent hover:text-gray-300'
                    }`}
                >
                    Scoring Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('scorecard')}
                    className={`text-sm font-black uppercase tracking-widest pb-3 border-b-2 transition-all whitespace-nowrap ${
                        activeTab === 'scorecard'
                            ? 'text-indigo-500 border-indigo-500'
                            : 'text-gray-500 border-transparent hover:text-gray-300'
                    }`}
                >
                    Full Scorecard
                </button>
            </div>

            {/* Tab: Scorecard */}
            {activeTab === 'scorecard' && (
                <CricketScorecard matchId={matchId} refreshTrigger={scorecardRefresh} />
            )}

            {/* Tab: Scoring Cockpit */}
            {activeTab === 'scoring' && (
                <div className="space-y-6">
                    
                    {/* TOSS PHASE SETUP */}
                    {isTossPhase && (
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg max-w-xl mx-auto space-y-6">
                            <div className="border-b border-gray-800 pb-3">
                                <h3 className="text-xl font-black uppercase tracking-wider text-white">Toss Setup</h3>
                                <p className="text-xs text-gray-400 mt-1">Configure toss results to initialize Innings 1.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Toss Winner</label>
                                    <select
                                        value={tossWinnerId}
                                        onChange={(e) => setTossWinnerId(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="">-- Choose Team --</option>
                                        <option value={fixture.homeTeamId}>{fixture.homeTeamName}</option>
                                        <option value={fixture.awayTeamId}>{fixture.awayTeamName}</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Decision</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setTossDecision('BAT')}
                                            className={`flex-1 py-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${
                                                tossDecision === 'BAT'
                                                    ? 'bg-indigo-600/10 border-indigo-500 text-white'
                                                    : 'bg-gray-950 border-gray-850 text-gray-400 hover:text-gray-300'
                                            }`}
                                        >
                                            Bat
                                        </button>
                                        <button
                                            onClick={() => setTossDecision('BOWL')}
                                            className={`flex-1 py-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${
                                                tossDecision === 'BOWL'
                                                    ? 'bg-indigo-600/10 border-indigo-500 text-white'
                                                    : 'bg-gray-950 border-gray-850 text-gray-400 hover:text-gray-300'
                                            }`}
                                        >
                                            Bowl
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {isAdmin ? (
                                <button
                                    onClick={handleTossSubmit}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3.5 rounded-xl uppercase text-xs tracking-widest transition-all"
                                >
                                    Confirm Toss & Start Innings
                                </button>
                            ) : (
                                <p className="text-xs text-center text-gray-500 font-bold uppercase">Awaiting admin setup</p>
                            )}
                        </div>
                    )}

                    {/* COMPLETED STATUS */}
                    {isCompleted && (
                        <div className="bg-gradient-to-r from-green-950/30 via-emerald-900/35 to-green-950/30 border border-green-500/30 rounded-2xl p-8 shadow-xl text-center space-y-4 max-w-xl mx-auto">
                            <div className="text-5xl">🏆</div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-wider">Match Completed</h2>
                            <p className="text-sm text-gray-300">
                                This match is complete. Check the final scores in the scoreboard tab below.
                            </p>
                            <div className="flex gap-4 justify-center pt-4">
                                <button
                                    onClick={() => setActiveTab('scorecard')}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all"
                                >
                                    View Scorecard
                                </button>
                                <button
                                    onClick={() => navigate(`/tournament/${tournamentId}`)}
                                    className="bg-gray-800 hover:bg-gray-700 text-white font-black px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all"
                                >
                                    Tournament Standings
                                </button>
                            </div>
                        </div>
                    )}

                    {/* INITIAL OPENERS SETUP */}
                    {isInitialOpenersSetup && (
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg max-w-xl mx-auto space-y-6">
                            <div className="border-b border-gray-800 pb-3">
                                <h3 className="text-xl font-black uppercase tracking-wider text-white">Setup Opening Players</h3>
                                <p className="text-xs text-gray-400 mt-1">Select openers for batting team ({activeBattingTeamName}) and bowling team ({activeBowlingTeamName}).</p>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Striker (Batsman)</label>
                                        <select
                                            value={strikerId}
                                            onChange={(e) => setStrikerId(e.target.value)}
                                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-indigo-500"
                                        >
                                            <option value="">-- Choose Striker --</option>
                                            {battingTeamRoster.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Non-Striker (Batsman)</label>
                                        <select
                                            value={nonStrikerId}
                                            onChange={(e) => setNonStrikerId(e.target.value)}
                                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-indigo-500"
                                        >
                                            <option value="">-- Choose Non-Striker --</option>
                                            {battingTeamRoster.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Opening Bowler</label>
                                    <select
                                        value={bowlerId}
                                        onChange={(e) => setBowlerId(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="">-- Choose Bowler --</option>
                                        {bowlingTeamRoster.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {isAdmin ? (
                                <button
                                    onClick={handleInningsStartSubmit}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3.5 rounded-xl uppercase text-xs tracking-widest transition-all"
                                >
                                    Start Innings
                                </button>
                            ) : (
                                <p className="text-xs text-center text-gray-500 font-bold uppercase">Awaiting admin setup</p>
                            )}
                        </div>
                    )}

                    {/* LIVE COCKPIT DASHBOARD */}
                    {!isTossPhase && !isCompleted && !isInitialOpenersSetup && (
                        <div className="space-y-6">
                            
                            {/* Score Display Card */}
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                        Innings {matchState.inningsNumber}
                                    </span>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-wider pt-1">{matchState.battingTeamName}</h3>
                                    <p className="text-xs text-gray-400">Bowling: <span className="text-white font-bold">{matchState.bowlingTeamName}</span></p>
                                </div>

                                <div className="text-center space-y-1">
                                    <div className="text-5xl font-black font-mono text-indigo-400">
                                        {matchState.totalRuns}/{matchState.totalWickets}
                                    </div>
                                    <div className="text-sm text-gray-300 font-semibold font-mono">
                                        {matchState.totalOversBowled} / {matchState.maxOvers} overs
                                    </div>
                                </div>

                                <div className="space-y-2 bg-gray-950 p-4 rounded-xl border border-gray-850">
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Current RR:</span>
                                        <span className="font-bold text-white font-mono">{matchState.currentRunRate?.toFixed(2)}</span>
                                    </div>
                                    {matchState.inningsNumber === 2 && matchState.target && (
                                        <>
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>Target:</span>
                                                <span className="font-bold text-white font-mono">{matchState.target}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>Required RR:</span>
                                                <span className="font-bold text-yellow-500 font-mono">{matchState.requiredRunRate?.toFixed(2)}</span>
                                            </div>
                                            <div className="text-center text-xs font-bold text-indigo-400 pt-1 border-t border-gray-800/60 font-mono">
                                                Need {matchState.runsNeeded} runs off {matchState.ballsRemaining} balls
                                            </div>
                                        </>
                                    )}
                                    {matchState.isFreeHitNext && (
                                        <div className="text-center text-[10px] font-black text-red-500 animate-pulse border border-red-500/20 bg-red-500/10 py-1 rounded uppercase tracking-widest">
                                            ⚠️ FREE HIT NEXT ⚠️
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Active Players Card */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                {/* Batsmen Details */}
                                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-md space-y-4">
                                    <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                                        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Batting</h4>
                                        {isAdmin && (
                                            <button
                                                onClick={handleSwapStriker}
                                                className="text-[10px] bg-gray-800 hover:bg-gray-700 font-black px-3 py-1 rounded uppercase tracking-wider transition-all"
                                            >
                                                Swap Ends
                                            </button>
                                        )}
                                    </div>
                                    <div className="divide-y divide-gray-800/40">
                                        {/* Striker */}
                                        <div className="flex justify-between py-3">
                                            <div>
                                                <p className="font-bold text-sm text-white">
                                                    {matchState.strikerName || 'Choosing...'} <span className="text-indigo-400 font-black">*</span>
                                                </p>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Striker</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-sm text-white font-mono">{matchState.strikerRuns} <span className="text-xs text-gray-400 font-normal">({matchState.strikerBalls}b)</span></p>
                                                <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                                                    SR: {matchState.strikerBalls > 0 ? ((matchState.strikerRuns / matchState.strikerBalls) * 100).toFixed(1) : '0.0'}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Non-Striker */}
                                        <div className="flex justify-between py-3">
                                            <div>
                                                <p className="font-bold text-sm text-gray-300">
                                                    {matchState.nonStrikerName || 'Choosing...'}
                                                </p>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Non-Striker</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-sm text-gray-300 font-mono">{matchState.nonStrikerRuns} <span className="text-xs text-gray-400 font-normal">({matchState.nonStrikerBalls}b)</span></p>
                                                <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                                                    SR: {matchState.nonStrikerBalls > 0 ? ((matchState.nonStrikerRuns / matchState.nonStrikerBalls) * 100).toFixed(1) : '0.0'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bowler Details */}
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-md space-y-4">
                                    <div className="border-b border-gray-800 pb-3">
                                        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Bowling</h4>
                                    </div>
                                    <div className="py-2 space-y-3">
                                        <div>
                                            <p className="font-bold text-sm text-white">
                                                {matchState.currentBowlerName || 'Choosing...'}
                                            </p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Current Bowler</p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 bg-gray-950 p-3 rounded-xl border border-gray-850 text-center font-mono">
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase">O</p>
                                                <p className="text-sm font-bold text-white mt-0.5">{matchState.currentBowlerOvers}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase">R</p>
                                                <p className="text-sm font-bold text-white mt-0.5">{matchState.currentBowlerRuns}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase">W</p>
                                                <p className="text-sm font-bold text-green-400 mt-0.5">{matchState.currentBowlerWickets}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Over Ball Outcomes Display */}
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-md space-y-4">
                                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">This Over</h4>
                                <div className="flex flex-wrap gap-2.5 items-center">
                                    {matchState.recentBalls?.map((ball, idx) => {
                                        let bgClass = 'bg-gray-800 border-gray-700 text-gray-300';
                                        if (ball === 'W' || ball === 'RO') bgClass = 'bg-red-500/20 border-red-500/40 text-red-400 font-black';
                                        else if (ball === '4' || ball === '6') bgClass = 'bg-green-500/20 border-green-500/40 text-green-400 font-black';
                                        else if (ball === 'Wd' || ball === 'Nb') bgClass = 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400 font-black';

                                        return (
                                            <span 
                                                key={idx} 
                                                className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-semibold ${bgClass}`}
                                            >
                                                {ball}
                                            </span>
                                        );
                                    })}
                                    {(matchState.recentBalls?.length === 0 || !matchState.recentBalls) && (
                                        <p className="text-xs text-gray-500 italic">No balls bowled in this over yet.</p>
                                    )}
                                </div>
                            </div>

                            {/* Scoring Action Board (Admin Only) */}
                            {isAdmin && (
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-md space-y-6">
                                    <div className="border-b border-gray-800 pb-3 flex justify-between items-center">
                                        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Ball Entry Controls</h4>
                                        {activePanel && (
                                            <button 
                                                onClick={() => setActivePanel(null)} 
                                                className="text-[10px] text-gray-400 hover:text-white uppercase tracking-wider font-bold"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>

                                    {!activePanel ? (
                                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                                            {/* Dot / standard runs */}
                                            <button
                                                onClick={() => handleStandardBallSubmit('DOT')}
                                                className="bg-gray-950 hover:bg-gray-800 border border-gray-850 py-3.5 rounded-xl text-sm font-black uppercase transition-all"
                                            >
                                                0 runs (Dot)
                                            </button>
                                            <button
                                                onClick={() => handleStandardBallSubmit('ONE')}
                                                className="bg-gray-950 hover:bg-gray-800 border border-gray-850 py-3.5 rounded-xl text-sm font-black uppercase transition-all"
                                            >
                                                1 Run
                                            </button>
                                            <button
                                                onClick={() => handleStandardBallSubmit('TWO')}
                                                className="bg-gray-950 hover:bg-gray-800 border border-gray-850 py-3.5 rounded-xl text-sm font-black uppercase transition-all"
                                            >
                                                2 Runs
                                            </button>
                                            <button
                                                onClick={() => handleStandardBallSubmit('THREE')}
                                                className="bg-gray-950 hover:bg-gray-800 border border-gray-850 py-3.5 rounded-xl text-sm font-black uppercase transition-all"
                                            >
                                                3 Runs
                                            </button>
                                            <button
                                                onClick={() => handleStandardBallSubmit('FOUR')}
                                                className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 py-3.5 rounded-xl text-sm font-black text-green-400 uppercase transition-all"
                                            >
                                                4 (Boundary)
                                            </button>
                                            <button
                                                onClick={() => handleStandardBallSubmit('SIX')}
                                                className="bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 py-3.5 rounded-xl text-sm font-black text-indigo-400 uppercase transition-all"
                                            >
                                                6 (Sixer)
                                            </button>
                                            
                                            {/* Specialized controls */}
                                            <button
                                                onClick={() => setActivePanel('wide')}
                                                className="bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 py-3.5 rounded-xl text-sm font-black text-yellow-400 uppercase transition-all"
                                            >
                                                Wide
                                            </button>
                                            <button
                                                onClick={() => setActivePanel('noball')}
                                                className="bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 py-3.5 rounded-xl text-sm font-black text-yellow-400 uppercase transition-all"
                                            >
                                                No Ball
                                            </button>
                                            <button
                                                onClick={() => setActivePanel('wicket')}
                                                className="bg-red-500/15 hover:bg-red-500/25 border border-red-500/25 py-3.5 rounded-xl text-sm font-black text-red-400 uppercase transition-all"
                                            >
                                                Wicket
                                            </button>
                                            <button
                                                onClick={() => setActivePanel('runout')}
                                                className="bg-red-500/15 hover:bg-red-500/25 border border-red-500/25 py-3.5 rounded-xl text-sm font-black text-red-400 uppercase transition-all"
                                            >
                                                Run Out
                                            </button>
                                            <button
                                                onClick={() => handleStandardBallSubmit('DEADBALL')}
                                                className="bg-gray-950 hover:bg-gray-800 border border-gray-850 py-3.5 rounded-xl text-xs font-black uppercase transition-all"
                                            >
                                                Dead Ball
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-950 p-5 rounded-xl border border-gray-850 space-y-4">
                                            {/* PANEL: Wicket details */}
                                            {activePanel === 'wicket' && (
                                                <div className="space-y-4">
                                                    <h5 className="text-xs font-black text-red-400 uppercase tracking-widest">Wicket Configuration</h5>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dismissal Type</label>
                                                        <select
                                                            value={wicketType}
                                                            onChange={(e) => setWicketType(e.target.value)}
                                                            className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                                                        >
                                                            <option value="BOWLED">Bowled</option>
                                                            <option value="CAUGHT">Caught</option>
                                                            <option value="LBW">LBW</option>
                                                            <option value="STUMPED">Stumped</option>
                                                            <option value="HIT_WICKET">Hit Wicket</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={handleWicketSubmit}
                                                            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-2.5 rounded-lg text-xs uppercase tracking-wider"
                                                        >
                                                            Confirm Wicket
                                                        </button>
                                                        <button 
                                                            onClick={() => setActivePanel(null)}
                                                            className="bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold px-5 rounded-lg text-xs uppercase tracking-wider"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* PANEL: Run Out details */}
                                            {activePanel === 'runout' && (
                                                <div className="space-y-4">
                                                    <h5 className="text-xs font-black text-red-400 uppercase tracking-widest">Run Out Configuration</h5>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Who got out?</label>
                                                            <select
                                                                value={runOutPlayerId}
                                                                onChange={(e) => setRunOutPlayerId(e.target.value)}
                                                                className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                                                            >
                                                                <option value="">-- Choose Batsman --</option>
                                                                <option value={matchState.strikerId}>{matchState.strikerName} (Striker)</option>
                                                                <option value={matchState.nonStrikerId}>{matchState.nonStrikerName} (Non-Striker)</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Runs Completed</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={runOutRuns}
                                                                onChange={(e) => setRunOutRuns(Number(e.target.value))}
                                                                className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={handleRunOutSubmit}
                                                            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-2.5 rounded-lg text-xs uppercase tracking-wider"
                                                        >
                                                            Confirm Run Out
                                                        </button>
                                                        <button 
                                                            onClick={() => setActivePanel(null)}
                                                            className="bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold px-5 rounded-lg text-xs uppercase tracking-wider"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* PANEL: Wide details */}
                                            {activePanel === 'wide' && (
                                                <div className="space-y-4">
                                                    <h5 className="text-xs font-black text-yellow-400 uppercase tracking-widest">Wide Configuration</h5>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Additional Runs (excluding the 1 wide penalty)</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={wideRuns}
                                                            onChange={(e) => setWideRuns(Number(e.target.value))}
                                                            className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                                                            placeholder="0 for standard wide"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={handleWideSubmit}
                                                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-2.5 rounded-lg text-xs uppercase tracking-wider"
                                                        >
                                                            Confirm Wide
                                                        </button>
                                                        <button 
                                                            onClick={() => setActivePanel(null)}
                                                            className="bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold px-5 rounded-lg text-xs uppercase tracking-wider"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* PANEL: No Ball details */}
                                            {activePanel === 'noball' && (
                                                <div className="space-y-4">
                                                    <h5 className="text-xs font-black text-yellow-400 uppercase tracking-widest">No Ball Configuration</h5>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Additional Runs (excluding the 1 no-ball penalty)</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={noBallRuns}
                                                                onChange={(e) => setNoBallRuns(Number(e.target.value))}
                                                                className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                                                                placeholder="0 for standard no ball"
                                                            />
                                                        </div>
                                                        <div className="space-y-2 flex flex-col justify-center">
                                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Free Hit</span>
                                                            <label className="flex items-center space-x-2.5 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={noBallFreeHit}
                                                                    onChange={(e) => setNoBallFreeHit(e.target.checked)}
                                                                    className="w-4.5 h-4.5 accent-indigo-500 rounded cursor-pointer"
                                                                />
                                                                <span className="text-xs font-bold uppercase text-gray-300 select-none">Triggers Free Hit next ball</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={handleNoBallSubmit}
                                                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-2.5 rounded-lg text-xs uppercase tracking-wider"
                                                        >
                                                            Confirm No Ball
                                                        </button>
                                                        <button 
                                                            onClick={() => setActivePanel(null)}
                                                            className="bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold px-5 rounded-lg text-xs uppercase tracking-wider"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    )}
                </div>
            )}

            {/* MODALS */}
            {/* 1. Next Batsman Modal */}
            <NextBatsmanModal 
                isOpen={isBatsmanDismissed && isAdmin}
                onSubmit={handleNextBatsmanSelect}
                battingRoster={battingTeamRoster}
                battingScorecard={scorecardBattingRoster}
            />

            {/* 2. Next Bowler Modal */}
            <NextBowlerModal 
                isOpen={isNewBowlerNeeded && isAdmin}
                onSubmit={handleNextBowlerSelect}
                bowlingRoster={bowlingTeamRoster}
                lastBowlerId={lastBowlerId}
            />
        </div>
    );
}
