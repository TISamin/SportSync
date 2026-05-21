package com.sportsync.dto;

import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateTournamentRequest {
    @NotBlank(message = "Tournament name is required")
    private String name;

    private String type = "SINGLE"; // SINGLE or DOUBLE
    
    private String sport = "FOOTBALL"; // FOOTBALL or CRICKET
    
    private Integer overs; // Nullable, only for CRICKET
    
    @Size(min = 2, message = "At least 2 teams are required")
    private List<Long> teamIds;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getSport() { return sport; }
    public void setSport(String sport) { this.sport = sport; }
    public Integer getOvers() { return overs; }
    public void setOvers(Integer overs) { this.overs = overs; }
    public List<Long> getTeamIds() { return teamIds; }
    public void setTeamIds(List<Long> teamIds) { this.teamIds = teamIds; }
}
