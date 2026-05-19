import { useAuctionStore } from '../store/auctionStore';

export default function TeamRoster() {
    const { teams, myTeamId } = useAuctionStore();

    // Sort teams by budget descending
    const sortedTeams = [...teams].sort((a, b) => b.budgetRemaining - a.budgetRemaining);

    return (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-white font-black text-xl mb-6 uppercase tracking-widest border-b border-gray-800 pb-4">Teams & Budgets</h3>
            
            <div className="space-y-4">
                {sortedTeams.map(team => {
                    const isMe = team.id === myTeamId;
                    return (
                        <div 
                            key={team.id} 
                            className={`p-4 rounded-lg flex justify-between items-center transition-colors ${
                                isMe ? 'bg-indigo-900/30 border border-indigo-500/30' : 'bg-gray-800'
                            }`}
                        >
                            <div>
                                <p className="text-white font-bold">{team.name} {isMe && <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded ml-2">YOU</span>}</p>
                                <p className="text-gray-400 text-xs">{team.ownerName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-green-400 font-black text-lg">${team.budgetRemaining?.toLocaleString()}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
