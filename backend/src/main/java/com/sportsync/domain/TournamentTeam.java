package com.sportsync.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "tournament_team")
public class TournamentTeam {

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

    public TournamentTeam() {}

    public TournamentTeam(Long tournamentId, Long teamId, Integer phaseNumber, Integer groupNumber) {
        this.tournamentId = tournamentId;
        this.teamId = teamId;
        this.phaseNumber = phaseNumber;
        this.groupNumber = groupNumber;
    }

    // Getters and Setters
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
}
