package com.sportsync.tournament;

import com.sportsync.domain.Standing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StandingRepository extends JpaRepository<Standing, Long> {
    List<Standing> findByTournamentId(Long tournamentId);
    List<Standing> findByTournamentIdAndPhaseNumberAndGroupNumberOrderByPointsDescGoalDifferenceDescGoalsForDesc(Long tournamentId, Integer phaseNumber, Integer groupNumber);
    Optional<Standing> findByTournamentIdAndTeamIdAndPhaseNumberAndGroupNumber(Long tournamentId, Long teamId, Integer phaseNumber, Integer groupNumber);
}
