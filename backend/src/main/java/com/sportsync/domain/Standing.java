package com.sportsync.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "standing")
public class Standing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tournament_id", nullable = false)
    private Long tournamentId;

    @Column(name = "team_id", nullable = false)
    private Long teamId;

    @Column(name = "phase_number", nullable = false)
    private Integer phaseNumber = 1;

    @Column(name = "group_number", nullable = false)
    private Integer groupNumber = 1;

    @Column(nullable = false)
    private Integer played = 0;

    @Column(nullable = false)
    private Integer won = 0;

    @Column(nullable = false)
    private Integer drawn = 0;

    @Column(nullable = false)
    private Integer lost = 0;

    @Column(name = "goals_for", nullable = false)
    private Integer goalsFor = 0;

    @Column(name = "goals_against", nullable = false)
    private Integer goalsAgainst = 0;

    @Column(nullable = false)
    private Integer points = 0;

    public Standing() {}

    public Standing(Long tournamentId, Long teamId, Integer phaseNumber, Integer groupNumber) {
        this.tournamentId = tournamentId;
        this.teamId = teamId;
        this.phaseNumber = phaseNumber;
        this.groupNumber = groupNumber;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTournamentId() { return tournamentId; }
    public void setTournamentId(Long tournamentId) { this.tournamentId = tournamentId; }
    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }
    public Integer getPhaseNumber() { return phaseNumber; }
    public void setPhaseNumber(Integer phaseNumber) { this.phaseNumber = phaseNumber; }
    public Integer getGroupNumber() { return groupNumber; }
    public void setGroupNumber(Integer groupNumber) { this.groupNumber = groupNumber; }
    public Integer getPlayed() { return played; }
    public void setPlayed(Integer played) { this.played = played; }
    public Integer getWon() { return won; }
    public void setWon(Integer won) { this.won = won; }
    public Integer getDrawn() { return drawn; }
    public void setDrawn(Integer drawn) { this.drawn = drawn; }
    public Integer getLost() { return lost; }
    public void setLost(Integer lost) { this.lost = lost; }
    public Integer getGoalsFor() { return goalsFor; }
    public void setGoalsFor(Integer goalsFor) { this.goalsFor = goalsFor; }
    public Integer getGoalsAgainst() { return goalsAgainst; }
    public void setGoalsAgainst(Integer goalsAgainst) { this.goalsAgainst = goalsAgainst; }
    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }
    public Integer getGoalDifference() { return goalsFor - goalsAgainst; }
}
