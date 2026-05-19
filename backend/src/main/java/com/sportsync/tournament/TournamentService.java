package com.sportsync.tournament;

import com.sportsync.domain.*;
import com.sportsync.dto.*;
import com.sportsync.team.TeamRepository;
import com.sportsync.stats.StatsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final TournamentTeamRepository tournamentTeamRepository;
    private final MatchFixtureRepository fixtureRepository;
    private final StandingRepository standingRepository;
    private final TeamRepository teamRepository;
    private final FixtureGeneratorService fixtureGeneratorService;
    private final com.sportsync.stats.MatchEventRepository matchEventRepository;
    private final StandingsService standingsService;
    private final TournamentResultRepository tournamentResultRepository;
    private final StatsService statsService;

    public TournamentService(TournamentRepository tournamentRepository,
                             TournamentTeamRepository tournamentTeamRepository,
                             MatchFixtureRepository fixtureRepository,
                             StandingRepository standingRepository,
                             TeamRepository teamRepository,
                             FixtureGeneratorService fixtureGeneratorService,
                             com.sportsync.stats.MatchEventRepository matchEventRepository,
                             StandingsService standingsService,
                             TournamentResultRepository tournamentResultRepository,
                             StatsService statsService) {
        this.tournamentRepository = tournamentRepository;
        this.tournamentTeamRepository = tournamentTeamRepository;
        this.fixtureRepository = fixtureRepository;
        this.standingRepository = standingRepository;
        this.teamRepository = teamRepository;
        this.fixtureGeneratorService = fixtureGeneratorService;
        this.matchEventRepository = matchEventRepository;
        this.standingsService = standingsService;
        this.tournamentResultRepository = tournamentResultRepository;
        this.statsService = statsService;
    }

    @Transactional
    public TournamentDto createTournament(String name, String type, List<Long> teamIds) {
        if (teamIds.size() != 8) {
            throw new IllegalArgumentException("Single phase tournament requires exactly 8 teams");
        }

        Tournament.TournamentType tournamentType = Tournament.TournamentType.valueOf(type);
        Tournament tournament = new Tournament(name, tournamentType);
        tournament = tournamentRepository.save(tournament);

        List<Team> teams = new ArrayList<>();
        for (Long teamId : teamIds) {
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new IllegalArgumentException("Team not found: " + teamId));
            teams.add(team);
            
            TournamentTeam tt = new TournamentTeam(tournament.getId(), team.getId(), 1, 1);
            tournamentTeamRepository.save(tt);
            
            Standing standing = new Standing(tournament.getId(), team.getId(), 1, 1);
            standingRepository.save(standing);
        }

        // Generate round-robin fixtures
        List<MatchFixture> fixtures = fixtureGeneratorService.generateRoundRobinFixtures(tournament.getId(), teams, 1, 1);
        fixtureRepository.saveAll(fixtures);

        return new TournamentDto(tournament);
    }

    @Transactional(readOnly = true)
    public List<MatchFixtureDto> getTournamentFixtures(Long tournamentId) {
        List<MatchFixture> fixtures = fixtureRepository.findByTournamentId(tournamentId);
        
        return fixtures.stream().map(fixture -> {
            MatchFixtureDto dto = new MatchFixtureDto(fixture);
            Team homeTeam = teamRepository.findById(fixture.getHomeTeamId()).orElse(null);
            Team awayTeam = teamRepository.findById(fixture.getAwayTeamId()).orElse(null);
            dto.setHomeTeamName(homeTeam != null ? homeTeam.getName() : "Unknown");
            dto.setAwayTeamName(awayTeam != null ? awayTeam.getName() : "Unknown");
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void saveMatchResult(Long tournamentId, Long matchId, MatchResultRequest request) {
        MatchFixture match = fixtureRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found"));
                
        if (!match.getTournamentId().equals(tournamentId)) {
            throw new IllegalArgumentException("Match does not belong to this tournament");
        }
        
        if (match.getStatus() == MatchFixture.MatchStatus.DONE) {
            throw new IllegalArgumentException("Match result already entered");
        }

        // Knockout matches cannot end in a draw
        if (match.getRound() != MatchFixture.MatchRound.GROUP) {
            if (request.getHomeScore().equals(request.getAwayScore())) {
                throw new IllegalArgumentException(
                        "Knockout matches cannot end in a draw. Enter the score after penalties if needed.");
            }
        }

        match.setHomeScore(request.getHomeScore());
        match.setAwayScore(request.getAwayScore());
        match.setStatus(MatchFixture.MatchStatus.DONE);
        match.setPlayedAt(java.time.Instant.now());
        fixtureRepository.save(match);

        if (request.getEvents() != null) {
            for (MatchEventRequest eventReq : request.getEvents()) {
                MatchEvent event = new MatchEvent(matchId, eventReq.getPlayerId(), eventReq.getTeamId(), 
                                                  eventReq.getEventType(), eventReq.getMinute());
                matchEventRepository.save(event);
            }
        }

        // Update standings only for group matches
        if (match.getRound() == MatchFixture.MatchRound.GROUP) {
            standingsService.processMatchResult(tournamentId, match.getHomeTeamId(), match.getAwayTeamId(), 
                                                request.getHomeScore(), request.getAwayScore(), 
                                                match.getPhaseNumber(), match.getGroupNumber());

            // After a group match, check if all group matches are done → auto-generate knockout
            long pendingGroupMatches = fixtureRepository.countByTournamentIdAndPhaseNumberAndGroupNumberAndRoundAndStatus(
                    tournamentId, match.getPhaseNumber(), match.getGroupNumber(),
                    MatchFixture.MatchRound.GROUP, MatchFixture.MatchStatus.PENDING);

            if (pendingGroupMatches == 0) {
                generateKnockoutFixtures(tournamentId, match.getPhaseNumber(), match.getGroupNumber());
            }
        }

        // After a semi-final, check if both semis are done → auto-generate final fixture
        if (match.getRound() == MatchFixture.MatchRound.SEMI) {
            checkAndGenerateFinal(tournamentId, match.getPhaseNumber(), match.getGroupNumber());
        }

        // After a final, check if final is done → save tournament result and set status to DONE
        if (match.getRound() == MatchFixture.MatchRound.FINAL) {
            completeTournament(tournamentId, match.getPhaseNumber(), match.getGroupNumber(), match);
        }
    }

    /**
     * Generates the two semi-final fixtures from the top 4 teams in the group standings.
     * Semi 1: 1st vs 4th, Semi 2: 2nd vs 3rd.
     * Called automatically when all 28 group matches are done, or manually via the API.
     */
    @Transactional
    public void generateKnockoutFixtures(Long tournamentId, int phaseNumber, int groupNumber) {
        // Verify all group matches are done
        long pendingGroupMatches = fixtureRepository.countByTournamentIdAndPhaseNumberAndGroupNumberAndRoundAndStatus(
                tournamentId, phaseNumber, groupNumber,
                MatchFixture.MatchRound.GROUP, MatchFixture.MatchStatus.PENDING);

        if (pendingGroupMatches > 0) {
            throw new IllegalStateException(
                    "Not all group matches are completed. " + pendingGroupMatches + " matches remaining.");
        }

        // Guard against duplicate generation
        List<MatchFixture> existingSemis = fixtureRepository.findByTournamentIdAndPhaseNumberAndRound(
                tournamentId, phaseNumber, MatchFixture.MatchRound.SEMI);
        if (!existingSemis.isEmpty()) {
            throw new IllegalStateException("Knockout fixtures have already been generated for this phase.");
        }

        // Get top 4 teams from standings (sorted by points DESC, GD DESC, GF DESC)
        List<Standing> standings = standingRepository
                .findByTournamentIdAndPhaseNumberAndGroupNumberOrderByPointsDescGoalDifferenceDescGoalsForDesc(
                        tournamentId, phaseNumber, groupNumber);

        if (standings.size() < 4) {
            throw new IllegalStateException("Need at least 4 teams in standings to generate knockout fixtures.");
        }

        Long team1st = standings.get(0).getTeamId();
        Long team2nd = standings.get(1).getTeamId();
        Long team3rd = standings.get(2).getTeamId();
        Long team4th = standings.get(3).getTeamId();

        // Semi 1: 1st vs 4th
        MatchFixture semi1 = new MatchFixture(tournamentId, team1st, team4th,
                phaseNumber, groupNumber, MatchFixture.MatchRound.SEMI);
        fixtureRepository.save(semi1);

        // Semi 2: 2nd vs 3rd
        MatchFixture semi2 = new MatchFixture(tournamentId, team2nd, team3rd,
                phaseNumber, groupNumber, MatchFixture.MatchRound.SEMI);
        fixtureRepository.save(semi2);
    }

    /**
     * Checks if both semi-final matches are done.
     * If so, determines the winners and creates the final fixture.
     */
    private void checkAndGenerateFinal(Long tournamentId, int phaseNumber, int groupNumber) {
        List<MatchFixture> semis = fixtureRepository.findByTournamentIdAndPhaseNumberAndRound(
                tournamentId, phaseNumber, MatchFixture.MatchRound.SEMI);

        boolean allSemisDone = semis.stream()
                .allMatch(s -> s.getStatus() == MatchFixture.MatchStatus.DONE);

        if (!allSemisDone) {
            return; // Wait for both semis to finish
        }

        // Guard against duplicate final generation
        List<MatchFixture> existingFinal = fixtureRepository.findByTournamentIdAndPhaseNumberAndRound(
                tournamentId, phaseNumber, MatchFixture.MatchRound.FINAL);
        if (!existingFinal.isEmpty()) {
            return; // Final already generated
        }

        // Determine semi-final winners
        Long winner1 = getMatchWinner(semis.get(0));
        Long winner2 = getMatchWinner(semis.get(1));

        if (winner1 == null || winner2 == null) {
            throw new IllegalStateException(
                    "Semi-final matches must have a clear winner (no draws allowed in knockouts).");
        }

        // Create the final fixture
        MatchFixture finalMatch = new MatchFixture(tournamentId, winner1, winner2,
                phaseNumber, groupNumber, MatchFixture.MatchRound.FINAL);
        fixtureRepository.save(finalMatch);
    }

    /**
     * Returns the winner (team ID) of a completed match.
     * Returns null if the match is a draw or scores are missing.
     */
    private Long getMatchWinner(MatchFixture match) {
        if (match.getHomeScore() == null || match.getAwayScore() == null) {
            return null;
        }
        if (match.getHomeScore() > match.getAwayScore()) {
            return match.getHomeTeamId();
        } else if (match.getAwayScore() > match.getHomeScore()) {
            return match.getAwayTeamId();
        }
        return null; // Draw
    }

    /**
     * Returns all knockout fixtures (SEMI + FINAL) for a tournament.
     */
    @Transactional(readOnly = true)
    public List<MatchFixtureDto> getKnockoutFixtures(Long tournamentId) {
        List<MatchFixture> fixtures = fixtureRepository.findByTournamentIdAndRoundIn(
                tournamentId, List.of(MatchFixture.MatchRound.SEMI, MatchFixture.MatchRound.FINAL));

        return fixtures.stream().map(fixture -> {
            MatchFixtureDto dto = new MatchFixtureDto(fixture);
            Team homeTeam = teamRepository.findById(fixture.getHomeTeamId()).orElse(null);
            Team awayTeam = teamRepository.findById(fixture.getAwayTeamId()).orElse(null);
            dto.setHomeTeamName(homeTeam != null ? homeTeam.getName() : "TBD");
            dto.setAwayTeamName(awayTeam != null ? awayTeam.getName() : "TBD");
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * Checks whether all group matches for a given phase/group are completed.
     */
    @Transactional(readOnly = true)
    public boolean areAllGroupMatchesDone(Long tournamentId, int phaseNumber, int groupNumber) {
        long pending = fixtureRepository.countByTournamentIdAndPhaseNumberAndGroupNumberAndRoundAndStatus(
                tournamentId, phaseNumber, groupNumber,
                MatchFixture.MatchRound.GROUP, MatchFixture.MatchStatus.PENDING);
        return pending == 0;
    }

    /**
     * Saves the final tournament statistics and marks tournament status as DONE.
     */
    @Transactional
    public void completeTournament(Long tournamentId, int phaseNumber, int groupNumber, MatchFixture finalMatch) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new IllegalArgumentException("Tournament not found"));

        if (tournament.getStatus() == Tournament.TournamentStatus.DONE) {
            return;
        }

        // 1. Determine winner and runner up
        Long winnerId = getMatchWinner(finalMatch);
        if (winnerId == null) {
            throw new IllegalStateException("Final match must have a clear winner.");
        }
        Long runnerUpId = winnerId.equals(finalMatch.getHomeTeamId()) ? finalMatch.getAwayTeamId() : finalMatch.getHomeTeamId();

        // 2. Determine second runner up (losing semifinalist with more points/better GD/better GF in standings)
        List<MatchFixture> semis = fixtureRepository.findByTournamentIdAndPhaseNumberAndRound(
                tournamentId, phaseNumber, MatchFixture.MatchRound.SEMI);

        if (semis.size() < 2) {
            throw new IllegalStateException("Could not find both semi-final matches.");
        }

        Long semi1Winner = getMatchWinner(semis.get(0));
        Long semi2Winner = getMatchWinner(semis.get(1));

        if (semi1Winner == null || semi2Winner == null) {
            throw new IllegalStateException("Both semi-final matches must have a clear winner.");
        }

        Long semi1Loser = semi1Winner.equals(semis.get(0).getHomeTeamId()) ? semis.get(0).getAwayTeamId() : semis.get(0).getHomeTeamId();
        Long semi2Loser = semi2Winner.equals(semis.get(1).getHomeTeamId()) ? semis.get(1).getAwayTeamId() : semis.get(1).getHomeTeamId();

        Standing standing1 = standingRepository.findByTournamentIdAndTeamIdAndPhaseNumberAndGroupNumber(
                tournamentId, semi1Loser, phaseNumber, groupNumber)
                .orElseThrow(() -> new IllegalStateException("Standing not found for team: " + semi1Loser));
        Standing standing2 = standingRepository.findByTournamentIdAndTeamIdAndPhaseNumberAndGroupNumber(
                tournamentId, semi2Loser, phaseNumber, groupNumber)
                .orElseThrow(() -> new IllegalStateException("Standing not found for team: " + semi2Loser));

        Long secondRunnerId;
        if (standing1.getPoints() > standing2.getPoints()) {
            secondRunnerId = semi1Loser;
        } else if (standing2.getPoints() > standing1.getPoints()) {
            secondRunnerId = semi2Loser;
        } else {
            int gd1 = standing1.getGoalDifference();
            int gd2 = standing2.getGoalDifference();
            if (gd1 > gd2) {
                secondRunnerId = semi1Loser;
            } else if (gd2 > gd1) {
                secondRunnerId = semi2Loser;
            } else {
                if (standing1.getGoalsFor() > standing2.getGoalsFor()) {
                    secondRunnerId = semi1Loser;
                } else if (standing2.getGoalsFor() > standing1.getGoalsFor()) {
                    secondRunnerId = semi2Loser;
                } else {
                    secondRunnerId = semi1Loser; // Fallback
                }
            }
        }

        // 3. Determine top scorer and top assister
        List<PlayerStatDto> topScorers = statsService.getTopStats(tournamentId, MatchEvent.EventType.GOAL);
        Long topScorerId = topScorers.isEmpty() ? null : topScorers.get(0).getPlayerId();

        List<PlayerStatDto> topAssisters = statsService.getTopStats(tournamentId, MatchEvent.EventType.ASSIST);
        Long topAssisterId = topAssisters.isEmpty() ? null : topAssisters.get(0).getPlayerId();

        // 4. Save results
        TournamentResult result = new TournamentResult();
        result.setTournamentId(tournamentId);
        result.setWinnerTeamId(winnerId);
        result.setRunnerUpTeamId(runnerUpId);
        result.setSecondRunnerId(secondRunnerId);
        result.setTopScorerId(topScorerId);
        result.setTopAssisterId(topAssisterId);
        tournamentResultRepository.save(result);

        // 5. Update tournament status
        tournament.setStatus(Tournament.TournamentStatus.DONE);
        tournamentRepository.save(tournament);
    }

    /**
     * Retrieves the saved tournament results mapped to a DTO.
     */
    @Transactional(readOnly = true)
    public TournamentResultDto getTournamentResult(Long tournamentId) {
        TournamentResult result = tournamentResultRepository.findByTournamentId(tournamentId)
                .orElseThrow(() -> new IllegalStateException("Tournament results are not generated yet. Ensure the tournament is complete."));

        Team winner = teamRepository.findById(result.getWinnerTeamId()).orElse(null);
        Team runnerUp = teamRepository.findById(result.getRunnerUpTeamId()).orElse(null);
        Team secondRunner = teamRepository.findById(result.getSecondRunnerId()).orElse(null);

        TeamDto winnerDto = winner != null ? new TeamDto(winner) : null;
        TeamDto runnerUpDto = runnerUp != null ? new TeamDto(runnerUp) : null;
        TeamDto secondRunnerDto = secondRunner != null ? new TeamDto(secondRunner) : null;

        List<PlayerStatDto> topScorers = statsService.getTopStats(tournamentId, MatchEvent.EventType.GOAL);
        PlayerStatDto topScorerDto = topScorers.isEmpty() ? null : topScorers.get(0);

        List<PlayerStatDto> topAssisters = statsService.getTopStats(tournamentId, MatchEvent.EventType.ASSIST);
        PlayerStatDto topAssisterDto = topAssisters.isEmpty() ? null : topAssisters.get(0);

        return new TournamentResultDto(winnerDto, runnerUpDto, secondRunnerDto, topScorerDto, topAssisterDto);
    }
}
