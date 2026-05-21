package com.sportsync.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "cricket_match_state")
public class CricketMatchState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "match_id", nullable = false, unique = true)
    private Long matchId;

    @Column(name = "innings_number", nullable = false)
    private Integer inningsNumber = 1;

    @Column(name = "striker_id")
    private Long strikerId;

    @Column(name = "non_striker_id")
    private Long nonStrikerId;

    @Column(name = "current_bowler_id")
    private Long currentBowlerId;

    @Column(name = "legal_balls_in_current_over", nullable = false)
    private Integer legalBallsInCurrentOver = 0;

    @Column(name = "is_free_hit_next", nullable = false)
    private Boolean isFreeHitNext = false;

    @Column(nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private CricketMatchStatus status = CricketMatchStatus.TOSS;

    @Column(name = "toss_winner_id")
    private Long tossWinnerId;

    @Column(name = "toss_decision", length = 10)
    @Enumerated(EnumType.STRING)
    private TossDecision tossDecision;

    public CricketMatchState() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }

    public Integer getInningsNumber() { return inningsNumber; }
    public void setInningsNumber(Integer inningsNumber) { this.inningsNumber = inningsNumber; }

    public Long getStrikerId() { return strikerId; }
    public void setStrikerId(Long strikerId) { this.strikerId = strikerId; }

    public Long getNonStrikerId() { return nonStrikerId; }
    public void setNonStrikerId(Long nonStrikerId) { this.nonStrikerId = nonStrikerId; }

    public Long getCurrentBowlerId() { return currentBowlerId; }
    public void setCurrentBowlerId(Long currentBowlerId) { this.currentBowlerId = currentBowlerId; }

    public Integer getLegalBallsInCurrentOver() { return legalBallsInCurrentOver; }
    public void setLegalBallsInCurrentOver(Integer legalBallsInCurrentOver) { this.legalBallsInCurrentOver = legalBallsInCurrentOver; }

    public Boolean getIsFreeHitNext() { return isFreeHitNext; }
    public void setIsFreeHitNext(Boolean isFreeHitNext) { this.isFreeHitNext = isFreeHitNext; }

    public CricketMatchStatus getStatus() { return status; }
    public void setStatus(CricketMatchStatus status) { this.status = status; }

    public Long getTossWinnerId() { return tossWinnerId; }
    public void setTossWinnerId(Long tossWinnerId) { this.tossWinnerId = tossWinnerId; }

    public TossDecision getTossDecision() { return tossDecision; }
    public void setTossDecision(TossDecision tossDecision) { this.tossDecision = tossDecision; }

    public enum CricketMatchStatus {
        TOSS, INNINGS_1, INNINGS_2, SUPER_OVER_1, SUPER_OVER_2, COMPLETED
    }

    public enum TossDecision {
        BAT, BOWL
    }
}
