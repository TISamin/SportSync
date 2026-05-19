package com.sportsync.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public class MatchResultRequest {
    @NotNull
    private Integer homeScore;
    @NotNull
    private Integer awayScore;

    private List<MatchEventRequest> events;

    public Integer getHomeScore() { return homeScore; }
    public void setHomeScore(Integer homeScore) { this.homeScore = homeScore; }
    public Integer getAwayScore() { return awayScore; }
    public void setAwayScore(Integer awayScore) { this.awayScore = awayScore; }
    public List<MatchEventRequest> getEvents() { return events; }
    public void setEvents(List<MatchEventRequest> events) { this.events = events; }
}
