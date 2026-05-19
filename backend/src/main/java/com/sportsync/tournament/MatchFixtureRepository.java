package com.sportsync.tournament;

import com.sportsync.domain.MatchFixture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchFixtureRepository extends JpaRepository<MatchFixture, Long> {
    List<MatchFixture> findByTournamentId(Long tournamentId);
    List<MatchFixture> findByTournamentIdAndPhaseNumberAndGroupNumber(Long tournamentId, Integer phaseNumber, Integer groupNumber);

    long countByTournamentIdAndPhaseNumberAndGroupNumberAndRoundAndStatus(
            Long tournamentId, Integer phaseNumber, Integer groupNumber,
            MatchFixture.MatchRound round, MatchFixture.MatchStatus status);

    List<MatchFixture> findByTournamentIdAndPhaseNumberAndRound(
            Long tournamentId, Integer phaseNumber, MatchFixture.MatchRound round);

    List<MatchFixture> findByTournamentIdAndRoundIn(
            Long tournamentId, List<MatchFixture.MatchRound> rounds);
}
