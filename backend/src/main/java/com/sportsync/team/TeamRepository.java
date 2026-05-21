package com.sportsync.team;

import com.sportsync.domain.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByAuctionRoomId(Long auctionRoomId);
    List<Team> findByAuctionRoomIdOrderByBudgetRemainingAsc(Long auctionRoomId);
}
