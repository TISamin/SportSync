package com.sportsync.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "auction_room")
public class AuctionRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_code", nullable = false, unique = true, length = 6)
    private String roomCode;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private AuctionRoomStatus status = AuctionRoomStatus.WAITING;

    @Column(name = "budget_per_team", nullable = false)
    private Integer budgetPerTeam;

    @Column(name = "max_teams", nullable = false)
    private Integer maxTeams = 8;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public AuctionRoom() {}

    public AuctionRoom(String roomCode, Integer budgetPerTeam, Integer maxTeams) {
        this.roomCode = roomCode;
        this.budgetPerTeam = budgetPerTeam;
        this.maxTeams = maxTeams;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoomCode() { return roomCode; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }

    public AuctionRoomStatus getStatus() { return status; }
    public void setStatus(AuctionRoomStatus status) { this.status = status; }

    public Integer getBudgetPerTeam() { return budgetPerTeam; }
    public void setBudgetPerTeam(Integer budgetPerTeam) { this.budgetPerTeam = budgetPerTeam; }

    public Integer getMaxTeams() { return maxTeams; }
    public void setMaxTeams(Integer maxTeams) { this.maxTeams = maxTeams; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public enum AuctionRoomStatus {
        WAITING, ACTIVE, DONE
    }
}
