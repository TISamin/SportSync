package com.sportsync.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "team")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "auction_room_id")
    private Long auctionRoomId;

    @Column(name = "team_name", nullable = false, length = 100)
    private String name;

    @Column(name = "owner_name", length = 100)
    private String ownerName;

    @Column(name = "budget_remaining", nullable = false)
    private Integer budgetRemaining = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Team() {}

    public Team(String name, String ownerName, Long auctionRoomId, Integer budgetRemaining) {
        this.name = name;
        this.ownerName = ownerName;
        this.auctionRoomId = auctionRoomId;
        this.budgetRemaining = budgetRemaining;
    }

    // Getters and Setters
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
}
