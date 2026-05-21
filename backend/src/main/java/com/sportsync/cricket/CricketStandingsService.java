package com.sportsync.cricket;

import com.sportsync.domain.Standing;
import com.sportsync.domain.MatchFixture;
import com.sportsync.domain.Innings;
import com.sportsync.tournament.StandingRepository;
import com.sportsync.tournament.MatchFixtureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CricketStandingsService {

    private final StandingRepository standingRepository;
    private final MatchFixtureRepository matchFixtureRepository;
    private final InningsRepository inningsRepository;

    public CricketStandingsService(StandingRepository standingRepository,
                                   MatchFixtureRepository matchFixtureRepository,
                                   InningsRepository inningsRepository) {
        this.standingRepository = standingRepository;
        this.matchFixtureRepository = matchFixtureRepository;
        this.inningsRepository = inningsRepository;
    }

    private static double oversToDecimal(double overs) {
        int completedOvers = (int) overs;
        int remainingBalls = (int) Math.round((overs - completedOvers) * 10);
        return completedOvers + (remainingBalls / 6.0);
    }

    @Transactional
    public void updateCricketStandings(MatchFixture lastCompletedMatch) {
        Long tournamentId = lastCompletedMatch.getTournamentId();
        Integer phaseNumber = lastCompletedMatch.getPhaseNumber();
        Integer groupNumber = lastCompletedMatch.getGroupNumber();

        // 1. Get all standings in this group/phase
        List<Standing> standings = standingRepository.findByTournamentIdAndPhaseNumberAndGroupNumberOrderByPointsDescGoalDifferenceDescGoalsForDesc(
                tournamentId, phaseNumber, groupNumber);

        if (standings.isEmpty()) {
            return;
        }

        // 2. Find all completed cricket matches in this group/phase
        List<MatchFixture> completedMatches = matchFixtureRepository.findAll().stream()
                .filter(m -> m.getTournamentId().equals(tournamentId)
                        && m.getPhaseNumber().equals(phaseNumber)
                        && m.getGroupNumber().equals(groupNumber)
                        && m.getStatus() == MatchFixture.MatchStatus.DONE
                        && "CRICKET".equalsIgnoreCase(m.getSport()))
                .collect(Collectors.toList());

        // 3. Recalculate each team's standing
        for (Standing standing : standings) {
            Long teamId = standing.getTeamId();

            int played = 0;
            int won = 0;
            int lost = 0;
            int tied = 0;
            int noResult = 0;
            int points = 0;

            int totalRunsScored = 0;
            double totalOversFaced = 0.0;
            int totalRunsConceded = 0;
            double totalOversBowled = 0.0;

            for (MatchFixture match : completedMatches) {
                if (!match.getHomeTeamId().equals(teamId) && !match.getAwayTeamId().equals(teamId)) {
                    continue; // team didn't play in this match
                }

                played++;

                // Who won?
                boolean wonMatch = false;
                boolean tiedMatch = false;
                boolean lostMatch = false;

                if (match.getHomeScore() > match.getAwayScore()) {
                    if (match.getHomeTeamId().equals(teamId)) wonMatch = true;
                    else lostMatch = true;
                } else if (match.getAwayScore() > match.getHomeScore()) {
                    if (match.getAwayTeamId().equals(teamId)) wonMatch = true;
                    else lostMatch = true;
                } else {
                    tiedMatch = true;
                }

                if (wonMatch) {
                    won++;
                    points += 2;
                } else if (tiedMatch) {
                    tied++;
                    points += 1;
                } else {
                    lost++;
                }

                // NRR calculation details (use non-super-over innings)
                List<Innings> inningsList = inningsRepository.findByMatchId(match.getId()).stream()
                        .filter(i -> !i.getIsSuperOver())
                        .collect(Collectors.toList());

                if (inningsList.size() >= 2) {
                    Innings innings1 = inningsList.get(0);
                    Innings innings2 = inningsList.get(1);
                    int maxOvers = match.getOvers();

                    Innings battingInnings = innings1.getBattingTeamId().equals(teamId) ? innings1 : innings2;
                    Innings bowlingInnings = innings1.getBowlingTeamId().equals(teamId) ? innings1 : innings2;

                    // Batting NRR stats
                    totalRunsScored += battingInnings.getTotalRuns();
                    double oversFaced = battingInnings.getTotalWickets() >= 10 ? maxOvers : oversToDecimal(battingInnings.getTotalOversBowled());
                    totalOversFaced += oversFaced;

                    // Bowling NRR stats
                    totalRunsConceded += bowlingInnings.getTotalRuns();
                    double oversBowled = bowlingInnings.getTotalWickets() >= 10 ? maxOvers : oversToDecimal(bowlingInnings.getTotalOversBowled());
                    totalOversBowled += oversBowled;
                }
            }

            // Calculate final NRR
            double nrr = 0.0;
            if (totalOversFaced > 0 && totalOversBowled > 0) {
                double runsScoredRate = totalRunsScored / totalOversFaced;
                double runsConcededRate = totalRunsConceded / totalOversBowled;
                nrr = Math.round((runsScoredRate - runsConcededRate) * 1000.0) / 1000.0; // round to 3 decimals
            }

            standing.setPlayed(played);
            standing.setWon(won);
            standing.setLost(lost);
            standing.setTied(tied);
            standing.setNoResult(noResult);
            standing.setPoints(points);
            standing.setNrr(nrr);

            // Keep goals_for / goals_against mapped for compatibility
            standing.setGoalsFor(totalRunsScored);
            standing.setGoalsAgainst(totalRunsConceded);

            standingRepository.save(standing);
        }
    }
}
