package com.sportsync.dto;

import com.sportsync.domain.BallEvent.BallOutcome;
import com.sportsync.domain.BallEvent.DismissalType;
import jakarta.validation.constraints.NotNull;

public class SubmitBallRequest {

    @NotNull(message = "Outcome is required")
    private BallOutcome outcome;

    private Integer extraRuns = 0;

    private DismissalType dismissalType;

    private Long dismissedPlayerId;

    public SubmitBallRequest() {}

    public BallOutcome getOutcome() { return outcome; }
    public void setOutcome(BallOutcome outcome) { this.outcome = outcome; }

    public Integer getExtraRuns() { return extraRuns; }
    public void setExtraRuns(Integer extraRuns) { this.extraRuns = extraRuns; }

    public DismissalType getDismissalType() { return dismissalType; }
    public void setDismissalType(DismissalType dismissalType) { this.dismissalType = dismissalType; }

    public Long getDismissedPlayerId() { return dismissedPlayerId; }
    public void setDismissedPlayerId(Long dismissedPlayerId) { this.dismissedPlayerId = dismissedPlayerId; }
}
