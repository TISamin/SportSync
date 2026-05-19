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

    public TournamentController(TournamentService tournamentService) {
        this.tournamentService = tournamentService;
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
}
