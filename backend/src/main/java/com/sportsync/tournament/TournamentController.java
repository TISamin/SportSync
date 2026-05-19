package com.sportsync.tournament;

import com.sportsync.dto.ApiResponse;
import com.sportsync.dto.CreateTournamentRequest;
import com.sportsync.dto.MatchFixtureDto;
import com.sportsync.dto.TournamentDto;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tournament")
public class TournamentController {

    private final TournamentService tournamentService;
    private final StandingRepository standingRepository;

    public TournamentController(TournamentService tournamentService, StandingRepository standingRepository) {
        this.tournamentService = tournamentService;
        this.standingRepository = standingRepository;
    }

    @PostMapping
    public ApiResponse<TournamentDto> createTournament(@Valid @RequestBody CreateTournamentRequest request) {
        TournamentDto tournament = tournamentService.createTournament(
                request.getName(), 
                request.getType(), 
                request.getTeamIds()
        );
        return ApiResponse.success(tournament);
    }

    @GetMapping("/{id}/fixtures")
    public ApiResponse<List<MatchFixtureDto>> getTournamentFixtures(@PathVariable Long id) {
        List<MatchFixtureDto> fixtures = tournamentService.getTournamentFixtures(id);
        return ApiResponse.success(fixtures);
    }

    @PostMapping("/{id}/match/{matchId}/result")
    public ApiResponse<Void> saveMatchResult(@PathVariable Long id, @PathVariable Long matchId, 
                                             @Valid @RequestBody com.sportsync.dto.MatchResultRequest request) {
        tournamentService.saveMatchResult(id, matchId, request);
        return ApiResponse.success(null);
    }

    @GetMapping("/{id}/standings")
    public ApiResponse<List<com.sportsync.domain.Standing>> getTournamentStandings(@PathVariable Long id) {
        // Default to phase 1, group 1 for single phase
        List<com.sportsync.domain.Standing> standings = standingRepository
                .findByTournamentIdAndPhaseNumberAndGroupNumberOrderByPointsDescGoalDifferenceDescGoalsForDesc(id, 1, 1);
        return ApiResponse.success(standings);
    }
}
