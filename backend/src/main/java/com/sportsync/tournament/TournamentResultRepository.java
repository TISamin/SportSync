package com.sportsync.tournament;

import com.sportsync.domain.TournamentResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TournamentResultRepository extends JpaRepository<TournamentResult, Long> {
    Optional<TournamentResult> findByTournamentId(Long tournamentId);
}
