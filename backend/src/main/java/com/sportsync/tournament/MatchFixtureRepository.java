package com.sportsync.tournament;

import com.sportsync.domain.MatchFixture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchFixtureRepository extends JpaRepository<MatchFixture, Long> {
    List<MatchFixture> findByTournamentId(Long tournamentId);
    List<MatchFixture> findByTournamentIdAndPhaseNumberAndGroupNumber(Long tournamentId, Integer phaseNumber, Integer groupNumber);
}
