package com.sportsync.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "player")
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "auction_room_id", nullable = false)
    private Long auctionRoomId;

    @Column(nullable = false, length = 100)
    private String name;

    private Integer age;

    @Column(nullable = false, length = 30)
    private String role;

    @Column(length = 50)
    private String style;

    @Column(nullable = false, length = 5)
    private String category;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "player_number")
    private Integer playerNumber;

    @Column(name = "base_price", nullable = false)
    private Integer basePrice = 0;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private PlayerStatus status = PlayerStatus.AVAILABLE;

    public Player() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAuctionRoomId() { return auctionRoomId; }
    public void setAuctionRoomId(Long auctionRoomId) { this.auctionRoomId = auctionRoomId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Integer getPlayerNumber() { return playerNumber; }
    public void setPlayerNumber(Integer playerNumber) { this.playerNumber = playerNumber; }

    public Integer getBasePrice() { return basePrice; }
    public void setBasePrice(Integer basePrice) { this.basePrice = basePrice; }

    public PlayerStatus getStatus() { return status; }
    public void setStatus(PlayerStatus status) { this.status = status; }

    public enum PlayerStatus {
        AVAILABLE, SOLD, UNSOLD
    }
}
