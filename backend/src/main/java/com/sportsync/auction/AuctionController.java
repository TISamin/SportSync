package com.sportsync.auction;

import com.sportsync.dto.ApiResponse;
import com.sportsync.dto.AuctionRoomDto;
import com.sportsync.dto.CreateRoomRequest;
import com.sportsync.dto.JoinRoomRequest;
import com.sportsync.dto.TeamDto;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auction/room")
public class AuctionController {

    private final AuctionService auctionService;

    public AuctionController(AuctionService auctionService) {
        this.auctionService = auctionService;
    }

    @PostMapping
    public ApiResponse<AuctionRoomDto> createRoom(@Valid @RequestBody CreateRoomRequest request) {
        AuctionRoomDto room = auctionService.createRoom(request.getBudgetPerTeam(), request.getMaxTeams());
        return ApiResponse.success(room);
    }

    @PostMapping("/{code}/join")
    public ApiResponse<TeamDto> joinRoom(@PathVariable String code, @Valid @RequestBody JoinRoomRequest request) {
        TeamDto team = auctionService.joinRoom(code, request.getTeamName(), request.getOwnerName());
        return ApiResponse.success(team);
    }

    @GetMapping("/{code}")
    public ApiResponse<AuctionRoomDto> getRoomState(@PathVariable String code) {
        AuctionRoomDto room = auctionService.getRoomState(code);
        return ApiResponse.success(room);
    }
    
    @GetMapping("/{code}/teams")
    public ApiResponse<List<TeamDto>> getRoomTeams(@PathVariable String code) {
        List<TeamDto> teams = auctionService.getRoomTeams(code);
        return ApiResponse.success(teams);
    }
}
