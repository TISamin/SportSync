export default function PlayerCard({ player }) {
    if (!player) {
        return (
            <div className="w-full h-96 flex items-center justify-center bg-surface rounded-xl shadow-2xl border border-border">
                <span className="text-muted text-xl font-semibold tracking-wider">NO PLAYER SELECTED</span>
            </div>
        );
    }

    return (
        <div className="w-full bg-surface rounded-xl shadow-2xl overflow-hidden border border-border relative">
            <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest z-10">
                {player.category}
            </div>
            <div className="absolute top-4 left-4 bg-input text-muted text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest z-10 border border-border/40">
                No. {player.playerNumber || '-'}
            </div>
            
            <div className="h-64 bg-input relative overflow-hidden flex justify-center items-center">
                {player.imageUrl ? (
                    <img src={player.imageUrl} alt={player.name} className="h-full object-cover" />
                ) : (
                    <div className="text-muted text-6xl">⚽</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
            </div>
            
            <div className="p-6 text-center">
                <h2 className="text-3xl font-black text-txt mb-2 uppercase tracking-wide">{player.name}</h2>
                <div className="flex justify-center items-center space-x-4 text-sm text-muted mb-6">
                    <span className="bg-input px-3 py-1 rounded-md">{player.role}</span>
                    <span className="bg-input px-3 py-1 rounded-md">{player.age ? `${player.age} yrs` : 'N/A'}</span>
                    {player.style && <span className="bg-input px-3 py-1 rounded-md">{player.style}</span>}
                </div>
                
                <div className="border-t border-border pt-4">
                    <p className="text-muted uppercase text-xs font-bold tracking-widest mb-1">Base Price</p>
                    <p className="text-2xl font-black text-green-600 dark:text-green-400">${player.basePrice?.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}

