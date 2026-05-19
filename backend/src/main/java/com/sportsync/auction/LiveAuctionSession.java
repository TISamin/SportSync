package com.sportsync.auction;

import com.sportsync.domain.Player;
import com.sportsync.domain.Team;
import com.sportsync.dto.AuctionStateDto;
import com.sportsync.dto.PlayerDto;
import com.sportsync.dto.TeamDto;

import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.ScheduledFuture;
import java.util.stream.Collectors;

public class LiveAuctionSession {
    private final String roomCode;
    private final Long roomId;
    private Queue<Player> availablePlayers;
    private List<Team> teams;
    
    private Player currentPlayer;
    private Integer currentBid = 0;
    private Team leadingTeam;
    private int timeRemaining = 30;
    
    private boolean active = false;
    private boolean finished = false;
    private String statusMessage = "Waiting to start...";

    private ScheduledFuture<?> timerTask;

    public LiveAuctionSession(String roomCode, Long roomId, List<Player> availablePlayers, List<Team> teams) {
        this.roomCode = roomCode;
        this.roomId = roomId;
        this.availablePlayers = new LinkedList<>(availablePlayers);
        this.teams = teams;
    }

    public synchronized void startNextPlayer() {
        if (availablePlayers.isEmpty()) {
            this.active = false;
            this.finished = true;
            this.currentPlayer = null;
            this.statusMessage = "Auction Finished!";
            return;
        }

        this.currentPlayer = availablePlayers.poll();
        this.currentBid = this.currentPlayer.getBasePrice() > 0 ? this.currentPlayer.getBasePrice() : 0;
        this.leadingTeam = null;
        this.timeRemaining = 30;
        this.active = true;
        this.statusMessage = "Bidding open for " + this.currentPlayer.getName();
    }

    public synchronized boolean placeBid(Long teamId, Integer amount) {
        if (!active || currentPlayer == null) {
            return false;
        }

        Team biddingTeam = teams.stream().filter(t -> t.getId().equals(teamId)).findFirst().orElse(null);
        if (biddingTeam == null) return false;

        if (leadingTeam != null && leadingTeam.getId().equals(teamId)) {
            return false; // Already leading
        }

        int requiredBid = leadingTeam == null ? currentBid : currentBid + 10; // minimum increment
        if (amount < requiredBid) {
            return false;
        }

        if (biddingTeam.getBudgetRemaining() < amount) {
            return false;
        }

        this.currentBid = amount;
        this.leadingTeam = biddingTeam;
        
        // Reset timer if less than 10 seconds remaining
        if (this.timeRemaining < 10) {
            this.timeRemaining = 10;
        }
        this.statusMessage = biddingTeam.getName() + " bids " + amount;
        return true;
    }

    public synchronized void decrementTime() {
        if (active && timeRemaining > 0) {
            timeRemaining--;
        }
    }
    
    public synchronized boolean isTimeUp() {
        return active && timeRemaining <= 0;
    }
    
    public synchronized void closeCurrentPlayer() {
        this.active = false;
        if (this.leadingTeam != null) {
            this.statusMessage = "SOLD to " + this.leadingTeam.getName() + " for " + this.currentBid;
        } else {
            this.statusMessage = "UNSOLD";
        }
    }

    public synchronized AuctionStateDto toDto() {
        AuctionStateDto dto = new AuctionStateDto();
        dto.setRoomCode(this.roomCode);
        dto.setCurrentPlayer(this.currentPlayer != null ? new PlayerDto(this.currentPlayer) : null);
        dto.setCurrentBid(this.currentBid);
        dto.setLeadingTeam(this.leadingTeam != null ? new TeamDto(this.leadingTeam) : null);
        dto.setTimeRemaining(this.timeRemaining);
        dto.setTeams(this.teams.stream().map(TeamDto::new).collect(Collectors.toList()));
        dto.setFinished(this.finished);
        dto.setStatusMessage(this.statusMessage);
        return dto;
    }

    public String getRoomCode() { return roomCode; }
    public Long getRoomId() { return roomId; }
    public boolean isActive() { return active; }
    public boolean isFinished() { return finished; }
    public Player getCurrentPlayer() { return currentPlayer; }
    public Team getLeadingTeam() { return leadingTeam; }
    public Integer getCurrentBid() { return currentBid; }
    public ScheduledFuture<?> getTimerTask() { return timerTask; }
    public void setTimerTask(ScheduledFuture<?> timerTask) { this.timerTask = timerTask; }
    
    public void updateTeamBudget(Long teamId, int newBudget) {
        this.teams.stream()
            .filter(t -> t.getId().equals(teamId))
            .findFirst()
            .ifPresent(t -> t.setBudgetRemaining(newBudget));
    }
}
