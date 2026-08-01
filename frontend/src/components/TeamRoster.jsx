import { useAuctionStore } from '../store/auctionStore';

export default function TeamRoster() {
    const { teams, myTeamId } = useAuctionStore();

    // Sort teams by budget descending
    const sortedTeams = [...teams].sort((a, b) => b.budgetRemaining - a.budgetRemaining);

    return (
        <div className="bg-surface rounded-xl border border-border p-6 max-h-[80vh] overflow-y-auto shadow-md">
            <h3 className="text-txt font-black text-xl mb-6 uppercase tracking-widest border-b border-border pb-4">Teams & Budgets</h3>
            
            <div className="space-y-4">
                {sortedTeams.map(team => {
                    const isMe = team.id === myTeamId;
                    return (
                        <div 
                            key={team.id} 
                            className={`p-4 rounded-lg flex justify-between items-center transition-colors border ${
                                isMe ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-input border-transparent'
                            }`}
                        >
                            <div>
                                <p className="text-txt font-bold">{team.name} {isMe && <span className="text-xs bg-indigo-655 dark:bg-indigo-600 text-white px-2 py-0.5 rounded ml-2">YOU</span>}</p>
                                <p className="text-muted text-xs">{team.ownerName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-green-600 dark:text-green-400 font-black text-lg">${team.budgetRemaining?.toLocaleString()}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

