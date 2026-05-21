package com.sportsync.dto;

public class CricketPlayerStatDto {
    private Long playerId;
    private String playerName;
    private String teamName;
    private String imageUrl;
    private Integer runs;
    private Integer ballsFaced;
    private Integer fours;
    private Integer sixes;
    private Integer wickets;
    private Integer oversBowled;
    private Integer runsConceded;

    public CricketPlayerStatDto() {}

    public CricketPlayerStatDto(Long playerId, String playerName, String teamName, String imageUrl,
                                Integer runs, Integer ballsFaced, Integer fours, Integer sixes,
                                Integer wickets, Integer oversBowled, Integer runsConceded) {
        this.playerId = playerId;
        this.playerName = playerName;
        this.teamName = teamName;
        this.imageUrl = imageUrl;
        this.runs = runs;
        this.ballsFaced = ballsFaced;
        this.fours = fours;
        this.sixes = sixes;
        this.wickets = wickets;
        this.oversBowled = oversBowled;
        this.runsConceded = runsConceded;
    }

    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long playerId) { this.playerId = playerId; }

    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Integer getRuns() { return runs; }
    public void setRuns(Integer runs) { this.runs = runs; }

    public Integer getBallsFaced() { return ballsFaced; }
    public void setBallsFaced(Integer ballsFaced) { this.ballsFaced = ballsFaced; }

    public Integer getFours() { return fours; }
    public void setFours(Integer fours) { this.fours = fours; }

    public Integer getSixes() { return sixes; }
    public void setSixes(Integer sixes) { this.sixes = sixes; }

    public Integer getWickets() { return wickets; }
    public void setWickets(Integer wickets) { this.wickets = wickets; }

    public Integer getOversBowled() { return oversBowled; }
    public void setOversBowled(Integer oversBowled) { this.oversBowled = oversBowled; }

    public Integer getRunsConceded() { return runsConceded; }
    public void setRunsConceded(Integer runsConceded) { this.runsConceded = runsConceded; }
}
