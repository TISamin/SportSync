package com.sportsync.player;

import com.sportsync.domain.Player;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final CSVImportService csvImportService;

    public PlayerService(PlayerRepository playerRepository, CSVImportService csvImportService) {
        this.playerRepository = playerRepository;
        this.csvImportService = csvImportService;
    }

    @Transactional
    public List<Player> importPlayers(Long roomId, MultipartFile file) {
        List<Player> players = csvImportService.parsePlayersCsv(file, roomId);
        return playerRepository.saveAll(players);
    }

    @Transactional(readOnly = true)
    public List<Player> getPlayersByRoomId(Long roomId) {
        return playerRepository.findByAuctionRoomId(roomId);
    }
}
