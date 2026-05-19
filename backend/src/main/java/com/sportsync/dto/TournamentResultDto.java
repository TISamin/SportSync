package com.sportsync.dto;

public class TournamentResultDto {
    private TeamDto winner;
    private TeamDto runnerUp;
    private TeamDto secondRunner;
    private PlayerStatDto topScorer;
    private PlayerStatDto topAssister;

    public TournamentResultDto() {}

    public TournamentResultDto(TeamDto winner, TeamDto runnerUp, TeamDto secondRunner, PlayerStatDto topScorer, PlayerStatDto topAssister) {
        this.winner = winner;
        this.runnerUp = runnerUp;
        this.secondRunner = secondRunner;
        this.topScorer = topScorer;
        this.topAssister = topAssister;
    }

    public TeamDto getWinner() { return winner; }
    public void setWinner(TeamDto winner) { this.winner = winner; }
    public TeamDto getRunnerUp() { return runnerUp; }
    public void setRunnerUp(TeamDto runnerUp) { this.runnerUp = runnerUp; }
    public TeamDto getSecondRunner() { return secondRunner; }
    public void setSecondRunner(TeamDto secondRunner) { this.secondRunner = secondRunner; }
    public PlayerStatDto getTopScorer() { return topScorer; }
    public void setTopScorer(PlayerStatDto topScorer) { this.topScorer = topScorer; }
    public PlayerStatDto getTopAssister() { return topAssister; }
    public void setTopAssister(PlayerStatDto topAssister) { this.topAssister = topAssister; }
}
