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
    private final com.sportsync.stats.MatchEventRepository matchEventRepository;
    private final StandingsService standingsService;

    public TournamentService(TournamentRepository tournamentRepository,
                             TournamentTeamRepository tournamentTeamRepository,
                             MatchFixtureRepository fixtureRepository,
                             StandingRepository standingRepository,
                             TeamRepository teamRepository,
                             FixtureGeneratorService fixtureGeneratorService,
                             com.sportsync.stats.MatchEventRepository matchEventRepository,
                             StandingsService standingsService) {
        this.tournamentRepository = tournamentRepository;
        this.tournamentTeamRepository = tournamentTeamRepository;
        this.fixtureRepository = fixtureRepository;
        this.standingRepository = standingRepository;
        this.teamRepository = teamRepository;
        this.fixtureGeneratorService = fixtureGeneratorService;
        this.matchEventRepository = matchEventRepository;
        this.standingsService = standingsService;
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
    public void saveMatchResult(Long tournamentId, Long matchId, com.sportsync.dto.MatchResultRequest request) {
        MatchFixture match = fixtureRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found"));
                
        if (!match.getTournamentId().equals(tournamentId)) {
            throw new IllegalArgumentException("Match does not belong to this tournament");
        }
        
        if (match.getStatus() == MatchFixture.MatchStatus.DONE) {
            throw new IllegalArgumentException("Match result already entered");
        }

        match.setHomeScore(request.getHomeScore());
        match.setAwayScore(request.getAwayScore());
        match.setStatus(MatchFixture.MatchStatus.DONE);
        match.setPlayedAt(java.time.Instant.now());
        fixtureRepository.save(match);

        if (request.getEvents() != null) {
            for (com.sportsync.dto.MatchEventRequest eventReq : request.getEvents()) {
                MatchEvent event = new MatchEvent(matchId, eventReq.getPlayerId(), eventReq.getTeamId(), 
                                                  eventReq.getEventType(), eventReq.getMinute());
                matchEventRepository.save(event);
            }
        }

        // Update standings if it's a group match
        if (match.getRound() == MatchFixture.MatchRound.GROUP) {
            standingsService.processMatchResult(tournamentId, match.getHomeTeamId(), match.getAwayTeamId(), 
                                                request.getHomeScore(), request.getAwayScore(), 
                                                match.getPhaseNumber(), match.getGroupNumber());
        }
    }
}
