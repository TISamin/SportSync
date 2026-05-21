package com.sportsync.stats;

import com.sportsync.domain.MatchEvent;
import com.sportsync.dto.PlayerStatDto;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StatsService {

    private final EntityManager entityManager;

    public StatsService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Transactional(readOnly = true)
    public List<PlayerStatDto> getTopStats(Long tournamentId, MatchEvent.EventType eventType) {
        String query = """
            SELECT new com.sportsync.dto.PlayerStatDto(
                p.id, p.name, t.name, p.imageUrl, COUNT(e.id)
            )
            FROM MatchEvent e
            JOIN MatchFixture f ON e.matchId = f.id
            JOIN Player p ON e.playerId = p.id
            JOIN Team t ON e.teamId = t.id
            WHERE f.tournamentId = :tournamentId AND e.eventType = :eventType
            GROUP BY p.id, p.name, t.name, p.imageUrl
            ORDER BY COUNT(e.id) DESC
            """;

        return entityManager.createQuery(query, PlayerStatDto.class)
                .setParameter("tournamentId", tournamentId)
                .setParameter("eventType", eventType)
                .setMaxResults(10)
                .getResultList();
    }

    @Transactional(readOnly = true)
    public List<com.sportsync.dto.CricketPlayerStatDto> getTopCricketScorers(Long tournamentId) {
        String query = """
            SELECT new com.sportsync.dto.CricketPlayerStatDto(
                p.id, p.name, t.name, p.imageUrl, s.totalRuns, s.totalBallsFaced, s.totalFours, s.totalSixes, s.totalWickets, s.totalOversBowled, s.totalRunsConceded
            )
            FROM TournamentPlayerStat s
            JOIN Player p ON s.playerId = p.id
            JOIN Team t ON s.teamId = t.id
            WHERE s.tournamentId = :tournamentId
            ORDER BY s.totalRuns DESC
            """;

        return entityManager.createQuery(query, com.sportsync.dto.CricketPlayerStatDto.class)
                .setParameter("tournamentId", tournamentId)
                .setMaxResults(10)
                .getResultList();
    }

    @Transactional(readOnly = true)
    public List<com.sportsync.dto.CricketPlayerStatDto> getTopCricketWicketTakers(Long tournamentId) {
        String query = """
            SELECT new com.sportsync.dto.CricketPlayerStatDto(
                p.id, p.name, t.name, p.imageUrl, s.totalRuns, s.totalBallsFaced, s.totalFours, s.totalSixes, s.totalWickets, s.totalOversBowled, s.totalRunsConceded
            )
            FROM TournamentPlayerStat s
            JOIN Player p ON s.playerId = p.id
            JOIN Team t ON s.teamId = t.id
            WHERE s.tournamentId = :tournamentId
            ORDER BY s.totalWickets DESC
            """;

        return entityManager.createQuery(query, com.sportsync.dto.CricketPlayerStatDto.class)
                .setParameter("tournamentId", tournamentId)
                .setMaxResults(10)
                .getResultList();
    }
}
