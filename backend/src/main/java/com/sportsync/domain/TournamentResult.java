package com.sportsync.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "tournament_result")
public class TournamentResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tournament_id", nullable = false)
    private Long tournamentId;

    @Column(name = "winner_team_id")
    private Long winnerTeamId;

    @Column(name = "runner_up_team_id")
    private Long runnerUpTeamId;

    @Column(name = "second_runner_id")
    private Long secondRunnerId;

    @Column(name = "top_scorer_id")
    private Long topScorerId;

    @Column(name = "top_assister_id")
    private Long topAssisterId;

    public TournamentResult() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTournamentId() { return tournamentId; }
    public void setTournamentId(Long tournamentId) { this.tournamentId = tournamentId; }
    public Long getWinnerTeamId() { return winnerTeamId; }
    public void setWinnerTeamId(Long winnerTeamId) { this.winnerTeamId = winnerTeamId; }
    public Long getRunnerUpTeamId() { return runnerUpTeamId; }
    public void setRunnerUpTeamId(Long runnerUpTeamId) { this.runnerUpTeamId = runnerUpTeamId; }
    public Long getSecondRunnerId() { return secondRunnerId; }
    public void setSecondRunnerId(Long secondRunnerId) { this.secondRunnerId = secondRunnerId; }
    public Long getTopScorerId() { return topScorerId; }
    public void setTopScorerId(Long topScorerId) { this.topScorerId = topScorerId; }
    public Long getTopAssisterId() { return topAssisterId; }
    public void setTopAssisterId(Long topAssisterId) { this.topAssisterId = topAssisterId; }
}
