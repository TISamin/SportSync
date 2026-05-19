package com.sportsync.auction;

import com.sportsync.domain.AuctionRoom;
import com.sportsync.domain.Team;
import com.sportsync.dto.AuctionRoomDto;
import com.sportsync.dto.TeamDto;
import com.sportsync.team.TeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuctionService {

    private final AuctionRoomRepository auctionRoomRepository;
    private final TeamRepository teamRepository;
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    public AuctionService(AuctionRoomRepository auctionRoomRepository, TeamRepository teamRepository) {
        this.auctionRoomRepository = auctionRoomRepository;
        this.teamRepository = teamRepository;
    }

    @Transactional
    public AuctionRoomDto createRoom(Integer budgetPerTeam, Integer maxTeams) {
        String roomCode = generateUniqueRoomCode();
        AuctionRoom room = new AuctionRoom(roomCode, budgetPerTeam, maxTeams);
        room = auctionRoomRepository.save(room);
        return new AuctionRoomDto(room);
    }

    @Transactional
    public TeamDto joinRoom(String roomCode, String teamName, String ownerName) {
        AuctionRoom room = getRoomByCode(roomCode);

        if (room.getStatus() != AuctionRoom.AuctionRoomStatus.WAITING) {
            throw new IllegalArgumentException("Cannot join room that has already started or finished");
        }

        List<Team> existingTeams = teamRepository.findByAuctionRoomId(room.getId());
        if (existingTeams.size() >= room.getMaxTeams()) {
            throw new IllegalArgumentException("Room is full. Maximum " + room.getMaxTeams() + " teams allowed.");
        }

        boolean teamNameExists = existingTeams.stream()
                .anyMatch(t -> t.getName().equalsIgnoreCase(teamName));
        if (teamNameExists) {
            throw new IllegalArgumentException("Team name already exists in this room");
        }

        Team team = new Team(teamName, ownerName, room.getId(), room.getBudgetPerTeam());
        team = teamRepository.save(team);
        return new TeamDto(team);
    }

    @Transactional(readOnly = true)
    public AuctionRoomDto getRoomState(String roomCode) {
        return new AuctionRoomDto(getRoomByCode(roomCode));
    }

    @Transactional(readOnly = true)
    public List<TeamDto> getRoomTeams(String roomCode) {
        AuctionRoom room = getRoomByCode(roomCode);
        return teamRepository.findByAuctionRoomId(room.getId())
                .stream()
                .map(TeamDto::new)
                .collect(Collectors.toList());
    }

    private AuctionRoom getRoomByCode(String roomCode) {
        return auctionRoomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new IllegalArgumentException("Room not found with code: " + roomCode));
    }

    private String generateUniqueRoomCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
            }
            code = sb.toString();
        } while (auctionRoomRepository.findByRoomCode(code).isPresent());
        return code;
    }
}
