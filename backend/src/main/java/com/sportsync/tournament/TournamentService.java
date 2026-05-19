package com.sportsync.tournament;

import com.sportsync.domain.*;
import com.sportsync.dto.MatchFixtureDto;
import com.sportsync.dto.TournamentDto;
import com.sportsync.team.TeamRepository;
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

    public TournamentService(TournamentRepository tournamentRepository,
                             TournamentTeamRepository tournamentTeamRepository,
                             MatchFixtureRepository fixtureRepository,
                             StandingRepository standingRepository,
                             TeamRepository teamRepository,
                             FixtureGeneratorService fixtureGeneratorService) {
        this.tournamentRepository = tournamentRepository;
        this.tournamentTeamRepository = tournamentTeamRepository;
        this.fixtureRepository = fixtureRepository;
        this.standingRepository = standingRepository;
        this.teamRepository = teamRepository;
        this.fixtureGeneratorService = fixtureGeneratorService;
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
}
