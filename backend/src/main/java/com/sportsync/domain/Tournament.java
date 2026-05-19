package com.sportsync.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "tournament")
public class Tournament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private TournamentType type = TournamentType.SINGLE;

    @Column(name = "current_phase", nullable = false)
    private Integer currentPhase = 1;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private TournamentStatus status = TournamentStatus.ACTIVE;

    @Column(name = "auction_room_id")
    private Long auctionRoomId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Tournament() {}

    public Tournament(String name, TournamentType type) {
        this.name = name;
        this.type = type;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public TournamentType getType() { return type; }
    public void setType(TournamentType type) { this.type = type; }

    public Integer getCurrentPhase() { return currentPhase; }
    public void setCurrentPhase(Integer currentPhase) { this.currentPhase = currentPhase; }

    public TournamentStatus getStatus() { return status; }
    public void setStatus(TournamentStatus status) { this.status = status; }

    public Long getAuctionRoomId() { return auctionRoomId; }
    public void setAuctionRoomId(Long auctionRoomId) { this.auctionRoomId = auctionRoomId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public enum TournamentType {
        SINGLE, DOUBLE
    }

    public enum TournamentStatus {
        ACTIVE, DONE
    }
}
