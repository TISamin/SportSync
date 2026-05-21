package com.sportsync.dto;

import jakarta.validation.constraints.NotNull;

public class NextBatsmanRequest {

    @NotNull(message = "Player ID is required")
    private Long playerId;

    public NextBatsmanRequest() {}

    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long playerId) { this.playerId = playerId; }
}
