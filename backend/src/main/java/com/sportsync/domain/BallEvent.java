package com.sportsync.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "ball_event")
public class BallEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "innings_id", nullable = false)
    private Long inningsId;

    @Column(name = "over_number", nullable = false)
    private Integer overNumber;

    @Column(name = "ball_number", nullable = false)
    private Integer ballNumber;

    @Column(name = "bowler_id", nullable = false)
    private Long bowlerId;

    @Column(name = "striker_id", nullable = false)
    private Long strikerId;

    @Column(name = "non_striker_id", nullable = false)
    private Long nonStrikerId;

    @Column(nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private BallOutcome outcome;

    @Column(name = "extra_runs", nullable = false)
    private Integer extraRuns = 0;

    @Column(name = "is_legal_delivery", nullable = false)
    private Boolean isLegalDelivery = true;

    @Column(name = "free_hit_next", nullable = false)
    private Boolean freeHitNext = false;

    @Column(name = "dismissal_type", length = 30)
    @Enumerated(EnumType.STRING)
    private DismissalType dismissalType;

    @Column(name = "dismissed_player_id")
    private Long dismissedPlayerId;

    public BallEvent() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getInningsId() { return inningsId; }
    public void setInningsId(Long inningsId) { this.inningsId = inningsId; }

    public Integer getOverNumber() { return overNumber; }
    public void setOverNumber(Integer overNumber) { this.overNumber = overNumber; }

    public Integer getBallNumber() { return ballNumber; }
    public void setBallNumber(Integer ballNumber) { this.ballNumber = ballNumber; }

    public Long getBowlerId() { return bowlerId; }
    public void setBowlerId(Long bowlerId) { this.bowlerId = bowlerId; }

    public Long getStrikerId() { return strikerId; }
    public void setStrikerId(Long strikerId) { this.strikerId = strikerId; }

    public Long getNonStrikerId() { return nonStrikerId; }
    public void setNonStrikerId(Long nonStrikerId) { this.nonStrikerId = nonStrikerId; }

    public BallOutcome getOutcome() { return outcome; }
    public void setOutcome(BallOutcome outcome) { this.outcome = outcome; }

    public Integer getExtraRuns() { return extraRuns; }
    public void setExtraRuns(Integer extraRuns) { this.extraRuns = extraRuns; }

    public Boolean getIsLegalDelivery() { return isLegalDelivery; }
    public void setIsLegalDelivery(Boolean isLegalDelivery) { this.isLegalDelivery = isLegalDelivery; }

    public Boolean getFreeHitNext() { return freeHitNext; }
    public void setFreeHitNext(Boolean freeHitNext) { this.freeHitNext = freeHitNext; }

    public DismissalType getDismissalType() { return dismissalType; }
    public void setDismissalType(DismissalType dismissalType) { this.dismissalType = dismissalType; }

    public Long getDismissedPlayerId() { return dismissedPlayerId; }
    public void setDismissedPlayerId(Long dismissedPlayerId) { this.dismissedPlayerId = dismissedPlayerId; }

    public enum BallOutcome {
        DOT, ONE, TWO, THREE, FOUR, SIX, WICKET, WIDE, NOBALL_FREE_HIT, NOBALL_NO_FREE_HIT, RUNOUT, DEADBALL
    }

    public enum DismissalType {
        BOWLED, CAUGHT, LBW, STUMPED, HIT_WICKET, RUN_OUT
    }
}
