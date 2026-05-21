package com.sportsync.cricket;

import com.sportsync.domain.BattingScorecard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BattingScorecardRepository extends JpaRepository<BattingScorecard, Long> {
    List<BattingScorecard> findByInningsId(Long inningsId);
    Optional<BattingScorecard> findByInningsIdAndPlayerId(Long inningsId, Long playerId);
}
