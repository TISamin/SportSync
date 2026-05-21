package com.sportsync.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "tournament_player_stat")
public class TournamentPlayerStat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tournament_id", nullable = false)
    private Long tournamentId;

    @Column(name = "player_id", nullable = false)
    private Long playerId;

    @Column(name = "team_id", nullable = false)
    private Long teamId;

    @Column(name = "total_runs", nullable = false)
    private Integer totalRuns = 0;

    @Column(name = "total_balls_faced", nullable = false)
    private Integer totalBallsFaced = 0;

    @Column(name = "total_fours", nullable = false)
    private Integer totalFours = 0;

    @Column(name = "total_sixes", nullable = false)
    private Integer totalSixes = 0;

    @Column(name = "total_wickets", nullable = false)
    private Integer totalWickets = 0;

    @Column(name = "total_overs_bowled", nullable = false)
    private Integer totalOversBowled = 0;

    @Column(name = "total_runs_conceded", nullable = false)
    private Integer totalRunsConceded = 0;

    public TournamentPlayerStat() {}

    public TournamentPlayerStat(Long tournamentId, Long playerId, Long teamId) {
        this.tournamentId = tournamentId;
        this.playerId = playerId;
        this.teamId = teamId;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTournamentId() { return tournamentId; }
    public void setTournamentId(Long tournamentId) { this.tournamentId = tournamentId; }

    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long playerId) { this.playerId = playerId; }

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public Integer getTotalRuns() { return totalRuns; }
    public void setTotalRuns(Integer totalRuns) { this.totalRuns = totalRuns; }

    public Integer getTotalBallsFaced() { return totalBallsFaced; }
    public void setTotalBallsFaced(Integer totalBallsFaced) { this.totalBallsFaced = totalBallsFaced; }

    public Integer getTotalFours() { return totalFours; }
    public void setTotalFours(Integer totalFours) { this.totalFours = totalFours; }

    public Integer getTotalSixes() { return totalSixes; }
    public void setTotalSixes(Integer totalSixes) { this.totalSixes = totalSixes; }

    public Integer getTotalWickets() { return totalWickets; }
    public void setTotalWickets(Integer totalWickets) { this.totalWickets = totalWickets; }

    public Integer getTotalOversBowled() { return totalOversBowled; }
    public void setTotalOversBowled(Integer totalOversBowled) { this.totalOversBowled = totalOversBowled; }

    public Integer getTotalRunsConceded() { return totalRunsConceded; }
    public void setTotalRunsConceded(Integer totalRunsConceded) { this.totalRunsConceded = totalRunsConceded; }
}
