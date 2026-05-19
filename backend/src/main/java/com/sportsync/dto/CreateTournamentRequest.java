package com.sportsync.dto;

import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateTournamentRequest {
    @NotBlank(message = "Tournament name is required")
    private String name;

    private String type = "SINGLE"; // SINGLE or DOUBLE
    
    @Size(min = 2, message = "At least 2 teams are required")
    private List<Long> teamIds;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public List<Long> getTeamIds() { return teamIds; }
    public void setTeamIds(List<Long> teamIds) { this.teamIds = teamIds; }
}
