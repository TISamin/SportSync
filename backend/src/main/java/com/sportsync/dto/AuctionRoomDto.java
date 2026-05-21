package com.sportsync.dto;

import com.sportsync.domain.AuctionRoom;
import java.time.Instant;

public class AuctionRoomDto {
    private Long id;
    private String roomCode;
    private AuctionRoom.AuctionRoomStatus status;
    private Integer budgetPerTeam;
    private Integer maxTeams;
    private Instant createdAt;

    public AuctionRoomDto() {}

    public AuctionRoomDto(AuctionRoom room) {
        this.id = room.getId();
        this.roomCode = room.getRoomCode();
        this.status = room.getStatus();
        this.budgetPerTeam = room.getBudgetPerTeam();
        this.maxTeams = room.getMaxTeams();
        this.createdAt = room.getCreatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRoomCode() { return roomCode; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
    public AuctionRoom.AuctionRoomStatus getStatus() { return status; }
    public void setStatus(AuctionRoom.AuctionRoomStatus status) { this.status = status; }
    public Integer getBudgetPerTeam() { return budgetPerTeam; }
    public void setBudgetPerTeam(Integer budgetPerTeam) { this.budgetPerTeam = budgetPerTeam; }
    public Integer getMaxTeams() { return maxTeams; }
    public void setMaxTeams(Integer maxTeams) { this.maxTeams = maxTeams; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
