package com.sportsync.dto;

import jakarta.validation.constraints.NotNull;

public class InningsStartRequest {

    @NotNull(message = "Striker ID is required")
    private Long strikerId;

    @NotNull(message = "Non-striker ID is required")
    private Long nonStrikerId;

    @NotNull(message = "Current bowler ID is required")
    private Long currentBowlerId;

    public InningsStartRequest() {}

    public Long getStrikerId() { return strikerId; }
    public void setStrikerId(Long strikerId) { this.strikerId = strikerId; }

    public Long getNonStrikerId() { return nonStrikerId; }
    public void setNonStrikerId(Long nonStrikerId) { this.nonStrikerId = nonStrikerId; }

    public Long getCurrentBowlerId() { return currentBowlerId; }
    public void setCurrentBowlerId(Long currentBowlerId) { this.currentBowlerId = currentBowlerId; }
}
