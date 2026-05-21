package com.sportsync.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "batting_scorecard")
public class BattingScorecard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "innings_id", nullable = false)
    private Long inningsId;

    @Column(name = "player_id", nullable = false)
    private Long playerId;

    @Column(nullable = false)
    private Integer runs = 0;

    @Column(name = "balls_faced", nullable = false)
    private Integer ballsFaced = 0;

    @Column(nullable = false)
    private Integer fours = 0;

    @Column(nullable = false)
    private Integer sixes = 0;

    @Column(name = "dismissal_type", length = 30)
    @Enumerated(EnumType.STRING)
    private BallEvent.DismissalType dismissalType;

    @Column(name = "dismissed_by_id")
    private Long dismissedById;

    @Column(nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private BattingStatus status = BattingStatus.NOT_YET_BATTED;

    public BattingScorecard() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getInningsId() { return inningsId; }
    public void setInningsId(Long inningsId) { this.inningsId = inningsId; }

    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long playerId) { this.playerId = playerId; }

    public Integer getRuns() { return runs; }
    public void setRuns(Integer runs) { this.runs = runs; }

    public Integer getBallsFaced() { return ballsFaced; }
    public void setBallsFaced(Integer ballsFaced) { this.ballsFaced = ballsFaced; }

    public Integer getFours() { return fours; }
    public void setFours(Integer fours) { this.fours = fours; }

    public Integer getSixes() { return sixes; }
    public void setSixes(Integer sixes) { this.sixes = sixes; }

    public BallEvent.DismissalType getDismissalType() { return dismissalType; }
    public void setDismissalType(BallEvent.DismissalType dismissalType) { this.dismissalType = dismissalType; }

    public Long getDismissedById() { return dismissedById; }
    public void setDismissedById(Long dismissedById) { this.dismissedById = dismissedById; }

    public BattingStatus getStatus() { return status; }
    public void setStatus(BattingStatus status) { this.status = status; }

    public enum BattingStatus {
        NOT_OUT, OUT, DNB, NOT_YET_BATTED
    }
}
