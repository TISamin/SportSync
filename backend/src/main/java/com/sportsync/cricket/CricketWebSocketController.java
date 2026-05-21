package com.sportsync.cricket;

import com.sportsync.dto.CricketMatchStateDto;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class CricketWebSocketController {

    private final CricketMatchService cricketMatchService;
    private final SimpMessagingTemplate messagingTemplate;

    public CricketWebSocketController(CricketMatchService cricketMatchService, SimpMessagingTemplate messagingTemplate) {
        this.cricketMatchService = cricketMatchService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/cricket/state")
    public void getCricketState(Long matchId) {
        try {
            CricketMatchStateDto stateDto = cricketMatchService.getMatchStateDto(matchId);
            messagingTemplate.convertAndSend("/topic/cricket/" + matchId, stateDto);
        } catch (Exception e) {
            System.err.println("WS error broadcasting state for match " + matchId + ": " + e.getMessage());
        }
    }
}
