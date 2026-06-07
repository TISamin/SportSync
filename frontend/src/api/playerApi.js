import axios from 'axios';
import { API_BASE_URL } from './config';

const API_URL = `${API_BASE_URL}/api/players`;

export const importPlayers = async (roomId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);
    
    const response = await axios.post(`${API_URL}/import`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getPlayersByRoom = async (roomId) => {
    const response = await axios.get(API_URL, { params: { roomId } });
    return response.data;
};
