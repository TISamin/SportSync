package com.sportsync.dto;

import com.sportsync.domain.CricketMatchState.CricketMatchStatus;
import com.sportsync.domain.CricketMatchState.TossDecision;
import java.util.List;

public class CricketMatchStateDto {

    private Long matchId;
    private Integer inningsNumber;
    private Long strikerId;
    private String strikerName;
    private Integer strikerRuns;
    private Integer strikerBalls;
    private Long nonStrikerId;
    private String nonStrikerName;
    private Integer nonStrikerRuns;
    private Integer nonStrikerBalls;
    private Long currentBowlerId;
    private String currentBowlerName;
    private Double currentBowlerOvers;
    private Integer currentBowlerRuns;
    private Integer currentBowlerWickets;
    private Integer legalBallsInCurrentOver;
    private Boolean isFreeHitNext;
    private CricketMatchStatus status;
    private Long tossWinnerId;
    private String tossWinnerName;
    private TossDecision tossDecision;
    private Long battingTeamId;
    private String battingTeamName;
    private Long bowlingTeamId;
    private String bowlingTeamName;
    private Integer totalRuns;
    private Integer totalWickets;
    private Double totalOversBowled;
    private Integer extras;
    private Integer target;
    private Integer runsNeeded;
    private Integer ballsRemaining;
    private Double requiredRunRate;
    private Double currentRunRate;
    private List<String> recentBalls;
    private Integer maxOvers;

    public CricketMatchStateDto() {}

    // Getters and Setters
    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }

    public Integer getInningsNumber() { return inningsNumber; }
    public void setInningsNumber(Integer inningsNumber) { this.inningsNumber = inningsNumber; }

    public Long getStrikerId() { return strikerId; }
    public void setStrikerId(Long strikerId) { this.strikerId = strikerId; }

    public String getStrikerName() { return strikerName; }
    public void setStrikerName(String strikerName) { this.strikerName = strikerName; }

    public Integer getStrikerRuns() { return strikerRuns; }
    public void setStrikerRuns(Integer strikerRuns) { this.strikerRuns = strikerRuns; }

    public Integer getStrikerBalls() { return strikerBalls; }
    public void setStrikerBalls(Integer strikerBalls) { this.strikerBalls = strikerBalls; }

    public Long getNonStrikerId() { return nonStrikerId; }
    public void setNonStrikerId(Long nonStrikerId) { this.nonStrikerId = nonStrikerId; }

    public String getNonStrikerName() { return nonStrikerName; }
    public void setNonStrikerName(String nonStrikerName) { this.nonStrikerName = nonStrikerName; }

    public Integer getNonStrikerRuns() { return nonStrikerRuns; }
    public void setNonStrikerRuns(Integer nonStrikerRuns) { this.nonStrikerRuns = nonStrikerRuns; }

    public Integer getNonStrikerBalls() { return nonStrikerBalls; }
    public void setNonStrikerBalls(Integer nonStrikerBalls) { this.nonStrikerBalls = nonStrikerBalls; }

    public Long getCurrentBowlerId() { return currentBowlerId; }
    public void setCurrentBowlerId(Long currentBowlerId) { this.currentBowlerId = currentBowlerId; }

    public String getCurrentBowlerName() { return currentBowlerName; }
    public void setCurrentBowlerName(String currentBowlerName) { this.currentBowlerName = currentBowlerName; }

    public Double getCurrentBowlerOvers() { return currentBowlerOvers; }
    public void setCurrentBowlerOvers(Double currentBowlerOvers) { this.currentBowlerOvers = currentBowlerOvers; }

    public Integer getCurrentBowlerRuns() { return currentBowlerRuns; }
    public void setCurrentBowlerRuns(Integer currentBowlerRuns) { this.currentBowlerRuns = currentBowlerRuns; }

    public Integer getCurrentBowlerWickets() { return currentBowlerWickets; }
    public void setCurrentBowlerWickets(Integer currentBowlerWickets) { this.currentBowlerWickets = currentBowlerWickets; }

    public Integer getLegalBallsInCurrentOver() { return legalBallsInCurrentOver; }
    public void setLegalBallsInCurrentOver(Integer legalBallsInCurrentOver) { this.legalBallsInCurrentOver = legalBallsInCurrentOver; }

    public Boolean getIsFreeHitNext() { return isFreeHitNext; }
    public void setIsFreeHitNext(Boolean isFreeHitNext) { this.isFreeHitNext = isFreeHitNext; }

    public CricketMatchStatus getStatus() { return status; }
    public void setStatus(CricketMatchStatus status) { this.status = status; }

    public Long getTossWinnerId() { return tossWinnerId; }
    public void setTossWinnerId(Long tossWinnerId) { this.tossWinnerId = tossWinnerId; }

    public String getTossWinnerName() { return tossWinnerName; }
    public void setTossWinnerName(String tossWinnerName) { this.tossWinnerName = tossWinnerName; }

    public TossDecision getTossDecision() { return tossDecision; }
    public void setTossDecision(TossDecision tossDecision) { this.tossDecision = tossDecision; }

    public Long getBattingTeamId() { return battingTeamId; }
    public void setBattingTeamId(Long battingTeamId) { this.battingTeamId = battingTeamId; }

    public String getBattingTeamName() { return battingTeamName; }
    public void setBattingTeamName(String battingTeamName) { this.battingTeamName = battingTeamName; }

    public Long getBowlingTeamId() { return bowlingTeamId; }
    public void setBowlingTeamId(Long bowlingTeamId) { this.bowlingTeamId = bowlingTeamId; }

    public String getBowlingTeamName() { return bowlingTeamName; }
    public void setBowlingTeamName(String bowlingTeamName) { this.bowlingTeamName = bowlingTeamName; }

    public Integer getTotalRuns() { return totalRuns; }
    public void setTotalRuns(Integer totalRuns) { this.totalRuns = totalRuns; }

    public Integer getTotalWickets() { return totalWickets; }
    public void setTotalWickets(Integer totalWickets) { this.totalWickets = totalWickets; }

    public Double getTotalOversBowled() { return totalOversBowled; }
    public void setTotalOversBowled(Double totalOversBowled) { this.totalOversBowled = totalOversBowled; }

    public Integer getExtras() { return extras; }
    public void setExtras(Integer extras) { this.extras = extras; }

    public Integer getTarget() { return target; }
    public void setTarget(Integer target) { this.target = target; }

    public Integer getRunsNeeded() { return runsNeeded; }
    public void setRunsNeeded(Integer runsNeeded) { this.runsNeeded = runsNeeded; }

    public Integer getBallsRemaining() { return ballsRemaining; }
    public void setBallsRemaining(Integer ballsRemaining) { this.ballsRemaining = ballsRemaining; }

    public Double getRequiredRunRate() { return requiredRunRate; }
    public void setRequiredRunRate(Double requiredRunRate) { this.requiredRunRate = requiredRunRate; }

    public Double getCurrentRunRate() { return currentRunRate; }
    public void setCurrentRunRate(Double currentRunRate) { this.currentRunRate = currentRunRate; }

    public List<String> getRecentBalls() { return recentBalls; }
    public void setRecentBalls(List<String> recentBalls) { this.recentBalls = recentBalls; }

    public Integer getMaxOvers() { return maxOvers; }
    public void setMaxOvers(Integer maxOvers) { this.maxOvers = maxOvers; }
}
