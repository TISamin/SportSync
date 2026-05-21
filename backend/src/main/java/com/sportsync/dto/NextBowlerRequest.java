package com.sportsync.dto;

import jakarta.validation.constraints.NotNull;

public class NextBowlerRequest {

    @NotNull(message = "Player ID is required")
    private Long playerId;

    public NextBowlerRequest() {}

    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long playerId) { this.playerId = playerId; }
}
