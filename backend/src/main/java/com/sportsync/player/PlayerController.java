package com.sportsync.player;

import com.sportsync.dto.ApiResponse;
import com.sportsync.dto.PlayerDto;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @PostMapping("/import")
    public ApiResponse<List<PlayerDto>> importPlayers(
            @RequestParam("roomId") Long roomId,
            @RequestParam("file") MultipartFile file) {
        
        List<PlayerDto> savedPlayers = playerService.importPlayers(roomId, file)
                .stream()
                .map(PlayerDto::new)
                .collect(Collectors.toList());
                
        return ApiResponse.success(savedPlayers);
    }

    @GetMapping
    public ApiResponse<List<PlayerDto>> getPlayersByRoom(@RequestParam("roomId") Long roomId) {
        List<PlayerDto> players = playerService.getPlayersByRoomId(roomId)
                .stream()
                .map(PlayerDto::new)
                .collect(Collectors.toList());
                
        return ApiResponse.success(players);
    }
}
