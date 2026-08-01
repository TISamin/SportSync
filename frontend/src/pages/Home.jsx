import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function Home() {
    const featuredPlayers = [
        { name: 'Lionel Messi', role: 'Forward', price: '$10,000,000', category: 'A', img: '/players/messi.png', style: 'Left Foot' },
        { name: 'Cristiano Ronaldo', role: 'Forward', price: '$9,000,000', category: 'A', img: '/players/ronaldo.png', style: 'Right Foot' },
        { name: 'Kylian Mbappe', role: 'Forward', price: '$8,000,000', category: 'B', img: '/players/mbappe.png', style: 'Right Foot' },
        { name: 'Erling Haaland', role: 'Forward', price: '$8,500,000', category: 'B', img: '/players/haaland.png', style: 'Left Foot' },
        { name: 'Jude Bellingham', role: 'Midfielder', price: '$7,500,000', category: 'B', img: '/players/bellingham.png', style: 'Right Foot' }
    ];

    return (
        <div className="min-h-screen bg-base text-txt flex flex-col justify-between transition-colors relative overflow-hidden">
            
            {/* Subtle tactical football pitch line watermark in the background */}
            <div className="absolute inset-0 pointer-events-none opacity-2 dark:opacity-[0.03] flex items-center justify-center">
                <div className="w-[800px] h-[500px] border-4 border-txt rounded-3xl relative flex items-center justify-center">
                    <div className="absolute left-0 w-24 h-48 border-r-4 border-y-4 border-txt top-[150px]"></div>
                    <div className="absolute right-0 w-24 h-48 border-l-4 border-y-4 border-txt top-[150px]"></div>
                    <div className="h-full w-0 border-r-4 border-txt"></div>
                    <div className="w-40 h-40 rounded-full border-4 border-txt absolute"></div>
                </div>
            </div>

            {/* Navigation Header */}
            <header className="w-full max-w-6xl mx-auto px-6 pt-8 flex justify-between items-center relative z-10">
                <div className="flex items-center space-x-2">
                    <span className="text-2xl font-black tracking-tight text-txt">
                        Sport<span className="text-indigo-500">Sync</span>
                    </span>
                    <span className="text-[9px] bg-indigo-650 dark:bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        v2.0
                    </span>
                </div>
                <div className="flex items-center space-x-4">
                    <ThemeToggle />
                </div>
            </header>

            {/* Main Hero & Sections */}
            <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col items-center justify-center space-y-12 relative z-10">
                
                {/* Hero Title */}
                <div className="text-center max-w-2xl">
                    <h1 className="text-5xl md:text-7xl font-black text-txt tracking-tighter mb-4 leading-tight">
                        Forge Your <span className="bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 bg-clip-text text-transparent">Dream Team</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted leading-relaxed">
                        Host live real-time football auctions, draft elite players, and manage professional single or double-phase group tournaments.
                    </p>
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl pt-4">
                    <Link to="/admin/auction/setup" className="group">
                        <div className="bg-surface border border-border hover:border-indigo-500 rounded-3xl p-8 h-full transition-all hover:shadow-[0_0_40px_rgba(79,70,229,0.12)] relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
                            
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-4xl bg-indigo-500/10 p-3.5 rounded-2xl text-indigo-500 block">🔨</span>
                                    <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">
                                        Live Room
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-txt uppercase tracking-wide mb-2 group-hover:text-indigo-500 transition-colors">
                                    Auction Module
                                </h2>
                                <p className="text-muted text-sm leading-relaxed">
                                    Upload players, create bidding rooms, and host live real-time auction drafts with custom budgets.
                                </p>
                            </div>
                        </div>
                    </Link>

                    <Link to="/tournament/setup" className="group">
                        <div className="bg-surface border border-border hover:border-green-500 rounded-3xl p-8 h-full transition-all hover:shadow-[0_0_40px_rgba(34,197,94,0.12)] relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-all"></div>
                            
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-4xl bg-green-500/10 p-3.5 rounded-2xl text-green-500 block">🏆</span>
                                    <span className="text-[9px] font-black uppercase tracking-wider bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full border border-green-500/20">
                                        Simulate
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-txt uppercase tracking-wide mb-2 group-hover:text-green-500 transition-colors">
                                    Tournament Module
                                </h2>
                                <p className="text-muted text-sm leading-relaxed">
                                    Simulate fixtures, track points tables, and manage brackets for single or double-phase seasons.
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Hall of Fame section */}
                <div className="w-full pt-10 border-t border-border/80">
                    <div className="flex items-center space-x-2 mb-6">
                        <span className="text-xl">🏆</span>
                        <h3 className="text-lg font-black uppercase tracking-widest text-txt">Hall of Fame</h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 w-full">
                        {featuredPlayers.map((player, idx) => (
                            <div key={idx} className="bg-surface border border-border rounded-2xl p-4 flex flex-col items-center justify-between text-center relative group hover:border-indigo-500/50 hover:shadow-lg transition-all">
                                
                                <div className="h-28 w-full bg-input rounded-xl overflow-hidden mb-3 relative flex justify-center items-end">
                                    <img src={player.img} alt={player.name} className="h-full object-cover" />
                                </div>

                                <div className="w-full">
                                    <h4 className="font-black text-xs text-txt truncate uppercase tracking-wide">{player.name}</h4>
                                    <p className="text-[9px] text-muted font-bold mt-1">{player.role} • {player.style}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="w-full bg-surface border-t border-border py-6 px-6 text-center text-xs text-muted relative z-10">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>© {new Date().getFullYear()} SportSync. All rights reserved.</p>
                    <div className="flex space-x-6">
                        <span className="hover:text-txt transition-colors cursor-pointer">Terms of Service</span>
                        <span className="hover:text-txt transition-colors cursor-pointer">Privacy Policy</span>
                        <span className="hover:text-txt transition-colors cursor-pointer">Feedback</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
