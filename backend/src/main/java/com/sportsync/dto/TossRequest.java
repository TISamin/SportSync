package com.sportsync.dto;

import com.sportsync.domain.CricketMatchState.TossDecision;
import jakarta.validation.constraints.NotNull;

public class TossRequest {

    @NotNull(message = "Toss winner ID is required")
    private Long tossWinnerId;

    @NotNull(message = "Toss decision is required")
    private TossDecision tossDecision;

    public TossRequest() {}

    public Long getTossWinnerId() { return tossWinnerId; }
    public void setTossWinnerId(Long tossWinnerId) { this.tossWinnerId = tossWinnerId; }

    public TossDecision getTossDecision() { return tossDecision; }
    public void setTossDecision(TossDecision tossDecision) { this.tossDecision = tossDecision; }
}
