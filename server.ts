import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { WebcastPushConnection } from "tiktok-live-connector";
import path from "path";
import { createServer as createViteServer } from "vite";

const dictionary: Record<number, string[]> = {
  5: ["APPLE", "BEACH", "BRAIN", "BREAD", "BRUSH", "CHAIR", "CHEST", "CHORD", "CLICK", "CLOCK", "CLOUD", "DANCE", "DIARY", "DRINK", "DRIVE", "EARTH", "FEAST", "FIELD", "FRUIT", "GLASS", "GRAPE", "GREEN", "GHOST", "HEART", "HOUSE", "JUICE", "LIGHT", "LEMON", "MELON", "MONEY", "MUSIC", "NIGHT", "OCEAN", "PARTY", "PIANO", "PILOT", "PLANE", "PHONE", "PIZZA", "PLANT", "RADIO", "RIVER", "ROBOT", "SHIRT", "SHOES", "SMILE", "SNAKE", "SPACE", "SPOON", "STORM", "TABLE", "TIGER", "TOAST", "TOUCH", "TRAIN", "TRUCK", "VOICE", "WATER", "WHALE", "WORLD", "WRITE", "YACHT", "ZEBRA"],
  6: ["BREEZE", "BRIGHT", "CASTLE", "DANGER", "ENERGY", "FLOWER", "GARDEN", "HEALTH", "ISLAND", "JUNGLE", "KITTEN", "LEMONS", "MARKET", "NATURE", "ORANGE", "PLANET", "QUARTZ", "RELIEF", "SILVER", "TICKET", "UNIQUE", "VALLEY", "WINTER", "YELLOW", "ZODIAC"],
  7: ["ABILITY", "BALANCE", "CAPTAIN", "DIAMOND", "ELEMENT", "FREEDOM", "GORILLA", "HARVEST", "IMAGINE", "JOURNEY", "KITCHEN", "LANTERN", "MESSAGE", "NETWORK", "OPTICAL", "PACKAGE", "QUALITY", "RAINBOW", "SCIENCE", "THOUGHT", "UNIFORM", "VICTORY", "WEATHER"],
  8: ["ABSOLUTE", "BUILDING", "COMPUTER", "DAUGHTER", "ELEPHANT", "FESTIVAL", "GRADIENT", "HOLIDAYS", "IDENTITY", "JUNCTION", "KEYBOARD", "LANGUAGE", "MOUNTAIN", "NOTEBOOK", "OPTIONAL", "PAINTING", "QUESTION", "RELIABLE", "SUNLIGHT", "TOGETHER", "UMBRELLA", "VACATION"]
};

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Game State
  let targetWord = "";
  let guesses: any[] = [];
  let status = "IDLE"; // IDLE, PLAYING, WON, LOST
  let currentVotes: Record<string, number> = {};
  let timeLeft = 0;
  let timerInterval: NodeJS.Timeout | null = null;
  let tiktokConnection: WebcastPushConnection | null = null;
  
  let currentWordLength = 5;
  let streak = 0;

  function resetGame() {
    const words = dictionary[currentWordLength];
    targetWord = words[Math.floor(Math.random() * words.length)];
    guesses = [];
    status = "PLAYING";
    currentVotes = {};
    timeLeft = 30; // 30 seconds to vote
    startTimer();
    broadcastState();
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        broadcastState();
      } else {
        processVotes();
      }
    }, 1000);
  }

  function processVotes() {
    const votedWords = Object.keys(currentVotes);
    if (votedWords.length > 0) {
      // Find most voted word
      const winningWord = votedWords.reduce((a, b) => currentVotes[a] > currentVotes[b] ? a : b);
      addGuess(winningWord);
    } else {
      // No votes, just restart the 30s timer to wait for participation
      timeLeft = 30;
    }
    currentVotes = {};
    broadcastState();
  }

  function addGuess(word: string) {
    if (status !== "PLAYING") return;

    const result = checkWord(word, targetWord);
    guesses.push({ word, result });

    if (word === targetWord) {
      status = "WON";
      streak++;
      if (streak >= 5) {
        streak = 0;
        currentWordLength++;
        if (currentWordLength > 8) currentWordLength = 5;
      }
      if (timerInterval) clearInterval(timerInterval);
      
      // Handle automatic transition after win
      setTimeout(() => {
        status = "CELEBRATING";
        broadcastState();
        
        setTimeout(() => {
          resetGame();
        }, 10000); // Display splash for 10 seconds
      }, 5000); // Wait 5 seconds after guess
    } else if (guesses.length >= 5) {
      status = "LOST";
      streak = 0; // Reset streak on loss
      if (timerInterval) clearInterval(timerInterval);
    } else {
      timeLeft = 30; // Reset timer for next guess
    }
  }

  function checkWord(guess: string, target: string) {
    const len = target.length;
    const result = new Array(len).fill("absent");
    const targetArr = target.split("");
    const guessArr = guess.split("");

    // First pass: Correct positions
    for (let i = 0; i < len; i++) {
      if (guessArr[i] === targetArr[i]) {
        result[i] = "correct";
        targetArr[i] = "";
        guessArr[i] = "";
      }
    }

    // Second pass: Misplaced
    for (let i = 0; i < len; i++) {
      if (guessArr[i] !== "" && targetArr.includes(guessArr[i])) {
        result[i] = "present";
        targetArr[targetArr.indexOf(guessArr[i])] = "";
      }
    }

    return result;
  }

  function broadcastState() {
    const hiddenWord = targetWord ? targetWord[0] + "*".repeat(Math.max(0, targetWord.length - 1)) : "";
    io.emit("game_state", {
      targetWord: (status === "WON" || status === "LOST" || status === "CELEBRATING") ? targetWord : hiddenWord,
      wordLength: currentWordLength,
      streak,
      guesses,
      status,
      timeLeft,
      voteCount: Object.values(currentVotes).reduce((a, b) => a + b, 0),
      topVotes: Object.entries(currentVotes)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word, count]) => ({ word, count })),
    });
  }

  io.on("connection", (socket) => {
    console.log("Client connected");
    broadcastState();

    socket.on("start_game", () => {
      resetGame();
    });

    socket.on("connect_tiktok", (username) => {
      if (tiktokConnection) {
        tiktokConnection.disconnect();
      }

      console.log(`Connecting to TikTok user: ${username}`);
      tiktokConnection = new WebcastPushConnection(username);

      tiktokConnection.connect().then(state => {
        console.log(`Connected to room ${state.roomId}`);
        socket.emit("tiktok_connected", username);
      }).catch(err => {
        console.error("Failed to connect", err);
        socket.emit("tiktok_error", err.message);
      });

      tiktokConnection.on("chat", (data) => {
        const message = data.comment.toUpperCase().trim();
        
        // Broadcast the raw chat message for the feed
        io.emit("tiktok_chat", {
          uniqueId: data.uniqueId,
          nickname: data.nickname,
          profilePictureUrl: data.profilePictureUrl,
          comment: data.comment
        });

        // Check if message is a valid word of current length
        if (message.length === currentWordLength && /^[A-Z]+$/.test(message)) {
          currentVotes[message] = (currentVotes[message] || 0) + 1;
          broadcastState();
        }
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
