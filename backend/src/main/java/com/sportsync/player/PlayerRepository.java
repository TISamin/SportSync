package com.sportsync.player;

import com.sportsync.domain.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
    List<Player> findByAuctionRoomId(Long auctionRoomId);
    List<Player> findByAuctionRoomIdAndStatus(Long auctionRoomId, Player.PlayerStatus status);
}
