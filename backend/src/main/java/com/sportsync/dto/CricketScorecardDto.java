package com.sportsync.dto;

import java.util.List;

public class CricketScorecardDto {

    private InningsScorecardDto innings1;
    private InningsScorecardDto innings2;

    public CricketScorecardDto() {}

    public InningsScorecardDto getInnings1() { return innings1; }
    public void setInnings1(InningsScorecardDto innings1) { this.innings1 = innings1; }

    public InningsScorecardDto getInnings2() { return innings2; }
    public void setInnings2(InningsScorecardDto innings2) { this.innings2 = innings2; }

    public static class InningsScorecardDto {
        private String teamName;
        private Integer totalRuns;
        private Integer totalWickets;
        private Double totalOversBowled;
        private Integer extras;
        private List<BatsmanScorecardDto> batting;
        private List<BowlerScorecardDto> bowling;

        public InningsScorecardDto() {}

        public String getTeamName() { return teamName; }
        public void setTeamName(String teamName) { this.teamName = teamName; }

        public Integer getTotalRuns() { return totalRuns; }
        public void setTotalRuns(Integer totalRuns) { this.totalRuns = totalRuns; }

        public Integer getTotalWickets() { return totalWickets; }
        public void setTotalWickets(Integer totalWickets) { this.totalWickets = totalWickets; }

        public Double getTotalOversBowled() { return totalOversBowled; }
        public void setTotalOversBowled(Double totalOversBowled) { this.totalOversBowled = totalOversBowled; }

        public Integer getExtras() { return extras; }
        public void setExtras(Integer extras) { this.extras = extras; }

        public List<BatsmanScorecardDto> getBatting() { return batting; }
        public void setBatting(List<BatsmanScorecardDto> batting) { this.batting = batting; }

        public List<BowlerScorecardDto> getBowling() { return bowling; }
        public void setBowling(List<BowlerScorecardDto> bowling) { this.bowling = bowling; }
    }

    public static class BatsmanScorecardDto {
        private Long playerId;
        private String playerName;
        private Integer runs;
        private Integer ballsFaced;
        private Integer fours;
        private Integer sixes;
        private String dismissalType;
        private String dismissedByName;
        private String status;

        public BatsmanScorecardDto() {}

        public Long getPlayerId() { return playerId; }
        public void setPlayerId(Long playerId) { this.playerId = playerId; }

        public String getPlayerName() { return playerName; }
        public void setPlayerName(String playerName) { this.playerName = playerName; }

        public Integer getRuns() { return runs; }
        public void setRuns(Integer runs) { this.runs = runs; }

        public Integer getBallsFaced() { return ballsFaced; }
        public void setBallsFaced(Integer ballsFaced) { this.ballsFaced = ballsFaced; }

        public Integer getFours() { return fours; }
        public void setFours(Integer fours) { this.fours = fours; }

        public Integer getSixes() { return sixes; }
        public void setSixes(Integer sixes) { this.sixes = sixes; }

        public String getDismissalType() { return dismissalType; }
        public void setDismissalType(String dismissalType) { this.dismissalType = dismissalType; }

        public String getDismissedByName() { return dismissedByName; }
        public void setDismissedByName(String dismissedByName) { this.dismissedByName = dismissedByName; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class BowlerScorecardDto {
        private Long playerId;
        private String playerName;
        private Double oversBowled;
        private Integer ballsBowled;
        private Integer runsConceded;
        private Integer wickets;
        private Integer wides;
        private Integer noBalls;
        private Integer maidens;

        public BowlerScorecardDto() {}

        public Long getPlayerId() { return playerId; }
        public void setPlayerId(Long playerId) { this.playerId = playerId; }

        public String getPlayerName() { return playerName; }
        public void setPlayerName(String playerName) { this.playerName = playerName; }

        public Double getOversBowled() { return oversBowled; }
        public void setOversBowled(Double oversBowled) { this.oversBowled = oversBowled; }

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
}
