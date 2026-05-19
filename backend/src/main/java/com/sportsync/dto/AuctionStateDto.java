package com.sportsync.dto;

import java.util.List;

public class AuctionStateDto {
    private String roomCode;
    private PlayerDto currentPlayer;
    private Integer currentBid;
    private TeamDto leadingTeam;
    private Integer timeRemaining;
    private List<TeamDto> teams;
    private boolean isFinished;
    private String statusMessage; // e.g., "Player Sold!", "Unsold!"

    public AuctionStateDto() {}

    public String getRoomCode() { return roomCode; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
    public PlayerDto getCurrentPlayer() { return currentPlayer; }
    public void setCurrentPlayer(PlayerDto currentPlayer) { this.currentPlayer = currentPlayer; }
    public Integer getCurrentBid() { return currentBid; }
    public void setCurrentBid(Integer currentBid) { this.currentBid = currentBid; }
    public TeamDto getLeadingTeam() { return leadingTeam; }
    public void setLeadingTeam(TeamDto leadingTeam) { this.leadingTeam = leadingTeam; }
    public Integer getTimeRemaining() { return timeRemaining; }
    public void setTimeRemaining(Integer timeRemaining) { this.timeRemaining = timeRemaining; }
    public List<TeamDto> getTeams() { return teams; }
    public void setTeams(List<TeamDto> teams) { this.teams = teams; }
    public boolean isFinished() { return isFinished; }
    public void setFinished(boolean finished) { isFinished = finished; }
    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }
}
