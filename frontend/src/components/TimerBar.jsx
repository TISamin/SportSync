import { useAuctionStore } from '../store/auctionStore';

export default function TimerBar() {
    const { timeRemaining, currentPlayer, isFinished } = useAuctionStore();

    if (isFinished || !currentPlayer) return null;

    const percentage = (timeRemaining / 30) * 100;
    
    // Color changes based on time left
    let bgColor = 'bg-green-500';
    let shadowColor = 'shadow-green-500/50';
    if (timeRemaining <= 10) {
        bgColor = 'bg-red-500';
        shadowColor = 'shadow-red-500/50';
    } else if (timeRemaining <= 20) {
        bgColor = 'bg-yellow-500';
        shadowColor = 'shadow-yellow-500/50';
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-2">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Time Remaining</span>
                <span className={`text-2xl font-black ${timeRemaining <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {timeRemaining}s
                </span>
            </div>
            <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${bgColor} shadow-[0_0_10px] ${shadowColor} transition-all duration-1000 ease-linear`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}
