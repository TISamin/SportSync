package com.sportsync.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "bowling_scorecard")
public class BowlingScorecard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "innings_id", nullable = false)
    private Long inningsId;

    @Column(name = "player_id", nullable = false)
    private Long playerId;

    @Column(name = "overs_bowled", nullable = false)
    private Integer oversBowled = 0;

    @Column(name = "balls_bowled", nullable = false)
    private Integer ballsBowled = 0;

    @Column(name = "runs_conceded", nullable = false)
    private Integer runsConceded = 0;

    @Column(nullable = false)
    private Integer wickets = 0;

    @Column(nullable = false)
    private Integer wides = 0;

    @Column(name = "no_balls", nullable = false)
    private Integer noBalls = 0;

    @Column(nullable = false)
    private Integer maidens = 0;

    public BowlingScorecard() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getInningsId() { return inningsId; }
    public void setInningsId(Long inningsId) { this.inningsId = inningsId; }

    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long playerId) { this.playerId = playerId; }

    public Integer getOversBowled() { return oversBowled; }
    public void setOversBowled(Integer oversBowled) { this.oversBowled = oversBowled; }

    public Integer getBallsBowled() { return ballsBowled; }
    public void setBallsBowled(Integer ballsBowled) { this.ballsBowled = ballsBowled; }

    public Integer getRunsConceded() { return runsConceded; }
    public void setRunsConceded(Integer runsConceded) { this.runsConceded = runsConceded; }

    public Integer getWickets() { return wickets; }
    public void setWickets(Integer wickets) { this.wickets = wickets; }

    public Integer getWides() { return wides; }
    public void setWides(Integer wides) { this.wides = wides; }

    public Integer getNoBalls() { return noBalls; }
    public void setNoBalls(Integer noBalls) { this.noBalls = noBalls; }

    public Integer getMaidens() { return maidens; }
    public void setMaidens(Integer maidens) { this.maidens = maidens; }
}
