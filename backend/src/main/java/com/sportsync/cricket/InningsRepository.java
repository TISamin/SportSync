package com.sportsync.cricket;

import com.sportsync.domain.Innings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InningsRepository extends JpaRepository<Innings, Long> {
    List<Innings> findByMatchId(Long matchId);
    Optional<Innings> findByMatchIdAndInningsNumber(Long matchId, Integer inningsNumber);
    Optional<Innings> findByMatchIdAndInningsNumberAndIsSuperOver(Long matchId, Integer inningsNumber, Boolean isSuperOver);
}
