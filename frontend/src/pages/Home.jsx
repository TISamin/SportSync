import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <div className="text-center mb-12">
                <h1 className="text-6xl font-black text-white tracking-tighter mb-4">
                    Sport<span className="text-indigo-500">Sync</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-lg mx-auto">The ultimate platform for sports auction and tournament management.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                <Link to="/admin/auction/setup" className="group">
                    <div className="bg-gray-900 border border-gray-800 hover:border-indigo-500 rounded-2xl p-8 h-full transition-all hover:shadow-[0_0_30px_rgba(79,70,229,0.2)]">
                        <div className="text-5xl mb-4">🔨</div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2 group-hover:text-indigo-400 transition-colors">Auction Module</h2>
                        <p className="text-gray-400">Upload players, create a room, and host a live real-time bidding war.</p>
                    </div>
                </Link>

                <Link to="/tournament/setup" className="group">
                    <div className="bg-gray-900 border border-gray-800 hover:border-green-500 rounded-2xl p-8 h-full transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                        <div className="text-5xl mb-4">🏆</div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2 group-hover:text-green-400 transition-colors">Tournament Module</h2>
                        <p className="text-gray-400">Manage fixtures, points tables, and knockouts for single or double phase tournaments.</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
