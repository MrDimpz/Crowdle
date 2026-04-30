import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  Timer, 
  Users, 
  Settings, 
  Wifi, 
  WifiOff, 
  Play, 
  CheckCircle2, 
  XCircle,
  Hash
} from "lucide-react";

type GameStatus = "IDLE" | "PLAYING" | "WON" | "LOST" | "CELEBRATING";

interface Guess {
  word: string;
  result: ("correct" | "present" | "absent")[];
}

interface GameState {
  targetWord: string;
  wordLength: number;
  streak: number;
  guesses: Guess[];
  status: GameStatus;
  timeLeft: number;
  voteCount: number;
  topVotes: { word: string; count: number }[];
}

interface ChatMessage {
  uniqueId: string;
  nickname: string;
  profilePictureUrl: string;
  comment: string;
}

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [tiktokUsername, setTiktokUsername] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
    });

    newSocket.on("game_state", (state: GameState) => {
      setGameState(state);
    });

    newSocket.on("tiktok_chat", (msg: ChatMessage) => {
      setChatMessages(prev => [msg, ...prev].slice(0, 50));
    });

    newSocket.on("tiktok_connected", (user) => {
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    });

    newSocket.on("tiktok_error", (msg) => {
      setError(msg);
      setIsConnecting(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const startTiktokLink = () => {
    if (!tiktokUsername) return;
    setIsConnecting(true);
    socket?.emit("connect_tiktok", tiktokUsername);
  };

  const startGame = () => {
    socket?.emit("start_game");
  };

  if (!gameState) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">Initializing System...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans overflow-hidden flex flex-col relative selection:bg-fuchsia-500 selection:text-white">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fuchsia-600/15 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/15 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Main Game Area */}
      <main className="flex-1 flex items-center justify-center p-8 z-10 w-full overflow-auto">
        <div className="flex gap-8 items-start">
          
          {/* Main Game Container: Optimized for OBS Capture */}
          <div className="w-[500px] h-[720px] bg-slate-950 border-4 border-white/10 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col items-center p-6 relative overflow-hidden shrink-0 ring-1 ring-white/10">
            {/* Header / Countdown */}
            <div className="w-full flex items-center justify-between mb-6 z-10">
              <div className="flex items-center gap-2">
                <div className="bg-red-500 px-3 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.2em] animate-pulse">Live</div>
                <div className="bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1.5">
                   <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400" />
                   <span className="text-[9px] font-black uppercase text-cyan-400">Streak: {gameState.streak}/5</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-fuchsia-400" />
                <span className="text-2xl font-black italic tracking-tighter tabular-nums drop-shadow-lg">
                  00:{gameState.timeLeft.toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Word Grid */}
            <div className="flex-1 flex items-center justify-center w-full px-4">
              <div 
                className="grid grid-rows-5 gap-2.5 z-10 w-full"
                style={{ 
                  maxWidth: gameState.wordLength <= 6 ? '400px' : '460px'
                }}
              >
                {[...Array(5)].map((_, rowIndex) => {
                  const guess = gameState.guesses[rowIndex];
                  const isCurrentRow = gameState.status === "PLAYING" && rowIndex === gameState.guesses.length;
                  
                  return (
                    <div 
                      key={rowIndex} 
                      className="grid gap-2" 
                      style={{ 
                        gridTemplateColumns: `repeat(${gameState.wordLength}, minmax(0, 1fr))` 
                      }}
                    >
                      {[...Array(gameState.wordLength)].map((_, colIndex) => {
                        let char = "";
                        let status = "empty";

                        if (guess) {
                          char = guess.word[colIndex];
                          status = guess.result[colIndex];
                        } else if (isCurrentRow) {
                          if (colIndex === 0) char = gameState.targetWord[0];
                          status = "polling";
                        }

                        // Dynamic text size based on word length
                        const fontSizeClass = 
                          gameState.wordLength <= 5 ? "text-3xl" :
                          gameState.wordLength <= 6 ? "text-2xl" :
                          gameState.wordLength <= 7 ? "text-xl" : "text-lg";

                        return (
                          <motion.div
                            key={colIndex}
                            initial={false}
                            animate={status !== "empty" && status !== "polling" ? {
                              rotateY: [0, 90, 0],
                              backgroundColor: status === "correct" ? "#10b981" : status === "present" ? "#f59e0b" : "#1e293b",
                            } : {}}
                            transition={{ delay: colIndex * 0.1, duration: 0.4 }}
                            className={`
                              aspect-square flex items-center justify-center font-black rounded-xl border-2 
                              ${fontSizeClass}
                              ${status === "empty" ? "bg-slate-900/50 border-white/5 text-slate-800" : ""}
                              ${status === "polling" ? "bg-slate-800/80 border-white/20 text-white/20 animate-pulse italic" : ""}
                              ${status === "correct" ? "border-emerald-400 text-white" : ""}
                              ${status === "present" ? "border-amber-400 text-white" : ""}
                              ${status === "absent" ? "border-slate-700 bg-slate-800 text-white" : ""}
                              transition-all duration-300 font-display shadow-lg relative
                            `}
                          >
                            {char}
                          </motion.div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Vote & Progress */}
            <div className="w-full mt-6 z-10 space-y-4">
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Crowd Consensus ({gameState.wordLength} Letters)</p>
                <p className="text-4xl font-black text-white italic tracking-tighter drop-shadow-xl min-h-[40px]">
                  {gameState.topVotes[0]?.word || "???"}
                </p>
                <div className="flex justify-center items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{gameState.voteCount} Votes cast</span>
                </div>
              </div>

              <div className="w-full bg-white/5 border border-white/10 rounded-full h-8 relative overflow-hidden backdrop-blur-sm shadow-inner">
                {gameState.status === "PLAYING" && (
                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: `${(gameState.timeLeft / 30) * 100}%` }}
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-fuchsia-600 to-cyan-500"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center font-black text-[8px] uppercase tracking-[0.4em] text-white/80">
                  Decision Sync: {gameState.timeLeft}s
                </div>
              </div>
            </div>

            {/* Victory/Defeat Overlay */}
            <AnimatePresence>
              {gameState.status === "CELEBRATING" && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 text-center bg-slate-950"
                >
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: -20, x: Math.random() * 500 }}
                        animate={{ 
                          y: 800, 
                          x: (Math.random() - 0.5) * 100 + (Math.random() * 500) 
                        }}
                        transition={{ 
                          duration: 2 + Math.random() * 2, 
                          repeat: Infinity,
                          delay: Math.random() * 2
                        }}
                        className={`absolute w-1.5 h-1.5 rounded-full ${['bg-fuchsia-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-yellow-500'][Math.floor(Math.random() * 4)]}`}
                      />
                    ))}
                  </div>

                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Trophy className="w-24 h-24 text-yellow-500 mb-6 drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]" />
                  </motion.div>
                  
                  <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase mb-2 leading-none">
                    Fantastic!
                  </h2>
                  <p className="text-cyan-400 font-black uppercase tracking-[0.3em] text-[10px] mb-8">System Synchronized</p>

                  <div className="p-8 bg-white/5 rounded-3xl border border-white/10 w-full backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-cyan-500/10 opacity-50"></div>
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-4 font-mono relative z-10">Target Word Decrypted</p>
                    <p className="text-5xl font-display font-black text-white tracking-[0.2em] relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{gameState.targetWord}</p>
                  </div>

                  <div className="mt-12 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-black uppercase text-emerald-400">Current Streak: {gameState.streak}/5</span>
                    </div>
                    <p className="text-white/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/20 animate-ping"></span>
                      Initialize next round in 10s...
                    </p>
                  </div>
                </motion.div>
              )}

              {(gameState.status === "WON" || gameState.status === "LOST") && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-8"
                >
                  <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-6 shadow-2xl ${
                    gameState.status === "WON" ? "bg-emerald-500/20 shadow-emerald-500/30" : "bg-red-500/20 shadow-red-500/30"
                  }`}>
                    {gameState.status === "WON" ? <Trophy className="w-14 h-14 text-emerald-400" /> : <XCircle className="w-14 h-14 text-red-400" />}
                  </div>
                  <h2 className={`text-4xl font-black italic tracking-tighter uppercase mb-4 ${
                    gameState.status === "WON" ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {gameState.status === "WON" ? "Sequence Correct" : "Failure"}
                  </h2>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 w-full mb-4">
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-2 font-mono">Decoded Sequence</p>
                    <p className="text-4xl font-display font-black text-white tracking-[0.2em]">{gameState.targetWord}</p>
                  </div>
                  
                  {gameState.status === "WON" && (
                    <div className="text-[10px] font-black uppercase text-cyan-400 tracking-widest bg-cyan-400/10 px-4 py-2 rounded-full border border-cyan-400/20">
                      Streaking: {gameState.streak === 0 ? 5 : gameState.streak} / 5 Correct
                    </div>
                  )}

                  <p className="mt-8 text-white/40 text-[10px] font-black uppercase tracking-widest animate-pulse cursor-pointer hover:text-white transition-colors" onClick={startGame}>
                    [ Tap to Initialize Next Round ]
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Chat & Side Leaderboard */}
          <div className="flex flex-col gap-6 w-80">
            {/* Real-time TikTok Chat Feed */}
            <div className="h-64 bg-slate-900/60 rounded-3xl border border-white/10 p-6 flex flex-col shadow-2xl backdrop-blur-xl">
              <h3 className="text-[10px] font-black text-fuchsia-400 mb-6 uppercase tracking-[0.25em] flex items-center gap-2">
                <Users className="w-3 h-3" /> Chat Feed
              </h3>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {chatMessages.length > 0 ? chatMessages.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={msg.uniqueId + i}
                    className="flex gap-3 bg-white/5 p-3 rounded-2xl border border-white/5"
                  >
                    <img 
                      src={msg.profilePictureUrl} 
                      alt="" 
                      className="w-6 h-6 rounded-full border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black text-white/60 truncate">@{msg.uniqueId}</p>
                      <p className="text-[10px] text-white/90 break-words leading-tight">{msg.comment}</p>
                    </div>
                  </motion.div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 italic text-center">
                    <p className="text-[8px] uppercase tracking-[0.2em] font-black">Awaiting Stream...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Voting Leaderboard (secondary details) */}
            <div className="bg-slate-900/40 rounded-3xl border border-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <h3 className="text-[10px] font-black text-cyan-400 mb-6 uppercase tracking-[0.25em]">Live Polling</h3>
              <div className="space-y-3">
                {gameState.topVotes.slice(1, 5).map((vote, i) => (
                  <div key={vote.word} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-white/20 font-black font-mono text-[10px]">{i + 2}.</span>
                      <span className="font-black text-xs tracking-widest text-white/80 italic">{vote.word}</span>
                    </div>
                    <span className="text-[9px] font-mono text-white/40">{vote.count}</span>
                  </div>
                ))}
                {gameState.topVotes.length <= 1 && (
                  <p className="text-white/20 text-[10px] text-center italic py-4 font-black uppercase tracking-widest">No secondary votes</p>
                )}
              </div>
            </div>

            {/* System Control Panel (Moved here based on instructions) */}
            <div className="bg-slate-900/60 rounded-3xl border border-fuchsia-500/30 p-6 shadow-2xl backdrop-blur-xl space-y-4">
              <h3 className="text-[10px] font-black text-fuchsia-400 uppercase tracking-[0.25em]">System Controls</h3>
              <div className="space-y-3">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="TikTok Username"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-cyan-500 font-mono placeholder:text-white/20 transition-all"
                    value={tiktokUsername}
                    onChange={(e) => setTiktokUsername(e.target.value)}
                  />
                  {isConnected && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                      <span className="text-[8px] font-black text-emerald-500 uppercase">Linked</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={startTiktokLink}
                    disabled={isConnecting || !tiktokUsername}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-2"
                  >
                    <Wifi className="w-3 h-3" /> {isConnecting ? "..." : "Link"}
                  </button>
                  <button 
                    onClick={startGame}
                    disabled={!isConnected}
                    className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-2"
                  >
                    <Play className="w-3 h-3 fill-current" /> Start
                  </button>
                </div>
                {error && <p className="text-red-400 text-[9px] font-mono p-2 bg-red-400/10 rounded border border-red-400/20">{error}</p>}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Retro Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-[100]"></div>
      
      {/* Footer Ticker */}
      <footer className="bg-fuchsia-700 py-4 px-8 z-20 flex items-center overflow-hidden shrink-0">
        <div className="flex gap-16 whitespace-nowrap animate-marquee items-center w-full">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-16 items-center">
              <p className="text-sm font-black italic tracking-tight">TYPE ANY {gameState.wordLength}-LETTER WORD TO VOTE</p>
              <p className="text-sm font-black italic tracking-tight text-white/60 uppercase">System Frequency: {gameState.wordLength} Letters</p>
              <p className="text-sm font-black italic tracking-tight text-white/80">SYNCHRONIZE THE CROWD</p>
            </div>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

