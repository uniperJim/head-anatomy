import React, { createContext, useContext, useReducer, useEffect } from 'react';

const GameContext = createContext();

const STORAGE_KEY = 'anatomists-laboratory-progress';

// Initial state
const initialState = {
  player: {
    name: 'Apprentice',
    totalStars: 0,
    achievements: [],
  },
  rooms: {
    bones: {
      id: 'bones',
      name: 'Die Knochenkammer',
      description: 'Beherrsche die Schädelknochen',
      unlocked: true,
      completed: false,
      stars: 0,
      maxStars: 3,
    },
    muscles: {
      id: 'muscles',
      name: 'Die Muskelkammer',
      description: 'Lerne die Kau- und mimischen Muskeln',
      unlocked: true,
      completed: false,
      stars: 0,
      maxStars: 3,
    },
    vessels: {
      id: 'vessels',
      name: 'Das Gefäßlabyrinth',
      description: 'Navigiere durch Arterien und Venen',
      unlocked: true,
      completed: false,
      stars: 0,
      maxStars: 3,
    },
    nerves: {
      id: 'nerves',
      name: 'Das Nervennetzwerk',
      description: 'Verfolge die Hirnnerven',
      unlocked: true,
      completed: false,
      stars: 0,
      maxStars: 3,
    },
    clinical: {
      id: 'clinical',
      name: 'Die Große Synthese',
      description: 'Wende dein Wissen auf klinische Fälle an',
      unlocked: true,
      completed: false,
      stars: 0,
      maxStars: 3,
    },
  },
  // Track mastery of individual structures
  mastery: {
    // Structure ID -> { recognized: number, recalled: number, applied: number, lastSeen: timestamp }
  },
  // Study session tracking
  studyProgress: {
    // roomId -> { cardsViewed: [], quizzesPassed: [], readyForChallenge: boolean }
  },
  // Settings
  settings: {
    hintsEnabled: true,
    soundEnabled: true,
    showClinicalNotes: true,
  },
};

// Action types
const ACTIONS = {
  LOAD_STATE: 'LOAD_STATE',
  UPDATE_MASTERY: 'UPDATE_MASTERY',
  COMPLETE_ROOM: 'COMPLETE_ROOM',
  UNLOCK_ROOM: 'UNLOCK_ROOM',
  ADD_ACHIEVEMENT: 'ADD_ACHIEVEMENT',
  UPDATE_STUDY_PROGRESS: 'UPDATE_STUDY_PROGRESS',
  RESET_PROGRESS: 'RESET_PROGRESS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
};

// Reducer
function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOAD_STATE:
      return { ...state, ...action.payload };
    
    case ACTIONS.UPDATE_MASTERY: {
      const { structureId, type, correct } = action.payload;
      const existing = state.mastery[structureId] || {
        recognized: 0,
        recalled: 0,
        applied: 0,
        attempts: 0,
        correctStreak: 0,
        lastSeen: null,
      };
      
      return {
        ...state,
        mastery: {
          ...state.mastery,
          [structureId]: {
            ...existing,
            [type]: existing[type] + (correct ? 1 : 0),
            attempts: existing.attempts + 1,
            correctStreak: correct ? existing.correctStreak + 1 : 0,
            lastSeen: Date.now(),
          },
        },
      };
    }
    
    case ACTIONS.COMPLETE_ROOM: {
      const { roomId, stars } = action.payload;
      const room = state.rooms[roomId];
      const newStars = Math.max(room.stars, stars);
      const starDiff = newStars - room.stars;
      
      // Determine next room to unlock
      const roomOrder = ['bones', 'muscles', 'vessels', 'nerves', 'clinical'];
      const currentIndex = roomOrder.indexOf(roomId);
      const nextRoomId = roomOrder[currentIndex + 1];
      
      return {
        ...state,
        player: {
          ...state.player,
          totalStars: state.player.totalStars + starDiff,
        },
        rooms: {
          ...state.rooms,
          [roomId]: {
            ...room,
            completed: true,
            stars: newStars,
          },
          ...(nextRoomId && {
            [nextRoomId]: {
              ...state.rooms[nextRoomId],
              unlocked: true,
            },
          }),
        },
      };
    }
    
    case ACTIONS.UNLOCK_ROOM: {
      const { roomId } = action.payload;
      return {
        ...state,
        rooms: {
          ...state.rooms,
          [roomId]: {
            ...state.rooms[roomId],
            unlocked: true,
          },
        },
      };
    }
    
    case ACTIONS.ADD_ACHIEVEMENT: {
      const { achievement } = action.payload;
      if (state.player.achievements.includes(achievement)) {
        return state;
      }
      return {
        ...state,
        player: {
          ...state.player,
          achievements: [...state.player.achievements, achievement],
        },
      };
    }
    
    case ACTIONS.UPDATE_STUDY_PROGRESS: {
      const { roomId, updates } = action.payload;
      return {
        ...state,
        studyProgress: {
          ...state.studyProgress,
          [roomId]: {
            ...state.studyProgress[roomId],
            ...updates,
          },
        },
      };
    }
    
    case ACTIONS.RESET_PROGRESS:
      return initialState;
    
    case ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };
    
    default:
      return state;
  }
}

// Provider component
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load saved state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        dispatch({ type: ACTIONS.LOAD_STATE, payload: JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Failed to load saved progress:', error);
    }
  }, []);

  // Save state on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [state]);

  // Helper functions
  const updateMastery = (structureId, type, correct) => {
    dispatch({
      type: ACTIONS.UPDATE_MASTERY,
      payload: { structureId, type, correct },
    });
  };

  const completeRoom = (roomId, stars) => {
    dispatch({
      type: ACTIONS.COMPLETE_ROOM,
      payload: { roomId, stars },
    });
  };

  const unlockRoom = (roomId) => {
    dispatch({
      type: ACTIONS.UNLOCK_ROOM,
      payload: { roomId },
    });
  };

  const addAchievement = (achievement) => {
    dispatch({
      type: ACTIONS.ADD_ACHIEVEMENT,
      payload: { achievement },
    });
  };

  const updateStudyProgress = (roomId, updates) => {
    dispatch({
      type: ACTIONS.UPDATE_STUDY_PROGRESS,
      payload: { roomId, updates },
    });
  };

  const resetProgress = () => {
    dispatch({ type: ACTIONS.RESET_PROGRESS });
  };

  const updateSettings = (settings) => {
    dispatch({
      type: ACTIONS.UPDATE_SETTINGS,
      payload: settings,
    });
  };

  // Calculate mastery level for a structure
  const getMasteryLevel = (structureId) => {
    const mastery = state.mastery[structureId];
    if (!mastery) return 0;
    
    const { recognized, recalled, applied } = mastery;
    const total = recognized + recalled + applied;
    const maxPossible = 6; // 2 of each type needed for mastery
    
    return Math.min(100, Math.round((total / maxPossible) * 100));
  };

  // Check if structure is mastered (triple verification)
  const isStructureMastered = (structureId) => {
    const mastery = state.mastery[structureId];
    if (!mastery) return false;
    
    return mastery.recognized >= 2 && 
           mastery.recalled >= 2 && 
           mastery.applied >= 1;
  };

  // Check if ready for room challenge
  const isReadyForChallenge = (roomId) => {
    const progress = state.studyProgress[roomId];
    return progress?.readyForChallenge || false;
  };

  const value = {
    state,
    dispatch,
    updateMastery,
    completeRoom,
    unlockRoom,
    addAchievement,
    updateStudyProgress,
    resetProgress,
    updateSettings,
    getMasteryLevel,
    isStructureMastered,
    isReadyForChallenge,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export default GameContext;
