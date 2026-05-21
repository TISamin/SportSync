package com.sportsync.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "innings")
public class Innings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "match_id", nullable = false)
    private Long matchId;

    @Column(name = "innings_number", nullable = false)
    private Integer inningsNumber;

    @Column(name = "batting_team_id", nullable = false)
    private Long battingTeamId;

    @Column(name = "bowling_team_id", nullable = false)
    private Long bowlingTeamId;

    @Column(name = "total_runs", nullable = false)
    private Integer totalRuns = 0;

    @Column(name = "total_wickets", nullable = false)
    private Integer totalWickets = 0;

    @Column(name = "total_overs_bowled", nullable = false)
    private Double totalOversBowled = 0.0;

    @Column(nullable = false)
    private Integer extras = 0;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private InningsStatus status = InningsStatus.IN_PROGRESS;

    @Column(name = "is_super_over", nullable = false)
    private Boolean isSuperOver = false;

    public Innings() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }

    public Integer getInningsNumber() { return inningsNumber; }
    public void setInningsNumber(Integer inningsNumber) { this.inningsNumber = inningsNumber; }

    public Long getBattingTeamId() { return battingTeamId; }
    public void setBattingTeamId(Long battingTeamId) { this.battingTeamId = battingTeamId; }

    public Long getBowlingTeamId() { return bowlingTeamId; }
    public void setBowlingTeamId(Long bowlingTeamId) { this.bowlingTeamId = bowlingTeamId; }

    public Integer getTotalRuns() { return totalRuns; }
    public void setTotalRuns(Integer totalRuns) { this.totalRuns = totalRuns; }

    public Integer getTotalWickets() { return totalWickets; }
    public void setTotalWickets(Integer totalWickets) { this.totalWickets = totalWickets; }

    public Double getTotalOversBowled() { return totalOversBowled; }
    public void setTotalOversBowled(Double totalOversBowled) { this.totalOversBowled = totalOversBowled; }

    public Integer getExtras() { return extras; }
    public void setExtras(Integer extras) { this.extras = extras; }

    public InningsStatus getStatus() { return status; }
    public void setStatus(InningsStatus status) { this.status = status; }

    public Boolean getIsSuperOver() { return isSuperOver; }
    public void setIsSuperOver(Boolean isSuperOver) { this.isSuperOver = isSuperOver; }

    public enum InningsStatus {
        IN_PROGRESS, COMPLETED
    }
}
