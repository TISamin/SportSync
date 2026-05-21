package com.sportsync.dto;

import com.sportsync.domain.Tournament;
import java.time.Instant;

public class TournamentDto {
    private Long id;
    private String name;
    private Tournament.TournamentType type;
    private Integer currentPhase;
    private Tournament.TournamentStatus status;
    private Long auctionRoomId;
    private String sport;
    private Instant createdAt;

    public TournamentDto() {}

    public TournamentDto(Tournament tournament) {
        this.id = tournament.getId();
        this.name = tournament.getName();
        this.type = tournament.getType();
        this.currentPhase = tournament.getCurrentPhase();
        this.status = tournament.getStatus();
        this.auctionRoomId = tournament.getAuctionRoomId();
        this.sport = tournament.getSport();
        this.createdAt = tournament.getCreatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Tournament.TournamentType getType() { return type; }
    public void setType(Tournament.TournamentType type) { this.type = type; }
    public Integer getCurrentPhase() { return currentPhase; }
    public void setCurrentPhase(Integer currentPhase) { this.currentPhase = currentPhase; }
    public Tournament.TournamentStatus getStatus() { return status; }
    public void setStatus(Tournament.TournamentStatus status) { this.status = status; }
    public Long getAuctionRoomId() { return auctionRoomId; }
    public void setAuctionRoomId(Long auctionRoomId) { this.auctionRoomId = auctionRoomId; }
    public String getSport() { return sport; }
    public void setSport(String sport) { this.sport = sport; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
