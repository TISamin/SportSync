package com.sportsync.cricket;

import com.sportsync.domain.BallEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BallEventRepository extends JpaRepository<BallEvent, Long> {
    List<BallEvent> findByInningsId(Long inningsId);
    List<BallEvent> findByInningsIdOrderByOverNumberAscBallNumberAsc(Long inningsId);
}
