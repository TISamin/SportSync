package com.sportsync.cricket;

import com.sportsync.domain.*;
import com.sportsync.domain.BallEvent.BallOutcome;
import com.sportsync.domain.BallEvent.DismissalType;
import com.sportsync.domain.CricketMatchState.CricketMatchStatus;
import com.sportsync.domain.CricketMatchState.TossDecision;
import com.sportsync.domain.Innings.InningsStatus;
import com.sportsync.domain.BattingScorecard.BattingStatus;
import com.sportsync.dto.CricketMatchStateDto;
import com.sportsync.dto.CricketScorecardDto;
import com.sportsync.dto.SubmitBallRequest;
import com.sportsync.player.PlayerRepository;
import com.sportsync.team.TeamRepository;
import com.sportsync.team.TeamPlayerRepository;
import com.sportsync.tournament.MatchFixtureRepository;
import com.sportsync.tournament.TournamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CricketMatchService {

    private final InningsRepository inningsRepository;
    private final BallEventRepository ballEventRepository;
    private final BattingScorecardRepository battingScorecardRepository;
    private final BowlingScorecardRepository bowlingScorecardRepository;
    private final CricketMatchStateRepository cricketMatchStateRepository;
    private final TournamentPlayerStatRepository tournamentPlayerStatRepository;
    private final MatchFixtureRepository matchFixtureRepository;
    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final TeamPlayerRepository teamPlayerRepository;
    private final TournamentRepository tournamentRepository;
    private final CricketStandingsService cricketStandingsService;

    public CricketMatchService(InningsRepository inningsRepository,
                               BallEventRepository ballEventRepository,
                               BattingScorecardRepository battingScorecardRepository,
                               BowlingScorecardRepository bowlingScorecardRepository,
                               CricketMatchStateRepository cricketMatchStateRepository,
                               TournamentPlayerStatRepository tournamentPlayerStatRepository,
                               MatchFixtureRepository matchFixtureRepository,
                               PlayerRepository playerRepository,
                               TeamRepository teamRepository,
                               TeamPlayerRepository teamPlayerRepository,
                               TournamentRepository tournamentRepository,
                               CricketStandingsService cricketStandingsService) {
        this.inningsRepository = inningsRepository;
        this.ballEventRepository = ballEventRepository;
        this.battingScorecardRepository = battingScorecardRepository;
        this.bowlingScorecardRepository = bowlingScorecardRepository;
        this.cricketMatchStateRepository = cricketMatchStateRepository;
        this.tournamentPlayerStatRepository = tournamentPlayerStatRepository;
        this.matchFixtureRepository = matchFixtureRepository;
        this.playerRepository = playerRepository;
        this.teamRepository = teamRepository;
        this.teamPlayerRepository = teamPlayerRepository;
        this.tournamentRepository = tournamentRepository;
        this.cricketStandingsService = cricketStandingsService;
    }

    public static double calculateOvers(int totalLegalBalls) {
        int completedOvers = totalLegalBalls / 6;
        int remainingBalls = totalLegalBalls % 6;
        return completedOvers + (remainingBalls / 10.0);
    }

    public static int oversToBalls(double overs) {
        int completedOvers = (int) overs;
        int remainingBalls = (int) Math.round((overs - completedOvers) * 10);
        return completedOvers * 6 + remainingBalls;
    }

    public CricketMatchState getOrCreateState(Long matchId) {
        return cricketMatchStateRepository.findByMatchId(matchId)
                .orElseGet(() -> {
                    CricketMatchState state = new CricketMatchState();
                    state.setMatchId(matchId);
                    state.setStatus(CricketMatchStatus.TOSS);
                    state.setInningsNumber(1);
                    return cricketMatchStateRepository.save(state);
                });
    }

    public CricketMatchState setupToss(Long matchId, Long tossWinnerId, TossDecision tossDecision) {
        CricketMatchState state = getOrCreateState(matchId);
        state.setTossWinnerId(tossWinnerId);
        state.setTossDecision(tossDecision);
        state.setStatus(CricketMatchStatus.INNINGS_1);
        state.setInningsNumber(1);
        return cricketMatchStateRepository.save(state);
    }

    public void startInnings(Long matchId, Long strikerId, Long nonStrikerId, Long currentBowlerId) {
        CricketMatchState state = getOrCreateState(matchId);
        MatchFixture fixture = matchFixtureRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found"));

        Long battingTeamId;
        Long bowlingTeamId;

        boolean tossWinnerBats = state.getTossDecision() == TossDecision.BAT;
        boolean isTossWinnerHome = state.getTossWinnerId().equals(fixture.getHomeTeamId());

        if (state.getStatus() == CricketMatchStatus.INNINGS_1 || state.getStatus() == CricketMatchStatus.SUPER_OVER_1) {
            if (isTossWinnerHome) {
                battingTeamId = tossWinnerBats ? fixture.getHomeTeamId() : fixture.getAwayTeamId();
                bowlingTeamId = tossWinnerBats ? fixture.getAwayTeamId() : fixture.getHomeTeamId();
            } else {
                battingTeamId = tossWinnerBats ? fixture.getAwayTeamId() : fixture.getHomeTeamId();
                bowlingTeamId = tossWinnerBats ? fixture.getHomeTeamId() : fixture.getAwayTeamId();
            }
        } else {
            // Innings 2 / Super Over 2 -> swap batting & bowling
            if (isTossWinnerHome) {
                battingTeamId = tossWinnerBats ? fixture.getAwayTeamId() : fixture.getHomeTeamId();
                bowlingTeamId = tossWinnerBats ? fixture.getHomeTeamId() : fixture.getAwayTeamId();
            } else {
                battingTeamId = tossWinnerBats ? fixture.getHomeTeamId() : fixture.getAwayTeamId();
                bowlingTeamId = tossWinnerBats ? fixture.getAwayTeamId() : fixture.getHomeTeamId();
            }
        }

        // Create Innings
        Innings innings = new Innings();
        innings.setMatchId(matchId);
        innings.setInningsNumber(state.getInningsNumber());
        innings.setBattingTeamId(battingTeamId);
        innings.setBowlingTeamId(bowlingTeamId);
        innings.setStatus(InningsStatus.IN_PROGRESS);
        innings.setIsSuperOver(state.getStatus() == CricketMatchStatus.SUPER_OVER_1 || state.getStatus() == CricketMatchStatus.SUPER_OVER_2);
        final Innings savedInnings = inningsRepository.save(innings);
        final Long inningsId = savedInnings.getId();

        // Initialize Batting Scorecards for ALL players in the batting team
        List<TeamPlayer> teamPlayers = teamPlayerRepository.findByTeamId(battingTeamId);
        for (TeamPlayer tp : teamPlayers) {
            BattingScorecard bs = new BattingScorecard();
            bs.setInningsId(inningsId);
            bs.setPlayerId(tp.getPlayerId());
            bs.setStatus(BattingStatus.DNB);
            battingScorecardRepository.save(bs);
        }

        // Set striker and non-striker to NOT_OUT
        BattingScorecard strikerScorecard = battingScorecardRepository.findByInningsIdAndPlayerId(inningsId, strikerId)
                .orElseGet(() -> {
                    BattingScorecard bs = new BattingScorecard();
                    bs.setInningsId(inningsId);
                    bs.setPlayerId(strikerId);
                    return bs;
                });
        strikerScorecard.setStatus(BattingStatus.NOT_OUT);
        battingScorecardRepository.save(strikerScorecard);

        BattingScorecard nonStrikerScorecard = battingScorecardRepository.findByInningsIdAndPlayerId(inningsId, nonStrikerId)
                .orElseGet(() -> {
                    BattingScorecard bs = new BattingScorecard();
                    bs.setInningsId(inningsId);
                    bs.setPlayerId(nonStrikerId);
                    return bs;
                });
        nonStrikerScorecard.setStatus(BattingStatus.NOT_OUT);
        battingScorecardRepository.save(nonStrikerScorecard);

        // Initialize Bowler Scorecard
        getOrCreateBowlingScorecard(inningsId, currentBowlerId);

        // Update state
        state.setStrikerId(strikerId);
        state.setNonStrikerId(nonStrikerId);
        state.setCurrentBowlerId(currentBowlerId);
        state.setLegalBallsInCurrentOver(0);
        state.setIsFreeHitNext(false);
        cricketMatchStateRepository.save(state);
    }

    public void swapStriker(Long matchId) {
        CricketMatchState state = getOrCreateState(matchId);
        Long temp = state.getStrikerId();
        state.setStrikerId(state.getNonStrikerId());
        state.setNonStrikerId(temp);
        cricketMatchStateRepository.save(state);
    }

    public void setNextBatsman(Long matchId, Long playerId) {
        CricketMatchState state = getOrCreateState(matchId);
        Innings innings = getCurrentInnings(state);

        BattingScorecard bs = battingScorecardRepository.findByInningsIdAndPlayerId(innings.getId(), playerId)
                .orElseGet(() -> {
                    BattingScorecard s = new BattingScorecard();
                    s.setInningsId(innings.getId());
                    s.setPlayerId(playerId);
                    return s;
                });
        bs.setStatus(BattingStatus.NOT_OUT);
        battingScorecardRepository.save(bs);

        if (state.getStrikerId() == null) {
            state.setStrikerId(playerId);
        } else if (state.getNonStrikerId() == null) {
            state.setNonStrikerId(playerId);
        } else {
            throw new IllegalStateException("Both batsman positions are already occupied");
        }
        cricketMatchStateRepository.save(state);
    }

    public void setNextBowler(Long matchId, Long playerId) {
        CricketMatchState state = getOrCreateState(matchId);
        Innings innings = getCurrentInnings(state);

        // Validate that bowler cannot bowl two consecutive overs
        List<BallEvent> balls = ballEventRepository.findByInningsIdOrderByOverNumberAscBallNumberAsc(innings.getId());
        if (!balls.isEmpty()) {
            BallEvent lastBall = balls.get(balls.size() - 1);
            if (lastBall.getBowlerId().equals(playerId)) {
                throw new IllegalArgumentException("A bowler cannot bowl consecutive overs!");
            }
        }

        getOrCreateBowlingScorecard(innings.getId(), playerId);
        state.setCurrentBowlerId(playerId);
        state.setLegalBallsInCurrentOver(0);
        cricketMatchStateRepository.save(state);
    }

    public void processBall(Long matchId, SubmitBallRequest request) {
        CricketMatchState state = getOrCreateState(matchId);
        Innings innings = getCurrentInnings(state);
        MatchFixture fixture = matchFixtureRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found"));

        Long strikerId = state.getStrikerId();
        Long nonStrikerId = state.getNonStrikerId();
        Long bowlerId = state.getCurrentBowlerId();

        if (strikerId == null || nonStrikerId == null || bowlerId == null) {
            throw new IllegalStateException("Ensure both batsmen and bowler are set before scoring");
        }

        BallOutcome outcome = request.getOutcome();
        boolean isLegal = true;
        int runsScored = 0;
        int extraRuns = 0;
        boolean isWicket = false;
        Long dismissedPlayerId = null;
        boolean triggersFreeHit = false;

        // Extract outcome specifics
        switch (outcome) {
            case DOT:
                break;
            case ONE:
                runsScored = 1;
                break;
            case TWO:
                runsScored = 2;
                break;
            case THREE:
                runsScored = 3;
                break;
            case FOUR:
                runsScored = 4;
                break;
            case SIX:
                runsScored = 6;
                break;
            case WIDE:
                isLegal = false;
                extraRuns = 1 + request.getExtraRuns();
                break;
            case NOBALL_FREE_HIT:
                isLegal = false;
                extraRuns = 1 + request.getExtraRuns();
                triggersFreeHit = true;
                break;
            case NOBALL_NO_FREE_HIT:
                isLegal = false;
                extraRuns = 1 + request.getExtraRuns();
                break;
            case RUNOUT:
                isLegal = true;
                isWicket = true;
                dismissedPlayerId = request.getDismissedPlayerId();
                runsScored = request.getExtraRuns(); // Runs completed before run out
                break;
            case WICKET:
                isLegal = true;
                if (state.getIsFreeHitNext()) {
                    // Ignored under free hit unless it's a RUN_OUT (which is handled separately as RUNOUT)
                    isWicket = false;
                } else {
                    isWicket = true;
                    dismissedPlayerId = strikerId;
                }
                break;
            case DEADBALL:
                isLegal = false;
                break;
        }

        // Save Ball Event
        int overNumber = oversToBalls(innings.getTotalOversBowled()) / 6;
        int ballNumber = state.getLegalBallsInCurrentOver() + (isLegal ? 1 : 0);

        BallEvent event = new BallEvent();
        event.setInningsId(innings.getId());
        event.setOverNumber(overNumber);
        event.setBallNumber(ballNumber);
        event.setBowlerId(bowlerId);
        event.setStrikerId(strikerId);
        event.setNonStrikerId(nonStrikerId);
        event.setOutcome(outcome);
        event.setExtraRuns(extraRuns);
        event.setIsLegalDelivery(isLegal);
        event.setFreeHitNext(triggersFreeHit);
        if (isWicket) {
            event.setDismissalType(request.getDismissalType() != null ? request.getDismissalType() : DismissalType.BOWLED);
            event.setDismissedPlayerId(dismissedPlayerId);
        }
        ballEventRepository.save(event);

        // Update Batting Scorecard
        BattingScorecard strikerScorecard = battingScorecardRepository.findByInningsIdAndPlayerId(innings.getId(), strikerId)
                .orElseThrow(() -> new IllegalStateException("Striker scorecard not found"));

        if (isLegal) {
            strikerScorecard.setBallsFaced(strikerScorecard.getBallsFaced() + 1);
        }

        if (runsScored > 0) {
            strikerScorecard.setRuns(strikerScorecard.getRuns() + runsScored);
            if (runsScored == 4) strikerScorecard.setFours(strikerScorecard.getFours() + 1);
            if (runsScored == 6) strikerScorecard.setSixes(strikerScorecard.getSixes() + 1);
        }

        // Update Bowling Scorecard
        BowlingScorecard bowlerScorecard = bowlingScorecardRepository.findByInningsIdAndPlayerId(innings.getId(), bowlerId)
                .orElseThrow(() -> new IllegalStateException("Bowler scorecard not found"));

        if (isLegal) {
            bowlerScorecard.setBallsBowled(bowlerScorecard.getBallsBowled() + 1);
            bowlerScorecard.setOversBowled(bowlerScorecard.getBallsBowled() / 6);
        }

        // Bowler conceded runs
        if (outcome == BallOutcome.WIDE || outcome == BallOutcome.NOBALL_FREE_HIT || outcome == BallOutcome.NOBALL_NO_FREE_HIT) {
            bowlerScorecard.setRunsConceded(bowlerScorecard.getRunsConceded() + extraRuns);
            if (outcome == BallOutcome.WIDE) {
                bowlerScorecard.setWides(bowlerScorecard.getWides() + extraRuns);
            } else {
                bowlerScorecard.setNoBalls(bowlerScorecard.getNoBalls() + extraRuns);
            }
        } else {
            bowlerScorecard.setRunsConceded(bowlerScorecard.getRunsConceded() + runsScored);
        }

        // Handle Dismissal
        if (isWicket) {
            innings.setTotalWickets(innings.getTotalWickets() + 1);

            BattingScorecard dismissedScorecard = battingScorecardRepository.findByInningsIdAndPlayerId(innings.getId(), dismissedPlayerId)
                    .orElseThrow(() -> new IllegalStateException("Dismissed player scorecard not found"));
            dismissedScorecard.setStatus(BattingStatus.OUT);
            dismissedScorecard.setDismissalType(event.getDismissalType());

            if (outcome == BallOutcome.WICKET) {
                // Credited to bowler
                dismissedScorecard.setDismissedById(bowlerId);
                bowlerScorecard.setWickets(bowlerScorecard.getWickets() + 1);
            }

            battingScorecardRepository.save(dismissedScorecard);

            if (dismissedPlayerId.equals(strikerId)) {
                state.setStrikerId(null);
            } else {
                state.setNonStrikerId(null);
            }
        }

        // Update Innings
        innings.setTotalRuns(innings.getTotalRuns() + runsScored + extraRuns);
        innings.setExtras(innings.getExtras() + extraRuns);

        if (isLegal) {
            int totalLegalBalls = oversToBalls(innings.getTotalOversBowled()) + 1;
            innings.setTotalOversBowled(calculateOvers(totalLegalBalls));
        }
        inningsRepository.save(innings);

        // Update cumulative tournament player stats
        updateTournamentPlayerStats(fixture.getTournamentId(), strikerId, innings.getBattingTeamId());
        updateTournamentPlayerStats(fixture.getTournamentId(), bowlerId, innings.getBowlingTeamId());
        if (isWicket && !dismissedPlayerId.equals(strikerId)) {
            updateTournamentPlayerStats(fixture.getTournamentId(), dismissedPlayerId, innings.getBattingTeamId());
        }

        // Handle Over Completion & Swap Ends
        if (isLegal) {
            state.setLegalBallsInCurrentOver(state.getLegalBallsInCurrentOver() + 1);

            // Swap batsmen if runs scored is 1 or 3
            if ((runsScored == 1 || runsScored == 3) && state.getStrikerId() != null && state.getNonStrikerId() != null) {
                Long temp = state.getStrikerId();
                state.setStrikerId(state.getNonStrikerId());
                state.setNonStrikerId(temp);
            }

            if (state.getLegalBallsInCurrentOver() == 6) {
                // Recalculate maidens: if bowler has completed this over and conceded 0 runs in it (excluding extras)
                // Wait! A maiden is an over where the bowler conceded 0 runs off the bat and no wide/no-ball extras.
                // Let's check the current over events
                List<BallEvent> overBalls = ballEventRepository.findByInningsId(innings.getId()).stream()
                        .filter(e -> e.getOverNumber() == overNumber)
                        .collect(Collectors.toList());
                boolean isMaiden = true;
                for (BallEvent be : overBalls) {
                    if (be.getOutcome() != BallOutcome.DOT && be.getOutcome() != BallOutcome.WICKET && be.getOutcome() != BallOutcome.DEADBALL) {
                        isMaiden = false;
                        break;
                    }
                }
                if (isMaiden) {
                    bowlerScorecard.setMaidens(bowlerScorecard.getMaidens() + 1);
                }

                // Swap batsmen at end of over
                if (state.getStrikerId() != null && state.getNonStrikerId() != null) {
                    Long temp = state.getStrikerId();
                    state.setStrikerId(state.getNonStrikerId());
                    state.setNonStrikerId(temp);
                }

                // Clear bowler for next over
                state.setCurrentBowlerId(null);
                state.setLegalBallsInCurrentOver(0);
            }
        }

        battingScorecardRepository.save(strikerScorecard);
        bowlingScorecardRepository.save(bowlerScorecard);

        // Update Free Hit status
        if (triggersFreeHit) {
            state.setIsFreeHitNext(true);
        } else if (isLegal) {
            state.setIsFreeHitNext(false);
        }

        cricketMatchStateRepository.save(state);

        // Check Innings and Match End Conditions
        checkInningsOrMatchEnd(fixture, innings, state);
    }

    private void checkInningsOrMatchEnd(MatchFixture fixture, Innings innings, CricketMatchState state) {
        int maxOvers = fixture.getOvers();
        boolean superOver = innings.getIsSuperOver();
        int oversLimit = superOver ? 1 : maxOvers;

        int totalLegalBalls = oversToBalls(innings.getTotalOversBowled());
        boolean allOut = innings.getTotalWickets() >= 10;
        boolean oversCompleted = totalLegalBalls >= (oversLimit * 6);

        boolean inningsEnded = allOut || oversCompleted;

        // Innings 2 Chasing End condition
        if (state.getInningsNumber() == 2) {
            Innings innings1 = inningsRepository.findByMatchIdAndInningsNumberAndIsSuperOver(fixture.getId(), 1, superOver)
                    .orElseThrow(() -> new IllegalStateException("First innings not found"));

            if (innings.getTotalRuns() > innings1.getTotalRuns()) {
                inningsEnded = true;
            }
        }

        if (inningsEnded) {
            innings.setStatus(InningsStatus.COMPLETED);
            inningsRepository.save(innings);

            if (state.getInningsNumber() == 1) {
                // First Innings ended
                state.setInningsNumber(2);
                state.setStrikerId(null);
                state.setNonStrikerId(null);
                state.setCurrentBowlerId(null);
                state.setLegalBallsInCurrentOver(0);
                state.setIsFreeHitNext(false);
                cricketMatchStateRepository.save(state);
            } else {
                // Second Innings ended -> Match Completed (or Super Over)
                Innings innings1 = inningsRepository.findByMatchIdAndInningsNumberAndIsSuperOver(fixture.getId(), 1, superOver)
                        .orElseThrow(() -> new IllegalStateException("First innings not found"));

                if (innings.getTotalRuns().equals(innings1.getTotalRuns())) {
                    // Tie -> Trigger Super Over
                    List<Innings> superInnings = inningsRepository.findByMatchId(fixture.getId()).stream()
                            .filter(Innings::getIsSuperOver)
                            .collect(Collectors.toList());

                    int completedSuperOvers = superInnings.size() / 2;

                    if (completedSuperOvers < 3) {
                        // Trigger Super Over
                        state.setInningsNumber(1); // Set to super innings 1
                        state.setStatus(completedSuperOvers == 0 ? CricketMatchStatus.SUPER_OVER_1 :
                                (completedSuperOvers == 1 ? CricketMatchStatus.SUPER_OVER_1 : CricketMatchStatus.SUPER_OVER_1)); // always wait for setup
                        state.setStrikerId(null);
                        state.setNonStrikerId(null);
                        state.setCurrentBowlerId(null);
                        state.setLegalBallsInCurrentOver(0);
                        state.setIsFreeHitNext(false);
                        cricketMatchStateRepository.save(state);
                    } else {
                        // Boundary count across all super overs
                        resolveByBoundaryCount(fixture, state);
                    }
                } else {
                    // Clear winner
                    completeMatch(fixture, innings1, innings, state);
                }
            }
        }
    }

    private void completeMatch(MatchFixture fixture, Innings innings1, Innings innings2, CricketMatchState state) {
        state.setStatus(CricketMatchStatus.COMPLETED);
        state.setStrikerId(null);
        state.setNonStrikerId(null);
        state.setCurrentBowlerId(null);
        cricketMatchStateRepository.save(state);

        // Store total runs in fixture
        boolean innings1IsHome = innings1.getBattingTeamId().equals(fixture.getHomeTeamId());
        if (innings1IsHome) {
            fixture.setHomeScore(innings1.getTotalRuns());
            fixture.setAwayScore(innings2.getTotalRuns());
        } else {
            fixture.setHomeScore(innings2.getTotalRuns());
            fixture.setAwayScore(innings1.getTotalRuns());
        }
        fixture.setStatus(MatchFixture.MatchStatus.DONE);
        fixture.setPlayedAt(Instant.now());
        matchFixtureRepository.save(fixture);

        // Update standings!
        cricketStandingsService.updateCricketStandings(fixture);
    }

    private void resolveByBoundaryCount(MatchFixture fixture, CricketMatchState state) {
        state.setStatus(CricketMatchStatus.COMPLETED);
        state.setStrikerId(null);
        state.setNonStrikerId(null);
        state.setCurrentBowlerId(null);
        cricketMatchStateRepository.save(state);

        // Calculate boundary counts
        int homeBoundaries = countBoundaries(fixture.getTournamentId(), fixture.getHomeTeamId());
        int awayBoundaries = countBoundaries(fixture.getTournamentId(), fixture.getAwayTeamId());

        if (homeBoundaries >= awayBoundaries) {
            fixture.setHomeScore(1); // Set slightly superior to declare home team winner
            fixture.setAwayScore(0);
        } else {
            fixture.setHomeScore(0);
            fixture.setAwayScore(1);
        }

        fixture.setStatus(MatchFixture.MatchStatus.DONE);
        fixture.setPlayedAt(Instant.now());
        matchFixtureRepository.save(fixture);

        cricketStandingsService.updateCricketStandings(fixture);
    }

    private int countBoundaries(Long tournamentId, Long teamId) {
        List<TournamentPlayerStat> stats = tournamentPlayerStatRepository.findByTournamentId(tournamentId);
        int total = 0;
        for (TournamentPlayerStat s : stats) {
            if (s.getTeamId().equals(teamId)) {
                total += s.getTotalFours() + s.getTotalSixes();
            }
        }
        return total;
    }

    private void updateTournamentPlayerStats(Long tournamentId, Long playerId, Long teamId) {
        TournamentPlayerStat stat = tournamentPlayerStatRepository.findByTournamentIdAndPlayerId(tournamentId, playerId)
                .orElseGet(() -> new TournamentPlayerStat(tournamentId, playerId, teamId));

        // Re-calculate batting stats across all innings of this tournament for this player
        List<Innings> allInnings = inningsRepository.findAll().stream()
                .filter(i -> {
                    MatchFixture f = matchFixtureRepository.findById(i.getMatchId()).orElse(null);
                    return f != null && f.getTournamentId().equals(tournamentId);
                })
                .collect(Collectors.toList());

        int runs = 0;
        int balls = 0;
        int fours = 0;
        int sixes = 0;
        int wickets = 0;
        int runsConceded = 0;
        int ballsBowled = 0;

        for (Innings inn : allInnings) {
            Optional<BattingScorecard> bat = battingScorecardRepository.findByInningsIdAndPlayerId(inn.getId(), playerId);
            if (bat.isPresent()) {
                runs += bat.get().getRuns();
                balls += bat.get().getBallsFaced();
                fours += bat.get().getFours();
                sixes += bat.get().getSixes();
            }

            Optional<BowlingScorecard> bowl = bowlingScorecardRepository.findByInningsIdAndPlayerId(inn.getId(), playerId);
            if (bowl.isPresent()) {
                wickets += bowl.get().getWickets();
                runsConceded += bowl.get().getRunsConceded();
                ballsBowled += bowl.get().getBallsBowled();
            }
        }

        stat.setTotalRuns(runs);
        stat.setTotalBallsFaced(balls);
        stat.setTotalFours(fours);
        stat.setTotalSixes(sixes);
        stat.setTotalWickets(wickets);
        stat.setTotalRunsConceded(runsConceded);
        stat.setTotalOversBowled(ballsBowled / 6); // standard completed overs

        tournamentPlayerStatRepository.save(stat);
    }

    private Innings getCurrentInnings(CricketMatchState state) {
        List<Innings> matchInnings = inningsRepository.findByMatchId(state.getMatchId());
        boolean superOver = state.getStatus() == CricketMatchStatus.SUPER_OVER_1 || state.getStatus() == CricketMatchStatus.SUPER_OVER_2;

        return matchInnings.stream()
                .filter(i -> i.getInningsNumber().equals(state.getInningsNumber()) && i.getIsSuperOver() == superOver && i.getStatus() == InningsStatus.IN_PROGRESS)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Active innings not found for match"));
    }

    private BowlingScorecard getOrCreateBowlingScorecard(Long inningsId, Long playerId) {
        return bowlingScorecardRepository.findByInningsIdAndPlayerId(inningsId, playerId)
                .orElseGet(() -> {
                    BowlingScorecard bs = new BowlingScorecard();
                    bs.setInningsId(inningsId);
                    bs.setPlayerId(playerId);
                    return bowlingScorecardRepository.save(bs);
                });
    }

    public CricketMatchStateDto getMatchStateDto(Long matchId) {
        CricketMatchState state = getOrCreateState(matchId);
        MatchFixture fixture = matchFixtureRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found"));

        CricketMatchStateDto dto = new CricketMatchStateDto();
        dto.setMatchId(matchId);
        dto.setInningsNumber(state.getInningsNumber());
        dto.setStrikerId(state.getStrikerId());
        dto.setNonStrikerId(state.getNonStrikerId());
        dto.setCurrentBowlerId(state.getCurrentBowlerId());
        dto.setLegalBallsInCurrentOver(state.getLegalBallsInCurrentOver());
        dto.setIsFreeHitNext(state.getIsFreeHitNext());
        dto.setStatus(state.getStatus());
        dto.setTossWinnerId(state.getTossWinnerId());
        dto.setTossDecision(state.getTossDecision());
        dto.setMaxOvers(fixture.getOvers());

        if (state.getTossWinnerId() != null) {
            teamRepository.findById(state.getTossWinnerId()).ifPresent(t -> dto.setTossWinnerName(t.getName()));
        }

        // Fill player names
        if (state.getStrikerId() != null) {
            playerRepository.findById(state.getStrikerId()).ifPresent(p -> dto.setStrikerName(p.getName()));
        }
        if (state.getNonStrikerId() != null) {
            playerRepository.findById(state.getNonStrikerId()).ifPresent(p -> dto.setNonStrikerName(p.getName()));
        }
        if (state.getCurrentBowlerId() != null) {
            playerRepository.findById(state.getCurrentBowlerId()).ifPresent(p -> dto.setCurrentBowlerName(p.getName()));
        }

        // Load active innings
        List<Innings> matchInnings = inningsRepository.findByMatchId(matchId);
        boolean superOver = state.getStatus() == CricketMatchStatus.SUPER_OVER_1 || state.getStatus() == CricketMatchStatus.SUPER_OVER_2;

        Optional<Innings> currentInningsOpt = matchInnings.stream()
                .filter(i -> i.getInningsNumber().equals(state.getInningsNumber()) && i.getIsSuperOver() == superOver && i.getStatus() == InningsStatus.IN_PROGRESS)
                .findFirst();

        if (currentInningsOpt.isPresent()) {
            Innings innings = currentInningsOpt.get();
            dto.setBattingTeamId(innings.getBattingTeamId());
            dto.setBowlingTeamId(innings.getBowlingTeamId());
            teamRepository.findById(innings.getBattingTeamId()).ifPresent(t -> dto.setBattingTeamName(t.getName()));
            teamRepository.findById(innings.getBowlingTeamId()).ifPresent(t -> dto.setBowlingTeamName(t.getName()));
            dto.setTotalRuns(innings.getTotalRuns());
            dto.setTotalWickets(innings.getTotalWickets());
            dto.setTotalOversBowled(innings.getTotalOversBowled());
            dto.setExtras(innings.getExtras());

            // Fill batsman details
            if (state.getStrikerId() != null) {
                battingScorecardRepository.findByInningsIdAndPlayerId(innings.getId(), state.getStrikerId())
                        .ifPresent(bs -> {
                            dto.setStrikerRuns(bs.getRuns());
                            dto.setStrikerBalls(bs.getBallsFaced());
                        });
            }
            if (state.getNonStrikerId() != null) {
                battingScorecardRepository.findByInningsIdAndPlayerId(innings.getId(), state.getNonStrikerId())
                        .ifPresent(bs -> {
                            dto.setNonStrikerRuns(bs.getRuns());
                            dto.setNonStrikerBalls(bs.getBallsFaced());
                        });
            }

            // Fill bowler details
            if (state.getCurrentBowlerId() != null) {
                bowlingScorecardRepository.findByInningsIdAndPlayerId(innings.getId(), state.getCurrentBowlerId())
                        .ifPresent(bs -> {
                            dto.setCurrentBowlerOvers(calculateOvers(bs.getBallsBowled()));
                            dto.setCurrentBowlerRuns(bs.getRunsConceded());
                            dto.setCurrentBowlerWickets(bs.getWickets());
                        });
            }

            // Recent Balls in current over
            int currentOverNum = oversToBalls(innings.getTotalOversBowled()) / 6;
            List<String> overOutcomes = ballEventRepository.findByInningsId(innings.getId()).stream()
                    .filter(e -> e.getOverNumber() == currentOverNum)
                    .map(e -> {
                        if (e.getOutcome() == BallOutcome.WICKET) return "W";
                        if (e.getOutcome() == BallOutcome.WIDE) return "Wd";
                        if (e.getOutcome() == BallOutcome.NOBALL_FREE_HIT || e.getOutcome() == BallOutcome.NOBALL_NO_FREE_HIT) return "Nb";
                        if (e.getOutcome() == BallOutcome.RUNOUT) return "RO";
                        if (e.getOutcome() == BallOutcome.DOT) return "0";
                        return String.valueOf(e.getOutcome().ordinal()); // ONE -> 1, TWO -> 2, etc.
                    })
                    .map(s -> {
                        // map ordinals
                        if (s.equals("1")) return "1";
                        if (s.equals("2")) return "2";
                        if (s.equals("3")) return "3";
                        if (s.equals("4")) return "4";
                        if (s.equals("5")) return "6"; // SIX is ordinal 5
                        return s;
                    })
                    .collect(Collectors.toList());
            dto.setRecentBalls(overOutcomes);

            // Calculations for Innings 2 Chasing
            if (state.getInningsNumber() == 2) {
                Innings innings1 = matchInnings.stream()
                        .filter(i -> i.getInningsNumber() == 1 && i.getIsSuperOver() == superOver)
                        .findFirst()
                        .orElse(null);

                if (innings1 != null) {
                    dto.setTarget(innings1.getTotalRuns() + 1);
                    dto.setRunsNeeded(Math.max(0, dto.getTarget() - innings.getTotalRuns()));
                    int maxBalls = (superOver ? 1 : fixture.getOvers()) * 6;
                    int ballsBowled = oversToBalls(innings.getTotalOversBowled());
                    dto.setBallsRemaining(Math.max(0, maxBalls - ballsBowled));

                    if (dto.getBallsRemaining() > 0) {
                        dto.setRequiredRunRate(Math.round((dto.getRunsNeeded() * 6.0 / dto.getBallsRemaining()) * 100.0) / 100.0);
                    } else {
                        dto.setRequiredRunRate(dto.getRunsNeeded() > 0 ? 99.99 : 0.0);
                    }
                }
            }

            int totalBallsBowled = oversToBalls(innings.getTotalOversBowled());
            if (totalBallsBowled > 0) {
                dto.setCurrentRunRate(Math.round((innings.getTotalRuns() * 6.0 / totalBallsBowled) * 100.0) / 100.0);
            } else {
                dto.setCurrentRunRate(0.0);
            }
        }

        return dto;
    }

    public CricketScorecardDto getScorecardDto(Long matchId) {
        CricketScorecardDto dto = new CricketScorecardDto();

        List<Innings> inningsList = inningsRepository.findByMatchId(matchId);
        inningsList.stream()
                .filter(i -> i.getInningsNumber() == 1 && !i.getIsSuperOver())
                .findFirst()
                .ifPresent(i -> dto.setInnings1(buildInningsScorecard(i)));

        inningsList.stream()
                .filter(i -> i.getInningsNumber() == 2 && !i.getIsSuperOver())
                .findFirst()
                .ifPresent(i -> dto.setInnings2(buildInningsScorecard(i)));

        return dto;
    }

    private CricketScorecardDto.InningsScorecardDto buildInningsScorecard(Innings innings) {
        CricketScorecardDto.InningsScorecardDto dto = new CricketScorecardDto.InningsScorecardDto();
        teamRepository.findById(innings.getBattingTeamId()).ifPresent(t -> dto.setTeamName(t.getName()));
        dto.setTotalRuns(innings.getTotalRuns());
        dto.setTotalWickets(innings.getTotalWickets());
        dto.setTotalOversBowled(innings.getTotalOversBowled());
        dto.setExtras(innings.getExtras());

        // Batting scorecards
        List<BattingScorecard> batList = battingScorecardRepository.findByInningsId(innings.getId());
        List<CricketScorecardDto.BatsmanScorecardDto> batDtos = batList.stream()
                .map(b -> {
                    CricketScorecardDto.BatsmanScorecardDto d = new CricketScorecardDto.BatsmanScorecardDto();
                    d.setPlayerId(b.getPlayerId());
                    playerRepository.findById(b.getPlayerId()).ifPresent(p -> d.setPlayerName(p.getName()));
                    d.setRuns(b.getRuns());
                    d.setBallsFaced(b.getBallsFaced());
                    d.setFours(b.getFours());
                    d.setSixes(b.getSixes());
                    d.setDismissalType(b.getDismissalType() != null ? b.getDismissalType().name() : null);
                    if (b.getDismissedById() != null) {
                        playerRepository.findById(b.getDismissedById()).ifPresent(p -> d.setDismissedByName(p.getName()));
                    }
                    d.setStatus(b.getStatus().name());
                    return d;
                })
                .collect(Collectors.toList());
        dto.setBatting(batDtos);

        // Bowling scorecards
        List<BowlingScorecard> bowlList = bowlingScorecardRepository.findByInningsId(innings.getId());
        List<CricketScorecardDto.BowlerScorecardDto> bowlDtos = bowlList.stream()
                .map(b -> {
                    CricketScorecardDto.BowlerScorecardDto d = new CricketScorecardDto.BowlerScorecardDto();
                    d.setPlayerId(b.getPlayerId());
                    playerRepository.findById(b.getPlayerId()).ifPresent(p -> d.setPlayerName(p.getName()));
                    d.setOversBowled(calculateOvers(b.getBallsBowled()));
                    d.setBallsBowled(b.getBallsBowled());
                    d.setRunsConceded(b.getRunsConceded());
                    d.setWickets(b.getWickets());
                    d.setWides(b.getWides());
                    d.setNoBalls(b.getNoBalls());
                    d.setMaidens(b.getMaidens());
                    return d;
                })
                .collect(Collectors.toList());
        dto.setBowling(bowlDtos);

        return dto;
    }
}
