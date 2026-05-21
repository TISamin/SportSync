package com.sportsync.auction;

import com.sportsync.domain.AuctionRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuctionRoomRepository extends JpaRepository<AuctionRoom, Long> {
    Optional<AuctionRoom> findByRoomCode(String roomCode);
}
