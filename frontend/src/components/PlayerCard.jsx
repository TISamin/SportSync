export default function PlayerCard({ player }) {
    if (!player) {
        return (
            <div className="w-full h-96 flex items-center justify-center bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
                <span className="text-gray-500 text-xl font-semibold tracking-wider">NO PLAYER SELECTED</span>
            </div>
        );
    }

    return (
        <div className="w-full bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-800 relative">
            <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest z-10">
                {player.category}
            </div>
            <div className="absolute top-4 left-4 bg-gray-800 text-gray-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest z-10">
                No. {player.playerNumber || '-'}
            </div>
            
            <div className="h-64 bg-gray-800 relative overflow-hidden flex justify-center items-center">
                {player.imageUrl ? (
                    <img src={player.imageUrl} alt={player.name} className="h-full object-cover" />
                ) : (
                    <div className="text-gray-600 text-6xl">⚽</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
            </div>
            
            <div className="p-6 text-center">
                <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-wide">{player.name}</h2>
                <div className="flex justify-center items-center space-x-4 text-sm text-gray-400 mb-6">
                    <span className="bg-gray-800 px-3 py-1 rounded-md">{player.role}</span>
                    <span className="bg-gray-800 px-3 py-1 rounded-md">{player.age ? `${player.age} yrs` : 'N/A'}</span>
                    {player.style && <span className="bg-gray-800 px-3 py-1 rounded-md">{player.style}</span>}
                </div>
                
                <div className="border-t border-gray-800 pt-4">
                    <p className="text-gray-500 uppercase text-xs font-bold tracking-widest mb-1">Base Price</p>
                    <p className="text-2xl font-black text-green-400">${player.basePrice?.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}
