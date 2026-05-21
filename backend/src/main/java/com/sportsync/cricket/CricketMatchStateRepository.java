package com.sportsync.cricket;

import com.sportsync.domain.CricketMatchState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CricketMatchStateRepository extends JpaRepository<CricketMatchState, Long> {
    Optional<CricketMatchState> findByMatchId(Long matchId);
}
