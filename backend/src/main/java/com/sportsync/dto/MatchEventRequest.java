package com.sportsync.dto;

import com.sportsync.domain.MatchEvent;

public class MatchEventRequest {
    private Long playerId;
    private Long teamId;
    private MatchEvent.EventType eventType;
    private Integer minute;

    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long playerId) { this.playerId = playerId; }
    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }
    public MatchEvent.EventType getEventType() { return eventType; }
    public void setEventType(MatchEvent.EventType eventType) { this.eventType = eventType; }
    public Integer getMinute() { return minute; }
    public void setMinute(Integer minute) { this.minute = minute; }
}
