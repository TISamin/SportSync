package com.sportsync.tournament;

import com.sportsync.domain.*;
import com.sportsync.dto.*;
import com.sportsync.team.TeamRepository;
import com.sportsync.team.TeamPlayerRepository;
import com.sportsync.player.PlayerRepository;
import com.sportsync.stats.StatsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
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
    private final TeamPlayerRepository teamPlayerRepository;
    private final PlayerRepository playerRepository;

    public TournamentService(TournamentRepository tournamentRepository,
                             TournamentTeamRepository tournamentTeamRepository,
                             MatchFixtureRepository fixtureRepository,
                             StandingRepository standingRepository,
                             TeamRepository teamRepository,
                             FixtureGeneratorService fixtureGeneratorService,
                             com.sportsync.stats.MatchEventRepository matchEventRepository,
                             StandingsService standingsService,
                             TournamentResultRepository tournamentResultRepository,
                             StatsService statsService,
                             TeamPlayerRepository teamPlayerRepository,
                             PlayerRepository playerRepository) {
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
        this.teamPlayerRepository = teamPlayerRepository;
        this.playerRepository = playerRepository;
    }

    @Transactional(readOnly = true)
    public TournamentDto getTournament(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new IllegalArgumentException("Tournament not found"));
        return new TournamentDto(tournament);
    }

    @Transactional
    public TournamentDto createTournament(String name, String type, List<Long> teamIds, String sport, Integer overs) {
        Tournament.TournamentType tournamentType = Tournament.TournamentType.valueOf(type);
        
        if (tournamentType == Tournament.TournamentType.SINGLE && teamIds.size() != 8) {
            throw new IllegalArgumentException("Single phase tournament requires exactly 8 teams");
        }
        if (tournamentType == Tournament.TournamentType.DOUBLE && teamIds.size() != 64) {
            throw new IllegalArgumentException("Double phase tournament requires exactly 64 teams");
        }

        String effectiveSport = (sport != null && !sport.isBlank()) ? sport : "FOOTBALL";
        Tournament tournament = new Tournament(name, tournamentType, effectiveSport);
        tournament = tournamentRepository.save(tournament);

        List<Team> teams = new ArrayList<>();
        for (Long teamId : teamIds) {
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new IllegalArgumentException("Team not found: " + teamId));
            teams.add(team);
        }

        if (tournamentType == Tournament.TournamentType.SINGLE) {
            for (Team team : teams) {
                TournamentTeam tt = new TournamentTeam(tournament.getId(), team.getId(), 1, 1);
                tournamentTeamRepository.save(tt);
                
                Standing standing = new Standing(tournament.getId(), team.getId(), 1, 1);
                standingRepository.save(standing);
            }
            List<MatchFixture> fixtures = fixtureGeneratorService.generateRoundRobinFixtures(tournament.getId(), teams, 1, 1);
            if ("CRICKET".equalsIgnoreCase(effectiveSport)) {
                for (MatchFixture f : fixtures) {
                    f.setSport("CRICKET");
                    f.setOvers(overs != null ? overs : 20);
                }
            }
            fixtureRepository.saveAll(fixtures);
        } else {
            // DOUBLE phase tournament: 64 teams divided into 8 groups of 8 teams
            for (int groupIdx = 0; groupIdx < 8; groupIdx++) {
                int groupNum = groupIdx + 1;
                List<Team> groupTeams = new ArrayList<>();
                for (int teamIdx = 0; teamIdx < 8; teamIdx++) {
                    Team team = teams.get(groupIdx * 8 + teamIdx);
                    groupTeams.add(team);

                    TournamentTeam tt = new TournamentTeam(tournament.getId(), team.getId(), 1, groupNum);
                    tournamentTeamRepository.save(tt);
                    
                    Standing standing = new Standing(tournament.getId(), team.getId(), 1, groupNum);
                    standingRepository.save(standing);
                }
                List<MatchFixture> groupFixtures = fixtureGeneratorService.generateRoundRobinFixtures(tournament.getId(), groupTeams, 1, groupNum);
                if ("CRICKET".equalsIgnoreCase(effectiveSport)) {
                    for (MatchFixture f : groupFixtures) {
                        f.setSport("CRICKET");
                        f.setOvers(overs != null ? overs : 20);
                    }
                }
                fixtureRepository.saveAll(groupFixtures);
            }
        }

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

        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new IllegalArgumentException("Tournament not found"));

        // Update standings only for group matches
        if (match.getRound() == MatchFixture.MatchRound.GROUP) {
            standingsService.processMatchResult(tournamentId, match.getHomeTeamId(), match.getAwayTeamId(), 
                                                request.getHomeScore(), request.getAwayScore(), 
                                                match.getPhaseNumber(), match.getGroupNumber());

            if (tournament.getType() == Tournament.TournamentType.SINGLE) {
                // After a group match, check if all group matches are done → auto-generate knockout
                long pendingGroupMatches = fixtureRepository.countByTournamentIdAndPhaseNumberAndGroupNumberAndRoundAndStatus(
                        tournamentId, match.getPhaseNumber(), match.getGroupNumber(),
                        MatchFixture.MatchRound.GROUP, MatchFixture.MatchStatus.PENDING);

                if (pendingGroupMatches == 0) {
                    generateKnockoutFixtures(tournamentId, match.getPhaseNumber(), match.getGroupNumber());
                }
            } else {
                // DOUBLE phase tournament
                if (match.getPhaseNumber() == 1) {
                    // Check if all Phase 1 matches are done
                    long pendingPhase1 = fixtureRepository.countByTournamentIdAndPhaseNumberAndRoundAndStatus(
                            tournamentId, 1, MatchFixture.MatchRound.GROUP, MatchFixture.MatchStatus.PENDING);
                    if (pendingPhase1 == 0) {
                        generatePhase2(tournamentId);
                    }
                } else if (match.getPhaseNumber() == 2) {
                    // Check if all Phase 2 group matches are done
                    long pendingPhase2Groups = fixtureRepository.countByTournamentIdAndPhaseNumberAndRoundAndStatus(
                            tournamentId, 2, MatchFixture.MatchRound.GROUP, MatchFixture.MatchStatus.PENDING);
                    if (pendingPhase2Groups == 0) {
                        generatePhase2Knockout(tournamentId);
                    }
                }
            }
        } else {
            // Knockout match completed
            if (tournament.getType() == Tournament.TournamentType.SINGLE) {
                if (match.getRound() == MatchFixture.MatchRound.SEMI) {
                    checkAndGenerateFinal(tournamentId, match.getPhaseNumber(), match.getGroupNumber());
                } else if (match.getRound() == MatchFixture.MatchRound.FINAL) {
                    completeTournament(tournamentId, match.getPhaseNumber(), match.getGroupNumber(), match);
                }
            } else {
                // DOUBLE phase knockout progression
                if (match.getRound() == MatchFixture.MatchRound.ROUND_OF_16 ||
                    match.getRound() == MatchFixture.MatchRound.QUARTER ||
                    match.getRound() == MatchFixture.MatchRound.SEMI) {
                    checkAndGenerateNextKnockoutRound(tournamentId, match.getPhaseNumber(), match.getRound());
                } else if (match.getRound() == MatchFixture.MatchRound.FINAL) {
                    completeTournament(tournamentId, match.getPhaseNumber(), match.getGroupNumber(), match);
                }
            }
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
     * Returns all knockout fixtures (ROUND_OF_16, QUARTER, SEMI, FINAL) for a tournament.
     */
    @Transactional(readOnly = true)
    public List<MatchFixtureDto> getKnockoutFixtures(Long tournamentId) {
        List<MatchFixture> fixtures = fixtureRepository.findByTournamentIdAndRoundIn(
                tournamentId, List.of(
                        MatchFixture.MatchRound.ROUND_OF_16,
                        MatchFixture.MatchRound.QUARTER,
                        MatchFixture.MatchRound.SEMI,
                        MatchFixture.MatchRound.FINAL
                ));

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

        Standing standing1 = standingRepository.findFirstByTournamentIdAndTeamIdAndPhaseNumber(tournamentId, semi1Loser, phaseNumber)
                .orElseThrow(() -> new IllegalStateException("Standing not found for team: " + semi1Loser));
        Standing standing2 = standingRepository.findFirstByTournamentIdAndTeamIdAndPhaseNumber(tournamentId, semi2Loser, phaseNumber)
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

    /**
     * Retrieves all teams in the tournament along with their rosters.
     */
    @Transactional(readOnly = true)
    public List<TeamDto> getTournamentTeams(Long tournamentId) {
        List<TournamentTeam> ttList = tournamentTeamRepository.findByTournamentId(tournamentId);
        // De-duplicate team list (since in double phase, teams can have mappings in phase 1 and phase 2)
        List<Long> teamIds = ttList.stream().map(TournamentTeam::getTeamId).distinct().collect(Collectors.toList());
        List<TeamDto> teamDtos = new ArrayList<>();
        for (Long teamId : teamIds) {
            Team team = teamRepository.findById(teamId).orElse(null);
            if (team != null) {
                List<TeamPlayer> teamPlayers = teamPlayerRepository.findByTeamId(team.getId());
                List<PlayerDto> roster = teamPlayers.stream().map(tp -> {
                    Player p = playerRepository.findById(tp.getPlayerId()).orElse(null);
                    if (p != null) {
                        PlayerDto pDto = new PlayerDto(p);
                        pDto.setSoldPrice(tp.getSoldPrice());
                        return pDto;
                    }
                    return null;
                }).filter(Objects::nonNull).collect(Collectors.toList());

                teamDtos.add(new TeamDto(team, roster));
            }
        }
        return teamDtos;
    }

    /**
     * Distributes top 4 teams from all 8 groups of Phase 1 into 4 groups of Phase 2
     * and generates group round-robin fixtures.
     */
    @Transactional
    public void generatePhase2(Long tournamentId) {
        // Verify all Phase 1 group matches are done
        long pendingPhase1 = fixtureRepository.countByTournamentIdAndPhaseNumberAndRoundAndStatus(
                tournamentId, 1, MatchFixture.MatchRound.GROUP, MatchFixture.MatchStatus.PENDING);

        if (pendingPhase1 > 0) {
            throw new IllegalStateException(
                    "Not all Phase 1 group matches are completed. " + pendingPhase1 + " matches remaining.");
        }

        // Guard against duplicate phase 2 generation
        List<MatchFixture> existingPhase2 = fixtureRepository.findByTournamentIdAndPhaseNumberAndRound(
                tournamentId, 2, MatchFixture.MatchRound.GROUP);
        if (!existingPhase2.isEmpty()) {
            throw new IllegalStateException("Phase 2 fixtures have already been generated.");
        }

        // Fetch top 4 from all 8 groups of Phase 1
        List<List<Standing>> standingsByGroup = new ArrayList<>();
        for (int groupIdx = 0; groupIdx < 8; groupIdx++) {
            int groupNum = groupIdx + 1;
            List<Standing> standings = standingRepository
                    .findByTournamentIdAndPhaseNumberAndGroupNumberOrderByPointsDescGoalDifferenceDescGoalsForDesc(
                            tournamentId, 1, groupNum);
            if (standings.size() < 4) {
                throw new IllegalStateException("Group " + groupNum + " does not have enough teams in standings.");
            }
            standingsByGroup.add(standings);
        }

        // Distribute 32 teams into 4 groups of Phase 2
        // Group 1 (Phase 2): A1, B2, C3, D4, E1, F2, G3, H4 (standingsByGroup indices: 0..7)
        // Group 2 (Phase 2): B1, C2, D3, E4, F1, G2, H3, A4
        // Group 3 (Phase 2): C1, D2, E3, F4, G1, H2, A3, B4
        // Group 4 (Phase 2): D1, E2, F3, G4, H1, A2, B3, C4
        List<List<Long>> phase2GroupTeamIds = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            phase2GroupTeamIds.add(new ArrayList<>());
        }
        
        // Group 1
        phase2GroupTeamIds.get(0).add(standingsByGroup.get(0).get(0).getTeamId()); // A1
        phase2GroupTeamIds.get(0).add(standingsByGroup.get(1).get(1).getTeamId()); // B2
        phase2GroupTeamIds.get(0).add(standingsByGroup.get(2).get(2).getTeamId()); // C3
        phase2GroupTeamIds.get(0).add(standingsByGroup.get(3).get(3).getTeamId()); // D4
        phase2GroupTeamIds.get(0).add(standingsByGroup.get(4).get(0).getTeamId()); // E1
        phase2GroupTeamIds.get(0).add(standingsByGroup.get(5).get(1).getTeamId()); // F2
        phase2GroupTeamIds.get(0).add(standingsByGroup.get(6).get(2).getTeamId()); // G3
        phase2GroupTeamIds.get(0).add(standingsByGroup.get(7).get(3).getTeamId()); // H4

        // Group 2
        phase2GroupTeamIds.get(1).add(standingsByGroup.get(1).get(0).getTeamId()); // B1
        phase2GroupTeamIds.get(1).add(standingsByGroup.get(2).get(1).getTeamId()); // C2
        phase2GroupTeamIds.get(1).add(standingsByGroup.get(3).get(2).getTeamId()); // D3
        phase2GroupTeamIds.get(1).add(standingsByGroup.get(4).get(3).getTeamId()); // E4
        phase2GroupTeamIds.get(1).add(standingsByGroup.get(5).get(0).getTeamId()); // F1
        phase2GroupTeamIds.get(1).add(standingsByGroup.get(6).get(1).getTeamId()); // G2
        phase2GroupTeamIds.get(1).add(standingsByGroup.get(7).get(2).getTeamId()); // H3
        phase2GroupTeamIds.get(1).add(standingsByGroup.get(0).get(3).getTeamId()); // A4

        // Group 3
        phase2GroupTeamIds.get(2).add(standingsByGroup.get(2).get(0).getTeamId()); // C1
        phase2GroupTeamIds.get(2).add(standingsByGroup.get(3).get(1).getTeamId()); // D2
        phase2GroupTeamIds.get(2).add(standingsByGroup.get(4).get(2).getTeamId()); // E3
        phase2GroupTeamIds.get(2).add(standingsByGroup.get(5).get(3).getTeamId()); // F4
        phase2GroupTeamIds.get(2).add(standingsByGroup.get(6).get(0).getTeamId()); // G1
        phase2GroupTeamIds.get(2).add(standingsByGroup.get(7).get(1).getTeamId()); // H2
        phase2GroupTeamIds.get(2).add(standingsByGroup.get(0).get(2).getTeamId()); // A3
        phase2GroupTeamIds.get(2).add(standingsByGroup.get(1).get(3).getTeamId()); // B4

        // Group 4
        phase2GroupTeamIds.get(3).add(standingsByGroup.get(3).get(0).getTeamId()); // D1
        phase2GroupTeamIds.get(3).add(standingsByGroup.get(4).get(1).getTeamId()); // E2
        phase2GroupTeamIds.get(3).add(standingsByGroup.get(5).get(2).getTeamId()); // F3
        phase2GroupTeamIds.get(3).add(standingsByGroup.get(6).get(3).getTeamId()); // G4
        phase2GroupTeamIds.get(3).add(standingsByGroup.get(7).get(0).getTeamId()); // H1
        phase2GroupTeamIds.get(3).add(standingsByGroup.get(0).get(1).getTeamId()); // A2
        phase2GroupTeamIds.get(3).add(standingsByGroup.get(1).get(2).getTeamId()); // B3
        phase2GroupTeamIds.get(3).add(standingsByGroup.get(2).get(3).getTeamId()); // C4

        // For each of the 4 groups, create TournamentTeam, Standing and generate fixtures
        for (int groupIdx = 0; groupIdx < 4; groupIdx++) {
            int groupNum = groupIdx + 1;
            List<Team> groupTeams = new ArrayList<>();
            for (Long teamId : phase2GroupTeamIds.get(groupIdx)) {
                Team team = teamRepository.findById(teamId).orElseThrow();
                groupTeams.add(team);

                TournamentTeam tt = new TournamentTeam(tournamentId, teamId, 2, groupNum);
                tournamentTeamRepository.save(tt);

                Standing standing = new Standing(tournamentId, teamId, 2, groupNum);
                standingRepository.save(standing);
            }
            List<MatchFixture> groupFixtures = fixtureGeneratorService.generateRoundRobinFixtures(tournamentId, groupTeams, 2, groupNum);
            fixtureRepository.saveAll(groupFixtures);
        }
    }

    /**
     * Fetches Phase 2 standings and pairs the top 4 teams from the 4 groups into 
     * a 16-team knockout stage (Round of 16).
     */
    @Transactional
    public void generatePhase2Knockout(Long tournamentId) {
        // Verify all Phase 2 group matches are done
        long pendingPhase2Groups = fixtureRepository.countByTournamentIdAndPhaseNumberAndRoundAndStatus(
                tournamentId, 2, MatchFixture.MatchRound.GROUP, MatchFixture.MatchStatus.PENDING);

        if (pendingPhase2Groups > 0) {
            throw new IllegalStateException(
                    "Not all Phase 2 group matches are completed. " + pendingPhase2Groups + " matches remaining.");
        }

        // Guard against duplicate phase 2 knockout generation
        List<MatchFixture> existingKnockout = fixtureRepository.findByTournamentIdAndPhaseNumberAndRound(
                tournamentId, 2, MatchFixture.MatchRound.ROUND_OF_16);
        if (!existingKnockout.isEmpty()) {
            throw new IllegalStateException("Phase 2 knockout stage has already been generated.");
        }

        // Fetch standings of the 4 groups in Phase 2
        List<List<Standing>> standingsByGroup = new ArrayList<>();
        for (int groupIdx = 0; groupIdx < 4; groupIdx++) {
            int groupNum = groupIdx + 1;
            List<Standing> standings = standingRepository
                    .findByTournamentIdAndPhaseNumberAndGroupNumberOrderByPointsDescGoalDifferenceDescGoalsForDesc(
                            tournamentId, 2, groupNum);
            if (standings.size() < 4) {
                throw new IllegalStateException("Phase 2 Group " + groupNum + " does not have enough teams.");
            }
            standingsByGroup.add(standings);
        }

        // Round of 16 Matchups:
        // Match 1: G1 Winner (0) vs G4 4th (3)
        // Match 2: G2 Runner-up (1) vs G3 3rd (2)
        // Match 3: G3 Winner (0) vs G2 4th (3)
        // Match 4: G4 Runner-up (1) vs G1 3rd (2)
        // Match 5: G2 Winner (0) vs G3 4th (3)
        // Match 6: G1 Runner-up (1) vs G4 3rd (2)
        // Match 7: G4 Winner (0) vs G1 4th (3)
        // Match 8: G3 Runner-up (1) vs G2 3rd (2)
        
        createAndSaveKnockoutMatch(tournamentId, standingsByGroup.get(0).get(0).getTeamId(), standingsByGroup.get(3).get(3).getTeamId(), 1); // R16-1
        createAndSaveKnockoutMatch(tournamentId, standingsByGroup.get(1).get(1).getTeamId(), standingsByGroup.get(2).get(2).getTeamId(), 2); // R16-2
        createAndSaveKnockoutMatch(tournamentId, standingsByGroup.get(2).get(0).getTeamId(), standingsByGroup.get(1).get(3).getTeamId(), 3); // R16-3
        createAndSaveKnockoutMatch(tournamentId, standingsByGroup.get(3).get(1).getTeamId(), standingsByGroup.get(0).get(2).getTeamId(), 4); // R16-4
        createAndSaveKnockoutMatch(tournamentId, standingsByGroup.get(1).get(0).getTeamId(), standingsByGroup.get(2).get(3).getTeamId(), 5); // R16-5
        createAndSaveKnockoutMatch(tournamentId, standingsByGroup.get(0).get(1).getTeamId(), standingsByGroup.get(3).get(2).getTeamId(), 6); // R16-6
        createAndSaveKnockoutMatch(tournamentId, standingsByGroup.get(3).get(0).getTeamId(), standingsByGroup.get(0).get(3).getTeamId(), 7); // R16-7
        createAndSaveKnockoutMatch(tournamentId, standingsByGroup.get(2).get(1).getTeamId(), standingsByGroup.get(1).get(2).getTeamId(), 8); // R16-8
    }

    private void createAndSaveKnockoutMatch(Long tournamentId, Long homeTeamId, Long awayTeamId, int matchNumber) {
        MatchFixture match = new MatchFixture(tournamentId, homeTeamId, awayTeamId,
                2, matchNumber, MatchFixture.MatchRound.ROUND_OF_16);
        fixtureRepository.save(match);
    }

    /**
     * Checks progress within a knockout round. If all matches of a round are completed,
     * it automatically pairs up the winners to generate the next knockout round.
     */
    private void checkAndGenerateNextKnockoutRound(Long tournamentId, int phaseNumber, MatchFixture.MatchRound completedRound) {
        if (completedRound == MatchFixture.MatchRound.ROUND_OF_16) {
            List<MatchFixture> r16Matches = fixtureRepository.findByTournamentIdAndPhaseNumberAndRound(
                    tournamentId, phaseNumber, MatchFixture.MatchRound.ROUND_OF_16);
            
            boolean allDone = r16Matches.stream().allMatch(m -> m.getStatus() == MatchFixture.MatchStatus.DONE);
            if (!allDone) return;

            // Guard against duplicate Quarter generation
            List<MatchFixture> existingQuarters = fixtureRepository.findByTournamentIdAndPhaseNumberAndRound(
                    tournamentId, phaseNumber, MatchFixture.MatchRound.QUARTER);
            if (!existingQuarters.isEmpty()) return;

            // Sort R16 matches by groupNumber (match number) to ensure stable matchups
            r16Matches.sort(Comparator.comparingInt(MatchFixture::getGroupNumber));

            // Quarters pairing:
            // QF 1: R16-1 Winner vs R16-2 Winner
            // QF 2: R16-3 Winner vs R16-4 Winner
            // QF 3: R16-5 Winner vs R16-6 Winner
            // QF 4: R16-7 Winner vs R16-8 Winner
            for (int i = 0; i < 4; i++) {
                Long w1 = getMatchWinner(r16Matches.get(i * 2));
                Long w2 = getMatchWinner(r16Matches.get(i * 2 + 1));
                if (w1 == null || w2 == null) {
                    throw new IllegalStateException("Round of 16 matches must have a clear winner.");
                }
                MatchFixture qf = new MatchFixture(tournamentId, w1, w2, phaseNumber, i + 1, MatchFixture.MatchRound.QUARTER);
                fixtureRepository.save(qf);
            }
        } else if (completedRound == MatchFixture.MatchRound.QUARTER) {
            List<MatchFixture> quarters = fixtureRepository.findByTournamentIdAndPhaseNumberAndRound(
                    tournamentId, phaseNumber, MatchFixture.MatchRound.QUARTER);
            
            boolean allDone = quarters.stream().allMatch(m -> m.getStatus() == MatchFixture.MatchStatus.DONE);
            if (!allDone) return;

            // Guard against duplicate Semi generation
            List<MatchFixture> existingSemis = fixtureRepository.findByTournamentIdAndPhaseNumberAndRound(
                    tournamentId, phaseNumber, MatchFixture.MatchRound.SEMI);
            if (!existingSemis.isEmpty()) return;

            quarters.sort(Comparator.comparingInt(MatchFixture::getGroupNumber));

            // Semis pairing:
            // SF 1: QF-1 Winner vs QF-2 Winner
            // SF 2: QF-3 Winner vs QF-4 Winner
            for (int i = 0; i < 2; i++) {
                Long w1 = getMatchWinner(quarters.get(i * 2));
                Long w2 = getMatchWinner(quarters.get(i * 2 + 1));
                if (w1 == null || w2 == null) {
                    throw new IllegalStateException("Quarter-Final matches must have a clear winner.");
                }
                MatchFixture sf = new MatchFixture(tournamentId, w1, w2, phaseNumber, i + 1, MatchFixture.MatchRound.SEMI);
                fixtureRepository.save(sf);
            }
        } else if (completedRound == MatchFixture.MatchRound.SEMI) {
            List<MatchFixture> semis = fixtureRepository.findByTournamentIdAndPhaseNumberAndRound(
                    tournamentId, phaseNumber, MatchFixture.MatchRound.SEMI);
            
            boolean allDone = semis.stream().allMatch(m -> m.getStatus() == MatchFixture.MatchStatus.DONE);
            if (!allDone) return;

            // Guard against duplicate Final generation
            List<MatchFixture> existingFinal = fixtureRepository.findByTournamentIdAndPhaseNumberAndRound(
                    tournamentId, phaseNumber, MatchFixture.MatchRound.FINAL);
            if (!existingFinal.isEmpty()) return;

            semis.sort(Comparator.comparingInt(MatchFixture::getGroupNumber));

            // Final pairing:
            // Winner SF-1 vs Winner SF-2
            Long w1 = getMatchWinner(semis.get(0));
            Long w2 = getMatchWinner(semis.get(1));
            if (w1 == null || w2 == null) {
                throw new IllegalStateException("Semi-Final matches must have a clear winner.");
            }
            MatchFixture fMatch = new MatchFixture(tournamentId, w1, w2, phaseNumber, 1, MatchFixture.MatchRound.FINAL);
            fixtureRepository.save(fMatch);
        }
    }
}
