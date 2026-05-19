package com.sportsync.auction;

import com.sportsync.domain.AuctionRoom;
import com.sportsync.domain.Player;
import com.sportsync.domain.Team;
import com.sportsync.domain.TeamPlayer;
import com.sportsync.player.PlayerRepository;
import com.sportsync.team.TeamPlayerRepository;
import com.sportsync.team.TeamRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class AuctionManager {

    private final AuctionRoomRepository roomRepository;
    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final TeamPlayerRepository teamPlayerRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private final Map<String, LiveAuctionSession> activeSessions = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);

    public AuctionManager(AuctionRoomRepository roomRepository,
                          PlayerRepository playerRepository,
                          TeamRepository teamRepository,
                          TeamPlayerRepository teamPlayerRepository,
                          SimpMessagingTemplate messagingTemplate) {
        this.roomRepository = roomRepository;
        this.playerRepository = playerRepository;
        this.teamRepository = teamRepository;
        this.teamPlayerRepository = teamPlayerRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public void startAuction(String roomCode) {
        if (activeSessions.containsKey(roomCode)) return;

        AuctionRoom room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        
        if (room.getStatus() == AuctionRoom.AuctionRoomStatus.DONE) {
            throw new IllegalArgumentException("Auction already finished");
        }

        room.setStatus(AuctionRoom.AuctionRoomStatus.ACTIVE);
        roomRepository.save(room);

        List<Player> players = playerRepository.findByAuctionRoomIdAndStatus(room.getId(), Player.PlayerStatus.AVAILABLE);
        List<Team> teams = teamRepository.findByAuctionRoomId(room.getId());

        LiveAuctionSession session = new LiveAuctionSession(roomCode, room.getId(), players, teams);
        session.startNextPlayer();
        activeSessions.put(roomCode, session);

        startTimer(session);
        broadcastState(roomCode);
    }

    public void nextPlayer(String roomCode) {
        LiveAuctionSession session = activeSessions.get(roomCode);
        if (session == null) return;

        if (session.isActive()) return; // Must wait for current player to finish

        session.startNextPlayer();
        
        if (session.isFinished()) {
            endAuction(roomCode);
        } else {
            startTimer(session);
            broadcastState(roomCode);
        }
    }

    public void placeBid(String roomCode, Long teamId, Integer amount) {
        LiveAuctionSession session = activeSessions.get(roomCode);
        if (session == null || !session.isActive()) return;

        if (session.placeBid(teamId, amount)) {
            broadcastState(roomCode);
        }
    }

    private void startTimer(LiveAuctionSession session) {
        if (session.getTimerTask() != null) {
            session.getTimerTask().cancel(false);
        }

        Runnable timerRunnable = new Runnable() {
            @Override
            public void run() {
                session.decrementTime();
                if (session.isTimeUp()) {
                    session.getTimerTask().cancel(false);
                    processPlayerResult(session);
                } else {
                    broadcastState(session.getRoomCode());
                }
            }
        };

        session.setTimerTask(scheduler.scheduleAtFixedRate(timerRunnable, 1, 1, TimeUnit.SECONDS));
    }

    @Transactional
    protected void processPlayerResult(LiveAuctionSession session) {
        session.closeCurrentPlayer();
        
        Player player = session.getCurrentPlayer();
        Team winner = session.getLeadingTeam();
        
        if (winner != null) {
            player.setStatus(Player.PlayerStatus.SOLD);
            
            Team dbTeam = teamRepository.findById(winner.getId()).orElseThrow();
            dbTeam.setBudgetRemaining(dbTeam.getBudgetRemaining() - session.getCurrentBid());
            teamRepository.save(dbTeam);
            
            TeamPlayer teamPlayer = new TeamPlayer(dbTeam.getId(), player.getId(), session.getCurrentBid(), TeamPlayer.AcquiredVia.BID);
            teamPlayerRepository.save(teamPlayer);
            
            session.updateTeamBudget(winner.getId(), dbTeam.getBudgetRemaining());
            session.addAcquiredPlayer(winner.getId(), player, session.getCurrentBid());
        } else {
            player.setStatus(Player.PlayerStatus.UNSOLD);
        }
        
        playerRepository.save(player);
        broadcastState(session.getRoomCode());
    }

    @Transactional
    protected void endAuction(String roomCode) {
        LiveAuctionSession session = activeSessions.get(roomCode);
        if (session == null) return;
        
        AuctionRoom room = roomRepository.findById(session.getRoomId()).orElseThrow();
        
        // Distribute unsold players
        List<Player> unsoldPlayers = playerRepository.findByAuctionRoomIdAndStatus(room.getId(), Player.PlayerStatus.UNSOLD);
        List<Team> teams = teamRepository.findByAuctionRoomIdOrderByBudgetRemainingAsc(room.getId());
        
        if (!teams.isEmpty() && !unsoldPlayers.isEmpty()) {
            int teamIndex = 0;
            for (Player player : unsoldPlayers) {
                Team team = teams.get(teamIndex);
                
                player.setStatus(Player.PlayerStatus.SOLD);
                playerRepository.save(player);
                
                TeamPlayer teamPlayer = new TeamPlayer(team.getId(), player.getId(), 0, TeamPlayer.AcquiredVia.DISTRIBUTED);
                teamPlayerRepository.save(teamPlayer);
                
                teamIndex = (teamIndex + 1) % teams.size();
            }
        }
        
        room.setStatus(AuctionRoom.AuctionRoomStatus.DONE);
        roomRepository.save(room);
        
        activeSessions.remove(roomCode);
        
        // Notify frontend that auction is fully over
        messagingTemplate.convertAndSend("/topic/auction/" + roomCode + "/ended", "ENDED");
    }

    private void broadcastState(String roomCode) {
        LiveAuctionSession session = activeSessions.get(roomCode);
        if (session != null) {
            messagingTemplate.convertAndSend("/topic/auction/" + roomCode, session.toDto());
        }
    }
}
