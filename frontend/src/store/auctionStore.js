import { create } from 'zustand';

export const useAuctionStore = create((set) => ({
    roomCode: null,
    roomId: null,
    myTeamId: null,
    isAdmin: false,
    
    // Live State
    currentPlayer: null,
    currentBid: 0,
    leadingTeam: null,
    timeRemaining: 30,
    teams: [],
    isFinished: false,
    statusMessage: 'Waiting for auction to start...',

    setRoomInfo: (code, id, isAdmin = false) => set({ roomCode: code, roomId: id, isAdmin }),
    setMyTeamId: (id) => set({ myTeamId: id }),
    
    updateState: (stateUpdate) => set((state) => ({
        ...state,
        currentPlayer: stateUpdate.currentPlayer !== undefined ? stateUpdate.currentPlayer : state.currentPlayer,
        currentBid: stateUpdate.currentBid !== undefined ? stateUpdate.currentBid : state.currentBid,
        leadingTeam: stateUpdate.leadingTeam !== undefined ? stateUpdate.leadingTeam : state.leadingTeam,
        timeRemaining: stateUpdate.timeRemaining !== undefined ? stateUpdate.timeRemaining : state.timeRemaining,
        teams: stateUpdate.teams || state.teams,
        isFinished: stateUpdate.isFinished !== undefined ? stateUpdate.isFinished : state.isFinished,
        statusMessage: stateUpdate.statusMessage || state.statusMessage,
    })),
    
    reset: () => set({
        roomCode: null, roomId: null, myTeamId: null, isAdmin: false,
        currentPlayer: null, currentBid: 0, leadingTeam: null, timeRemaining: 30,
        teams: [], isFinished: false, statusMessage: 'Waiting for auction to start...'
    })
}));
