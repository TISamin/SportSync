package com.sportsync.cricket;

import com.sportsync.domain.TournamentPlayerStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TournamentPlayerStatRepository extends JpaRepository<TournamentPlayerStat, Long> {
    List<TournamentPlayerStat> findByTournamentId(Long tournamentId);
    Optional<TournamentPlayerStat> findByTournamentIdAndPlayerId(Long tournamentId, Long playerId);
    List<TournamentPlayerStat> findByTournamentIdOrderByTotalRunsDesc(Long tournamentId);
    List<TournamentPlayerStat> findByTournamentIdOrderByTotalWicketsDesc(Long tournamentId);
}
