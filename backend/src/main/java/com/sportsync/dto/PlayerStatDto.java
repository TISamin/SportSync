package com.sportsync.dto;

public class PlayerStatDto {
    private Long playerId;
    private String playerName;
    private String teamName;
    private String imageUrl;
    private Long count;

    public PlayerStatDto(Long playerId, String playerName, String teamName, String imageUrl, Long count) {
        this.playerId = playerId;
        this.playerName = playerName;
        this.teamName = teamName;
        this.imageUrl = imageUrl;
        this.count = count;
    }

    public Long getPlayerId() { return playerId; }
    public String getPlayerName() { return playerName; }
    public String getTeamName() { return teamName; }
    public String getImageUrl() { return imageUrl; }
    public Long getCount() { return count; }
}
