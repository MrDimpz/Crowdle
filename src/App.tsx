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

type GameStatus = "IDLE" | "PLAYING" | "WON" | "LOST" | "CELEBRATING" | "DEFEATED";

interface Guess {
  word: string;
  result: ("correct" | "present" | "absent")[];
}

interface GameState {
  targetWord: string;
  wordLength: number;
  streak: number;
  totalStreak: number;
  roundTimerDuration: number;
  guesses: Guess[];
  status: GameStatus;
  timeLeft: number;
  activeTimerDuration: number;
  delayLeft: number;
  resetTimeLeft: number;
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
                <div className="bg-red-500 px-3 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.2em] animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]">Live</div>
                <div className="bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1.5 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                   <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                   <span className="text-[9px] font-black uppercase text-cyan-400">Sync: {gameState.streak}/5</span>
                </div>
              </div>

              {/* Streak Counter (Centered) */}
              <div className="absolute left-1/2 -translate-x-1/2 top-[22px] flex flex-col items-center">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                  <Trophy className="w-3 h-3 text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Streak:</span>
                  <span className="text-sm font-black text-white italic tracking-tighter">{gameState.totalStreak}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-fuchsia-400" />
                <span className="text-2xl font-black italic tracking-tighter tabular-nums drop-shadow-lg">
                  00:{Math.ceil(gameState.timeLeft).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Word Grid & Overlays Container */}
            <div className="flex-1 flex flex-col items-center justify-center w-full px-4 gap-3 relative">
              
              {/* Victory/Defeat Overlay (Revealed behind tumbling tiles) */}
              <AnimatePresence>
                {(gameState.status === "DEFEATED" || gameState.status === "LOST") && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 1.0, ease: "easeOut" }}
                    className="absolute inset-0 z-0 flex flex-col items-center justify-center p-8 text-center bg-slate-950 rounded-3xl"
                  >
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                      <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    
                    <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase mb-2 leading-none">
                      Critical Error
                    </h2>
                    <p className="text-red-500 font-black uppercase tracking-[0.3em] text-[8px] mb-6">System Desynchronized</p>
  
                    <div className="p-6 bg-red-500/5 rounded-3xl border border-red-500/10 w-full backdrop-blur-xl relative overflow-hidden">
                      <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-2 font-mono">Missed Sequence</p>
                      <p className="text-4xl font-display font-black text-white tracking-[0.2em]">{gameState.targetWord}</p>
                    </div>
  
                    <div className="mt-8 flex flex-col items-center gap-4">
                      <p className="text-white/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500/40 animate-pulse"></span>
                        Re-initializing matrix in {Math.ceil(gameState.resetTimeLeft)}s...
                      </p>
                    </div>
                  </motion.div>
                )}
  
                {(gameState.status === "CELEBRATING" || gameState.status === "WON") && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 1.0, ease: "easeOut" }}
                    className="absolute inset-0 z-0 flex flex-col items-center justify-center p-8 text-center bg-slate-950 rounded-3xl"
                  >
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ y: -20, x: Math.random() * 500 }}
                          animate={{ y: 800 }}
                          transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                          className={`absolute w-1 h-1 rounded-full ${['bg-fuchsia-500', 'bg-cyan-500'][Math.floor(Math.random() * 2)]}`}
                        />
                      ))}
                    </div>
  
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                      <Trophy className="w-16 h-16 text-yellow-500 mb-4 drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]" />
                    </motion.div>
                    
                    <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase mb-2 leading-none">
                      Fantastic!
                    </h2>
                    <p className="text-cyan-400 font-black uppercase tracking-[0.3em] text-[8px] mb-6">System Synchronized</p>
  
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 w-full backdrop-blur-xl relative overflow-hidden group">
                      <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-2 font-mono relative z-10">Target Word Decrypted</p>
                      <p className="text-4xl font-display font-black text-white tracking-[0.2em] relative z-10">{gameState.targetWord}</p>
                    </div>
  
                    <div className="mt-8 flex flex-col items-center gap-4">
                      <p className="text-white/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/40 animate-ping"></span>
                        Next round in {Math.ceil(gameState.resetTimeLeft)}s...
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Timer Bar (Relocated) */}
              <div className="w-full bg-white/5 border border-white/10 rounded-full h-8 relative overflow-hidden backdrop-blur-sm shadow-inner z-10" style={{ maxWidth: gameState.wordLength <= 6 ? '400px' : '460px' }}>
                {gameState.status === "PLAYING" && (
                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: gameState.delayLeft > 0 ? "100%" : `${(gameState.timeLeft / gameState.activeTimerDuration) * 100}%` }}
                    transition={{ ease: "linear", duration: 0.1 }}
                    className={`absolute left-0 top-0 h-full ${gameState.delayLeft > 0 ? "bg-fuchsia-600/50" : "bg-gradient-to-r from-fuchsia-600 to-cyan-500"}`}
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center font-black text-[8px] uppercase tracking-[0.4em] text-white/80">
                  {gameState.delayLeft > 0 ? `INITIATING SYNC: ${Math.ceil(gameState.delayLeft)}s` : `Decision Sync: ${Math.ceil(gameState.timeLeft)}s`}
                </div>
              </div>
  
              <div 
                className="grid grid-rows-5 gap-2.5 z-20 w-full"
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
                          char = "";
                          status = "polling";
                        }

                        // Dynamic text size based on word length
                        const fontSizeClass = 
                          gameState.wordLength <= 5 ? "text-5xl" :
                          gameState.wordLength <= 6 ? "text-4xl" :
                          gameState.wordLength <= 7 ? "text-3xl" : "text-2xl";

                        const isEnding = gameState.status === "WON" || gameState.status === "LOST" || gameState.status === "CELEBRATING" || gameState.status === "DEFEATED";

                        return (
                          <div key={colIndex} className="perspective-1000 aspect-square">
                            <motion.div
                              initial={{ y: 0, x: 0, rotateX: 0, rotateY: 0, rotateZ: 0, opacity: 1, scale: 1 }}
                              animate={
                                isEnding ? {
                                  y: [0, -50, 1500],
                                  x: [0, (colIndex - (gameState.wordLength / 2)) * 100, (colIndex - (gameState.wordLength / 2)) * 300],
                                  rotateX: [0, 360, 1080],
                                  rotateY: [0, 360, 1080],
                                  rotateZ: [0, 90, 180],
                                  opacity: [1, 1, 0],
                                  scale: [1, 1.2, 0.5]
                                } :
                                status !== "empty" && status !== "polling" ? {
                                  rotateX: -180,
                                  y: [0, -10, 0]
                                } : {
                                  y: 0, x: 0, rotateX: 0, rotateY: 0, rotateZ: 0, opacity: 1, scale: 1
                                }
                              }
                              transition={
                                isEnding ? {
                                  delay: (rowIndex * 0.1) + (colIndex * 0.05),
                                  duration: 2,
                                  ease: "circIn"
                                } : { 
                                  delay: colIndex * 0.1, 
                                  duration: 0.6,
                                  ease: "backOut"
                                }
                              }
                              className="w-full h-full preserve-3d relative"
                            >
                              {/* Front Face */}
                              <div 
                                className={`
                                  absolute inset-0 backface-hidden flex items-center justify-center font-black rounded-xl border-2 
                                  ${fontSizeClass} shadow-[inset_0_-4px_0_rgba(0,0,0,0.4)]
                                  ${status === "empty" ? "bg-slate-900/80 border-white/5 text-white/5" : ""}
                                  ${status === "polling" ? "bg-slate-800 border-white/20 text-cyan-400/40 animate-pulse italic" : ""}
                                  ${status === "correct" ? "bg-emerald-500 border-emerald-400 text-white" : ""}
                                  ${status === "present" ? "bg-amber-500 border-amber-400 text-white" : ""}
                                  ${status === "absent" ? "bg-slate-800 border-slate-700 text-white/20" : ""}
                                  transition-all duration-300 font-display
                                `}
                              >
                                {char}
                                {status === "empty" && <div className="w-1 h-1 rounded-full bg-white/5"></div>}
                              </div>

                              {/* Back Face (Goal state) */}
                              <div 
                                className={`
                                  absolute inset-0 backface-hidden flex items-center justify-center font-black rounded-xl border-2 
                                  ${fontSizeClass} shadow-[inset_0_-4px_0_rgba(0,0,0,0.4)]
                                  ${status === "correct" ? "bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" : ""}
                                  ${status === "present" ? "bg-amber-600 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]" : ""}
                                  ${status === "absent" ? "bg-slate-900 border-slate-700 text-white/40" : ""}
                                  font-display
                                `}
                                style={{ transform: 'rotateX(180deg)' }}
                              >
                                {char}
                                {/* Subtle dice pips */}
                                <div className="absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-white/5"></div>
                                <div className="absolute bottom-1.5 right-1.5 w-1 h-1 rounded-full bg-black/20"></div>
                              </div>
                            </motion.div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Voting Marquee (Moved here from secondary list) */}
              <div className="w-full h-12 bg-slate-900/60 rounded-xl mt-2 relative overflow-hidden border border-white/5 backdrop-blur-md flex items-center">
                <div className="absolute left-0 top-0 bottom-0 px-2 bg-slate-950 z-20 flex items-center border-r border-white/10 shadow-[4px_0_15px_rgba(0,0,0,0.5)]">
                  <span className="text-[7px] font-black uppercase text-cyan-400 tracking-tight whitespace-nowrap">Other Guesses:</span>
                </div>
                <div className="flex gap-8 whitespace-nowrap animate-marquee-fast items-center hover:pause pl-20">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex gap-12 items-center px-4">
                      {gameState.topVotes.slice(1).map((vote) => (
                        <div key={vote.word + j} className="flex items-center gap-3">
                          <span className="font-black text-2xl text-white italic tracking-tighter drop-shadow-md">{vote.word}</span>
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">{vote.count}</span>
                        </div>
                      ))}
                      {gameState.topVotes.length <= 1 && (
                        <span className="text-xl text-white/10 uppercase font-black italic tracking-widest whitespace-nowrap">Awaiting Synchronicity...</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Vote Display */}
            <div className="w-full mt-1.5 z-10">
              <div className="text-center">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">Crowd Consensus ({gameState.wordLength} Letters)</p>
                <p className={`text-6xl font-black italic tracking-tighter min-h-[64px] transition-all duration-300 drop-shadow-[0_0_35px_rgba(244,63,94,0.3)]
                  ${gameState.delayLeft > 0 ? "text-fuchsia-400 animate-pulse" : "bg-gradient-to-r from-fuchsia-500 via-white to-cyan-400 bg-clip-text text-transparent animate-gradient-slow"}`}>
                  {gameState.delayLeft > 0 ? "PREPARING..." : (gameState.topVotes[0]?.word || "???")}
                </p>
                <div className="flex justify-center items-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${gameState.delayLeft > 0 ? "bg-fuchsia-400" : "bg-cyan-400"} animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]`}></div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{gameState.voteCount} Votes cast</span>
                </div>
              </div>
            </div>

            {/* Victory/Defeat Overlay OLD (Deleted from here, moved into Grid Container above) */}
            <AnimatePresence>
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
                    className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-2"
                  >
                    <Play className="w-3 h-3 fill-current" /> Start
                  </button>
                </div>
                {error && <p className="text-red-400 text-[9px] font-mono p-2 bg-red-400/10 rounded border border-red-400/20">{error}</p>}
                
                {/* Timer Duration Controls */}
                <div className="pt-2 space-y-2">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Decision Sync Duration</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[20, 30, 45, 60].map((d) => (
                      <button
                        key={d}
                        onClick={() => socket?.emit("set_timer_duration", d)}
                        className={`py-1.5 rounded-lg text-[9px] font-black transition-all border ${
                          gameState.roundTimerDuration === d 
                          ? "bg-fuchsia-600 border-fuchsia-500 text-white shadow-[0_0_10px_rgba(192,38,211,0.3)]" 
                          : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                        }`}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Test Entry */}
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Debug: Simulated Entry</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Test Word"
                      maxLength={gameState.wordLength}
                      className="flex-1 bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-[10px] focus:outline-none focus:border-fuchsia-500 font-mono uppercase"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value;
                          if (val) {
                            socket.emit("test_guess", val);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                    />
                    <button 
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        if (input.value) {
                          socket.emit("test_guess", input.value);
                          input.value = "";
                        }
                      }}
                      className="bg-white/5 hover:bg-white/10 text-white/60 px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all"
                    >
                      Vote
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => socket.emit("debug_win")}
                      className="bg-emerald-500/5 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-2.5 rounded-full text-[9px] font-black uppercase transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                    >
                      Simulate Win
                    </button>
                    <button 
                      onClick={() => socket.emit("debug_loss")}
                      className="bg-red-500/5 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2.5 rounded-full text-[9px] font-black uppercase transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                    >
                      Simulate loss
                    </button>
                  </div>
                </div>
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
        .animate-marquee-fast {
          animation: marquee 15s linear infinite;
        }
        .animate-marquee-fast:hover {
          animation-play-state: paused;
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

