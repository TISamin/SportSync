package com.sportsync.tournament;

import com.sportsync.domain.Standing;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StandingsService {

    private final StandingRepository standingRepository;

    public StandingsService(StandingRepository standingRepository) {
        this.standingRepository = standingRepository;
    }

    @Transactional
    public void processMatchResult(Long tournamentId, Long homeTeamId, Long awayTeamId, 
                                   int homeScore, int awayScore, 
                                   int phaseNumber, int groupNumber) {
        
        Standing homeStanding = standingRepository.findByTournamentIdAndTeamIdAndPhaseNumberAndGroupNumber(
                tournamentId, homeTeamId, phaseNumber, groupNumber)
                .orElseThrow(() -> new IllegalArgumentException("Home standing not found"));
                
        Standing awayStanding = standingRepository.findByTournamentIdAndTeamIdAndPhaseNumberAndGroupNumber(
                tournamentId, awayTeamId, phaseNumber, groupNumber)
                .orElseThrow(() -> new IllegalArgumentException("Away standing not found"));

        homeStanding.setPlayed(homeStanding.getPlayed() + 1);
        awayStanding.setPlayed(awayStanding.getPlayed() + 1);

        homeStanding.setGoalsFor(homeStanding.getGoalsFor() + homeScore);
        homeStanding.setGoalsAgainst(homeStanding.getGoalsAgainst() + awayScore);
        
        awayStanding.setGoalsFor(awayStanding.getGoalsFor() + awayScore);
        awayStanding.setGoalsAgainst(awayStanding.getGoalsAgainst() + homeScore);

        if (homeScore > awayScore) {
            homeStanding.setWon(homeStanding.getWon() + 1);
            homeStanding.setPoints(homeStanding.getPoints() + 3);
            awayStanding.setLost(awayStanding.getLost() + 1);
        } else if (awayScore > homeScore) {
            awayStanding.setWon(awayStanding.getWon() + 1);
            awayStanding.setPoints(awayStanding.getPoints() + 3);
            homeStanding.setLost(homeStanding.getLost() + 1);
        } else {
            homeStanding.setDrawn(homeStanding.getDrawn() + 1);
            homeStanding.setPoints(homeStanding.getPoints() + 1);
            awayStanding.setDrawn(awayStanding.getDrawn() + 1);
            awayStanding.setPoints(awayStanding.getPoints() + 1);
        }

        standingRepository.save(homeStanding);
        standingRepository.save(awayStanding);
    }
}
