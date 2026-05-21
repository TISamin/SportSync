package com.sportsync.dto;

import com.sportsync.domain.Team;
import java.time.Instant;
import java.util.List;

public class TeamDto {
    private Long id;
    private Long auctionRoomId;
    private String name;
    private String ownerName;
    private Integer budgetRemaining;
    private Instant createdAt;
    private List<PlayerDto> roster;

    public TeamDto() {}

    public TeamDto(Team team) {
        this.id = team.getId();
        this.auctionRoomId = team.getAuctionRoomId();
        this.name = team.getName();
        this.ownerName = team.getOwnerName();
        this.budgetRemaining = team.getBudgetRemaining();
        this.createdAt = team.getCreatedAt();
    }

    public TeamDto(Team team, List<PlayerDto> roster) {
        this(team);
        this.roster = roster;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAuctionRoomId() { return auctionRoomId; }
    public void setAuctionRoomId(Long auctionRoomId) { this.auctionRoomId = auctionRoomId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public Integer getBudgetRemaining() { return budgetRemaining; }
    public void setBudgetRemaining(Integer budgetRemaining) { this.budgetRemaining = budgetRemaining; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public List<PlayerDto> getRoster() { return roster; }
    public void setRoster(List<PlayerDto> roster) { this.roster = roster; }
}
