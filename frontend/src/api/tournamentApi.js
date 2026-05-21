import axios from 'axios';

const API_URL = 'http://localhost:8080/api/tournament';

export const createTournament = async (name, type, teamIds, sport = 'FOOTBALL', overs = null) => {
    const response = await axios.post(API_URL, { name, type, teamIds, sport, overs });
    return response.data;
};

export const getTournament = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const getTournamentFixtures = async (id) => {
    const response = await axios.get(`${API_URL}/${id}/fixtures`);
    return response.data;
};

export const saveMatchResult = async (id, matchId, homeScore, awayScore, events) => {
    const response = await axios.post(`${API_URL}/${id}/match/${matchId}/result`, {
        homeScore,
        awayScore,
        events
    });
    return response.data;
};

export const getTournamentStandings = async (id, phase = 1, group = 1) => {
    const response = await axios.get(`${API_URL}/${id}/standings`, {
        params: { phase, group }
    });
    return response.data;
};

export const generateKnockout = async (id) => {
    const response = await axios.post(`${API_URL}/${id}/generate-knockout`);
    return response.data;
};

export const getKnockoutFixtures = async (id) => {
    const response = await axios.get(`${API_URL}/${id}/knockout`);
    return response.data;
};

export const getTournamentResult = async (id) => {
    const response = await axios.get(`${API_URL}/${id}/result`);
    return response.data;
};

export const getTopScorers = async (id) => {
    const response = await axios.get(`${API_URL}/${id}/stats/top-scorers`);
    return response.data;
};

export const getTopAssisters = async (id) => {
    const response = await axios.get(`${API_URL}/${id}/stats/top-assisters`);
    return response.data;
};

export const getTournamentTeams = async (id) => {
    const response = await axios.get(`${API_URL}/${id}/teams`);
    return response.data;
};

export const generatePhase2 = async (id) => {
    const response = await axios.post(`${API_URL}/${id}/generate-phase2`);
    return response.data;
};

export const generatePhase2Knockout = async (id) => {
    const response = await axios.post(`${API_URL}/${id}/generate-phase2-knockout`);
    return response.data;
};
