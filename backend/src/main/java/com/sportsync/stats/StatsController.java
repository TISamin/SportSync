package com.sportsync.stats;

import com.sportsync.domain.MatchEvent;
import com.sportsync.dto.ApiResponse;
import com.sportsync.dto.PlayerStatDto;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tournament/{id}/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/top-scorers")
    public ApiResponse<List<PlayerStatDto>> getTopScorers(@PathVariable Long id) {
        return ApiResponse.success(statsService.getTopStats(id, MatchEvent.EventType.GOAL));
    }

    @GetMapping("/top-assisters")
    public ApiResponse<List<PlayerStatDto>> getTopAssisters(@PathVariable Long id) {
        return ApiResponse.success(statsService.getTopStats(id, MatchEvent.EventType.ASSIST));
    }

    @GetMapping("/cricket/top-scorers")
    public ApiResponse<List<com.sportsync.dto.CricketPlayerStatDto>> getTopCricketScorers(@PathVariable Long id) {
        return ApiResponse.success(statsService.getTopCricketScorers(id));
    }

    @GetMapping("/cricket/top-wickets")
    public ApiResponse<List<com.sportsync.dto.CricketPlayerStatDto>> getTopCricketWickets(@PathVariable Long id) {
        return ApiResponse.success(statsService.getTopCricketWicketTakers(id));
    }
}
