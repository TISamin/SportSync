package com.sportsync.auction;

import com.sportsync.dto.ActionRequest;
import com.sportsync.dto.BidRequest;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class AuctionWebSocketController {

    private final AuctionManager auctionManager;

    public AuctionWebSocketController(AuctionManager auctionManager) {
        this.auctionManager = auctionManager;
    }

    @MessageMapping("/auction/start")
    public void startAuction(ActionRequest request) {
        auctionManager.startAuction(request.getRoomCode());
    }

    @MessageMapping("/auction/next")
    public void nextPlayer(ActionRequest request) {
        auctionManager.nextPlayer(request.getRoomCode());
    }

    @MessageMapping("/auction/bid")
    public void placeBid(BidRequest request) {
        auctionManager.placeBid(request.getRoomCode(), request.getTeamId(), request.getAmount());
    }
}
