package com.sportsync.tournament;

import com.sportsync.domain.Standing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StandingRepository extends JpaRepository<Standing, Long> {
    List<Standing> findByTournamentId(Long tournamentId);
    
    @org.springframework.data.jpa.repository.Query("SELECT s FROM Standing s WHERE s.tournamentId = :tournamentId AND s.phaseNumber = :phaseNumber AND s.groupNumber = :groupNumber ORDER BY s.points DESC, (s.goalsFor - s.goalsAgainst) DESC, s.goalsFor DESC")
    List<Standing> findByTournamentIdAndPhaseNumberAndGroupNumberOrderByPointsDescGoalDifferenceDescGoalsForDesc(@org.springframework.data.repository.query.Param("tournamentId") Long tournamentId, @org.springframework.data.repository.query.Param("phaseNumber") Integer phaseNumber, @org.springframework.data.repository.query.Param("groupNumber") Integer groupNumber);
    
    Optional<Standing> findByTournamentIdAndTeamIdAndPhaseNumberAndGroupNumber(Long tournamentId, Long teamId, Integer phaseNumber, Integer groupNumber);

    Optional<Standing> findFirstByTournamentIdAndTeamIdAndPhaseNumber(Long tournamentId, Long teamId, Integer phaseNumber);
}
