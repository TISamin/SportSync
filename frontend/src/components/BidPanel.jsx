import { useAuctionStore } from '../store/auctionStore';

export default function BidPanel({ onBid }) {
    const { currentPlayer, currentBid, leadingTeam, myTeamId, isAdmin, isFinished } = useAuctionStore();

    if (isFinished || !currentPlayer) return null;

    const isLeading = leadingTeam && leadingTeam.id === myTeamId;
    
    // Calculate required bid
    let requiredBid = currentBid;
    if (leadingTeam) {
        requiredBid += 10;
    } else {
        if (requiredBid === 0) {
            requiredBid = 10; // min bid if base price is 0
        }
    }

    const handleBid = () => {
        if (!isAdmin && myTeamId && !isLeading) {
            onBid(myTeamId, requiredBid);
        }
    };

    return (
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex flex-col items-center justify-center space-y-4">
            <div className="text-center">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Current Bid</p>
                <p className="text-5xl font-black text-white">${currentBid.toLocaleString()}</p>
            </div>
            
            <div className="h-8">
                {leadingTeam ? (
                    <p className="text-indigo-400 font-medium">
                        Leading: <span className="font-bold text-white">{leadingTeam.name}</span>
                    </p>
                ) : (
                    <p className="text-gray-500 font-medium">No bids yet</p>
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
