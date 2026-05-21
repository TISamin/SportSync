package com.sportsync.dto;

import com.sportsync.domain.MatchFixture;
import java.time.Instant;

public class MatchFixtureDto {
    private Long id;
    private Long tournamentId;
    private Long homeTeamId;
    private Long awayTeamId;
    private Integer phaseNumber;
    private Integer groupNumber;
    private MatchFixture.MatchRound round;
    private Integer homeScore;
    private Integer awayScore;
    private MatchFixture.MatchStatus status;
    private Instant playedAt;
    
    // Additional populated fields
    private String homeTeamName;
    private String awayTeamName;
    private String sport;
    private Integer overs;

    public MatchFixtureDto() {}

    public MatchFixtureDto(MatchFixture fixture) {
        this.id = fixture.getId();
        this.tournamentId = fixture.getTournamentId();
        this.homeTeamId = fixture.getHomeTeamId();
        this.awayTeamId = fixture.getAwayTeamId();
        this.phaseNumber = fixture.getPhaseNumber();
        this.groupNumber = fixture.getGroupNumber();
        this.round = fixture.getRound();
        this.homeScore = fixture.getHomeScore();
        this.awayScore = fixture.getAwayScore();
        this.status = fixture.getStatus();
        this.playedAt = fixture.getPlayedAt();
        this.sport = fixture.getSport();
        this.overs = fixture.getOvers();
    }

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
    public MatchFixture.MatchRound getRound() { return round; }
    public void setRound(MatchFixture.MatchRound round) { this.round = round; }
    public Integer getHomeScore() { return homeScore; }
    public void setHomeScore(Integer homeScore) { this.homeScore = homeScore; }
    public Integer getAwayScore() { return awayScore; }
    public void setAwayScore(Integer awayScore) { this.awayScore = awayScore; }
    public MatchFixture.MatchStatus getStatus() { return status; }
    public void setStatus(MatchFixture.MatchStatus status) { this.status = status; }
    public Instant getPlayedAt() { return playedAt; }
    public void setPlayedAt(Instant playedAt) { this.playedAt = playedAt; }
    public String getHomeTeamName() { return homeTeamName; }
    public void setHomeTeamName(String homeTeamName) { this.homeTeamName = homeTeamName; }
    public String getAwayTeamName() { return awayTeamName; }
    public void setAwayTeamName(String awayTeamName) { this.awayTeamName = awayTeamName; }
    public String getSport() { return sport; }
    public void setSport(String sport) { this.sport = sport; }
    public Integer getOvers() { return overs; }
    public void setOvers(Integer overs) { this.overs = overs; }
}
