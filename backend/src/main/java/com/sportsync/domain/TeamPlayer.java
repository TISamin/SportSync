package com.sportsync.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "team_player")
public class TeamPlayer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "team_id", nullable = false)
    private Long teamId;

    @Column(name = "player_id", nullable = false)
    private Long playerId;

    @Column(name = "sold_price", nullable = false)
    private Integer soldPrice = 0;

    @Column(name = "acquired_via", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private AcquiredVia acquiredVia = AcquiredVia.BID;

    public TeamPlayer() {}

    public TeamPlayer(Long teamId, Long playerId, Integer soldPrice, AcquiredVia acquiredVia) {
        this.teamId = teamId;
        this.playerId = playerId;
        this.soldPrice = soldPrice;
        this.acquiredVia = acquiredVia;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long playerId) { this.playerId = playerId; }

    public Integer getSoldPrice() { return soldPrice; }
    public void setSoldPrice(Integer soldPrice) { this.soldPrice = soldPrice; }

    public AcquiredVia getAcquiredVia() { return acquiredVia; }
    public void setAcquiredVia(AcquiredVia acquiredVia) { this.acquiredVia = acquiredVia; }

    public enum AcquiredVia {
        BID, DISTRIBUTED
    }
}
