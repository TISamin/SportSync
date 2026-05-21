import axios from 'axios';

const API_URL = 'http://localhost:8080/api/cricket/match';
const STATS_API_URL = 'http://localhost:8080/api/tournament';

export const setupToss = async (matchId, tossWinnerId, tossDecision) => {
    const response = await axios.post(`${API_URL}/${matchId}/toss`, { tossWinnerId, tossDecision });
    return response.data;
};

export const startInnings = async (matchId, strikerId, nonStrikerId, currentBowlerId) => {
    const response = await axios.post(`${API_URL}/${matchId}/innings/start`, { strikerId, nonStrikerId, currentBowlerId });
    return response.data;
};

export const submitBall = async (matchId, data) => {
    const response = await axios.post(`${API_URL}/${matchId}/ball`, data);
    return response.data;
};

export const swapStriker = async (matchId) => {
    const response = await axios.post(`${API_URL}/${matchId}/swap`);
    return response.data;
};

export const setNextBatsman = async (matchId, playerId) => {
    const response = await axios.post(`${API_URL}/${matchId}/next-batsman`, { playerId });
    return response.data;
};

export const setNextBowler = async (matchId, playerId) => {
    const response = await axios.post(`${API_URL}/${matchId}/next-bowler`, { playerId });
    return response.data;
};

export const getMatchState = async (matchId) => {
    const response = await axios.get(`${API_URL}/${matchId}/state`);
    return response.data;
};

export const getScorecard = async (matchId) => {
    const response = await axios.get(`${API_URL}/${matchId}/scorecard`);
    return response.data;
};

export const getCricketTopScorers = async (tournamentId) => {
    const response = await axios.get(`${STATS_API_URL}/${tournamentId}/stats/cricket/top-scorers`);
    return response.data;
};

export const getCricketTopWicketTakers = async (tournamentId) => {
    const response = await axios.get(`${STATS_API_URL}/${tournamentId}/stats/cricket/top-wickets`);
    return response.data;
};
