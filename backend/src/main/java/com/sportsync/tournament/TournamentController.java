package com.sportsync.tournament;

import com.sportsync.dto.ApiResponse;
import com.sportsync.dto.CreateTournamentRequest;
import com.sportsync.dto.MatchFixtureDto;
import com.sportsync.dto.MatchResultRequest;
import com.sportsync.dto.TournamentDto;
import com.sportsync.dto.TournamentResultDto;
import com.sportsync.domain.Standing;
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
                                             @Valid @RequestBody MatchResultRequest request) {
        tournamentService.saveMatchResult(id, matchId, request);
        return ApiResponse.success(null);
    }

    @GetMapping("/{id}/standings")
    public ApiResponse<List<Standing>> getTournamentStandings(@PathVariable Long id) {
        // Default to phase 1, group 1 for single phase
        List<Standing> standings = standingRepository
                .findByTournamentIdAndPhaseNumberAndGroupNumberOrderByPointsDescGoalDifferenceDescGoalsForDesc(id, 1, 1);
        return ApiResponse.success(standings);
    }

    @PostMapping("/{id}/generate-knockout")
    public ApiResponse<List<MatchFixtureDto>> generateKnockout(@PathVariable Long id) {
        tournamentService.generateKnockoutFixtures(id, 1, 1);
        List<MatchFixtureDto> knockoutFixtures = tournamentService.getKnockoutFixtures(id);
        return ApiResponse.success(knockoutFixtures);
    }

    @GetMapping("/{id}/knockout")
    public ApiResponse<List<MatchFixtureDto>> getKnockoutFixtures(@PathVariable Long id) {
        List<MatchFixtureDto> fixtures = tournamentService.getKnockoutFixtures(id);
        return ApiResponse.success(fixtures);
    }

    @GetMapping("/{id}/result")
    public ApiResponse<TournamentResultDto> getTournamentResult(@PathVariable Long id) {
        TournamentResultDto result = tournamentService.getTournamentResult(id);
        return ApiResponse.success(result);
    }
}
