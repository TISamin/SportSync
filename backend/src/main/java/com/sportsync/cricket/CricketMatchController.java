package com.sportsync.cricket;

import com.sportsync.dto.*;
import com.sportsync.domain.CricketMatchState;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cricket/match")
public class CricketMatchController {

    private final CricketMatchService cricketMatchService;
    private final SimpMessagingTemplate messagingTemplate;

    public CricketMatchController(CricketMatchService cricketMatchService, SimpMessagingTemplate messagingTemplate) {
        this.cricketMatchService = cricketMatchService;
        this.messagingTemplate = messagingTemplate;
    }

    private void broadcastMatchState(Long matchId) {
        try {
            CricketMatchStateDto stateDto = cricketMatchService.getMatchStateDto(matchId);
            messagingTemplate.convertAndSend("/topic/cricket/" + matchId, stateDto);
        } catch (Exception e) {
            // Log or ignore if WebSocket broadcast fails to prevent API crash
            System.err.println("Failed to broadcast cricket match state: " + e.getMessage());
        }
    }

    @PostMapping("/{matchId}/toss")
    public ApiResponse<CricketMatchState> setupToss(@PathVariable Long matchId, @Valid @RequestBody TossRequest request) {
        CricketMatchState state = cricketMatchService.setupToss(matchId, request.getTossWinnerId(), request.getTossDecision());
        broadcastMatchState(matchId);
        return ApiResponse.success(state);
    }

    @PostMapping("/{matchId}/innings/start")
    public ApiResponse<Void> startInnings(@PathVariable Long matchId, @Valid @RequestBody InningsStartRequest request) {
        cricketMatchService.startInnings(matchId, request.getStrikerId(), request.getNonStrikerId(), request.getCurrentBowlerId());
        broadcastMatchState(matchId);
        return ApiResponse.success(null);
    }

    @PostMapping("/{matchId}/ball")
    public ApiResponse<Void> submitBall(@PathVariable Long matchId, @Valid @RequestBody SubmitBallRequest request) {
        cricketMatchService.processBall(matchId, request);
        broadcastMatchState(matchId);
        return ApiResponse.success(null);
    }

    @PostMapping("/{matchId}/swap")
    public ApiResponse<Void> swapStriker(@PathVariable Long matchId) {
        cricketMatchService.swapStriker(matchId);
        broadcastMatchState(matchId);
        return ApiResponse.success(null);
    }

    @PostMapping("/{matchId}/next-batsman")
    public ApiResponse<Void> setNextBatsman(@PathVariable Long matchId, @Valid @RequestBody NextBatsmanRequest request) {
        cricketMatchService.setNextBatsman(matchId, request.getPlayerId());
        broadcastMatchState(matchId);
        return ApiResponse.success(null);
    }

    @PostMapping("/{matchId}/next-bowler")
    public ApiResponse<Void> setNextBowler(@PathVariable Long matchId, @Valid @RequestBody NextBowlerRequest request) {
        cricketMatchService.setNextBowler(matchId, request.getPlayerId());
        broadcastMatchState(matchId);
        return ApiResponse.success(null);
    }

    @PostMapping("/{matchId}/innings/end")
    public ApiResponse<Void> endInnings(@PathVariable Long matchId) {
        // Innings is automatically ended in processBall, but we expose a success endpoint for UI conformity
        broadcastMatchState(matchId);
        return ApiResponse.success(null);
    }

    @GetMapping("/{matchId}/state")
    public ApiResponse<CricketMatchStateDto> getMatchState(@PathVariable Long matchId) {
        CricketMatchStateDto dto = cricketMatchService.getMatchStateDto(matchId);
        return ApiResponse.success(dto);
    }

    @GetMapping("/{matchId}/scorecard")
    public ApiResponse<CricketScorecardDto> getScorecard(@PathVariable Long matchId) {
        CricketScorecardDto dto = cricketMatchService.getScorecardDto(matchId);
        return ApiResponse.success(dto);
    }
}
