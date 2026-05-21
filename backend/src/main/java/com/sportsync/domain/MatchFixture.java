package com.sportsync.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "match_fixture")
public class MatchFixture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tournament_id", nullable = false)
    private Long tournamentId;

    @Column(name = "home_team_id", nullable = false)
    private Long homeTeamId;

    @Column(name = "away_team_id", nullable = false)
    private Long awayTeamId;

    @Column(name = "phase_number", nullable = false)
    private Integer phaseNumber = 1;

    @Column(name = "group_number", nullable = false)
    private Integer groupNumber = 1;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private MatchRound round = MatchRound.GROUP;

    @Column(name = "home_score")
    private Integer homeScore;

    @Column(name = "away_score")
    private Integer awayScore;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private MatchStatus status = MatchStatus.PENDING;

    @Column(name = "played_at")
    private Instant playedAt;

    @Column(name = "sport", nullable = false, length = 20)
    private String sport = "FOOTBALL";

    @Column(name = "overs")
    private Integer overs;

    public MatchFixture() {}

    public MatchFixture(Long tournamentId, Long homeTeamId, Long awayTeamId,
                        Integer phaseNumber, Integer groupNumber, MatchRound round) {
        this.tournamentId = tournamentId;
        this.homeTeamId = homeTeamId;
        this.awayTeamId = awayTeamId;
        this.phaseNumber = phaseNumber;
        this.groupNumber = groupNumber;
        this.round = round;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTournamentId() { return tournamentId; }
    public void setTournamentId(Long tournamentId) { this.tournamentId = tournamentId; }

    public Long getHomeTeamId() { return homeTeamId; }
    public void setHomeTeamId(Long homeTeamId) { this.homeTeamId = homeTeamId; }

    public Long getAwayTeamId() { return awayTeamId; }
    public void setAwayTeamId(Long awayTeamId) { this.awayTeamId = awayTeamId; }

    public Integer getPhaseNumber() { return phaseNumber; }
    public void setPhaseNumber(Integer phaseNumber) { this.phaseNumber = phaseNumber; }

    public Integer getGroupNumber() { return groupNumber; }
    public void setGroupNumber(Integer groupNumber) { this.groupNumber = groupNumber; }

    public MatchRound getRound() { return round; }
    public void setRound(MatchRound round) { this.round = round; }

    public Integer getHomeScore() { return homeScore; }
    public void setHomeScore(Integer homeScore) { this.homeScore = homeScore; }

    public Integer getAwayScore() { return awayScore; }
    public void setAwayScore(Integer awayScore) { this.awayScore = awayScore; }

    public MatchStatus getStatus() { return status; }
    public void setStatus(MatchStatus status) { this.status = status; }

    public Instant getPlayedAt() { return playedAt; }
    public void setPlayedAt(Instant playedAt) { this.playedAt = playedAt; }

    public String getSport() { return sport; }
    public void setSport(String sport) { this.sport = sport; }

    public Integer getOvers() { return overs; }
    public void setOvers(Integer overs) { this.overs = overs; }

    public enum MatchRound {
        GROUP, ROUND_OF_16, QUARTER, SEMI, FINAL
    }

    public enum MatchStatus {
        PENDING, DONE
    }
}
