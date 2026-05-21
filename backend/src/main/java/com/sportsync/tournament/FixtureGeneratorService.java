package com.sportsync.tournament;

import com.sportsync.domain.MatchFixture;
import com.sportsync.domain.Team;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class FixtureGeneratorService {

    public List<MatchFixture> generateRoundRobinFixtures(Long tournamentId, List<Team> teams, int phaseNumber, int groupNumber) {
        if (teams.size() % 2 != 0) {
            throw new IllegalArgumentException("Number of teams must be even for standard round-robin generation.");
        }

        int numTeams = teams.size();
        int numRounds = numTeams - 1;
        int matchesPerRound = numTeams / 2;
        
        List<MatchFixture> allFixtures = new ArrayList<>();
        
        // Array of team indices to rotate
        int[] teamIndices = new int[numTeams];
        for (int i = 0; i < numTeams; i++) {
            teamIndices[i] = i;
        }

        for (int round = 0; round < numRounds; round++) {
            for (int match = 0; match < matchesPerRound; match++) {
                int homeIndex = teamIndices[match];
                int awayIndex = teamIndices[numTeams - 1 - match];
                
                // Alternate home/away for the fixed team (index 0) to balance home advantage
                Team homeTeam, awayTeam;
                if (match == 0 && round % 2 == 1) {
                    homeTeam = teams.get(awayIndex);
                    awayTeam = teams.get(homeIndex);
                } else {
                    homeTeam = teams.get(homeIndex);
                    awayTeam = teams.get(awayIndex);
                }
                
                MatchFixture fixture = new MatchFixture(
                    tournamentId, 
                    homeTeam.getId(), 
                    awayTeam.getId(), 
                    phaseNumber, 
                    groupNumber, 
                    MatchFixture.MatchRound.GROUP
                );
                
                allFixtures.add(fixture);
            }
            
            // Rotate array (excluding index 0)
            int lastElement = teamIndices[numTeams - 1];
            for (int i = numTeams - 1; i > 1; i--) {
                teamIndices[i] = teamIndices[i - 1];
            }
            teamIndices[1] = lastElement;
        }

        return allFixtures;
    }
}
