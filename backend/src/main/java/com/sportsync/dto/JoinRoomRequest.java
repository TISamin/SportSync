package com.sportsync.dto;

import jakarta.validation.constraints.NotBlank;

public class JoinRoomRequest {
    @NotBlank(message = "Team name is required")
    private String teamName;

    @NotBlank(message = "Owner name is required")
    private String ownerName;

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
}
