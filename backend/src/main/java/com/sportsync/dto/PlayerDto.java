package com.sportsync.dto;

import com.sportsync.domain.Player;

public class PlayerDto {
    private Long id;
    private Long auctionRoomId;
    private String name;
    private Integer age;
    private String role;
    private String style;
    private String category;
    private String imageUrl;
    private Integer playerNumber;
    private Integer basePrice;
    private Player.PlayerStatus status;
    private Integer soldPrice;

    public PlayerDto() {}

    public PlayerDto(Player player) {
        this.id = player.getId();
        this.auctionRoomId = player.getAuctionRoomId();
        this.name = player.getName();
        this.age = player.getAge();
        this.role = player.getRole();
        this.style = player.getStyle();
        this.category = player.getCategory();
        this.imageUrl = player.getImageUrl();
        this.playerNumber = player.getPlayerNumber();
        this.basePrice = player.getBasePrice();
        this.status = player.getStatus();
    }

    public PlayerDto(Player player, Integer soldPrice) {
        this(player);
        this.soldPrice = soldPrice;
    }

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
    public Player.PlayerStatus getStatus() { return status; }
    public void setStatus(Player.PlayerStatus status) { this.status = status; }
    public Integer getSoldPrice() { return soldPrice; }
    public void setSoldPrice(Integer soldPrice) { this.soldPrice = soldPrice; }
}
