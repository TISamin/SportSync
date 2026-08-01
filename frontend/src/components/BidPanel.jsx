import { useAuctionStore } from '../store/auctionStore';

export default function BidPanel({ onBid }) {
    const { currentPlayer, currentBid, leadingTeam, myTeamId, isAdmin, isFinished } = useAuctionStore();

    if (isFinished || !currentPlayer) return null;

    const isLeading = leadingTeam && leadingTeam.id === myTeamId;
    
    // Calculate required bid: first bid starts at base price, subsequent bids increment by 10% of base price
    const basePrice = currentPlayer.basePrice || 0;
    const increment = Math.max(10, Math.round(basePrice * 0.10));
    
    let requiredBid = currentBid;
    if (leadingTeam) {
        requiredBid += increment;
    } else {
        if (requiredBid === 0) {
            requiredBid = increment; // min bid if base price is 0
        }
    }

    const handleBid = () => {
        if (!isAdmin && myTeamId && !isLeading) {
            onBid(myTeamId, requiredBid);
        }
    };

    return (
        <div className="bg-surface p-6 rounded-xl border border-border flex flex-col items-center justify-center space-y-4 shadow-md">
            <div className="text-center">
                <p className="text-muted text-sm font-bold uppercase tracking-widest mb-1">Current Bid</p>
                <p className="text-5xl font-black text-txt">${currentBid.toLocaleString()}</p>
            </div>
            
            <div className="h-8">
                {leadingTeam ? (
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                        Leading: <span className="font-bold text-txt">{leadingTeam.name}</span>
                    </p>
                ) : (
                    <p className="text-muted font-medium">No bids yet</p>
                )}
            </div>


            {!isAdmin && (
                <button
                    onClick={handleBid}
                    disabled={isLeading}
                    className={`w-full py-4 rounded-lg font-black text-xl uppercase tracking-wider transition-all transform active:scale-95 ${
                        isLeading
                            ? 'bg-green-600 text-white opacity-80 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]'
                    }`}
                >
                    {isLeading ? 'You are leading' : `Bid $${requiredBid.toLocaleString()}`}
                </button>
            )}
        </div>
    );
}
