import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auction/room';

export const createRoom = async (budgetPerTeam, maxTeams = 8) => {
    const response = await axios.post(API_URL, { budgetPerTeam, maxTeams });
    return response.data;
};

export const joinRoom = async (roomCode, teamName, ownerName) => {
    const response = await axios.post(`${API_URL}/${roomCode}/join`, { teamName, ownerName });
    return response.data;
};

export const getRoomState = async (roomCode) => {
    const response = await axios.get(`${API_URL}/${roomCode}`);
    return response.data;
};

export const getRoomTeams = async (roomCode) => {
    const response = await axios.get(`${API_URL}/${roomCode}/teams`);
    return response.data;
};
