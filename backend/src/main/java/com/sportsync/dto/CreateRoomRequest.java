package com.sportsync.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CreateRoomRequest {
    @NotNull(message = "Budget per team is required")
    @Min(value = 1, message = "Budget must be greater than zero")
    private Integer budgetPerTeam;

    private Integer maxTeams = 8;

    public Integer getBudgetPerTeam() { return budgetPerTeam; }
    public void setBudgetPerTeam(Integer budgetPerTeam) { this.budgetPerTeam = budgetPerTeam; }
    public Integer getMaxTeams() { return maxTeams; }
    public void setMaxTeams(Integer maxTeams) { this.maxTeams = maxTeams; }
}
