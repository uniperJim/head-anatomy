import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import BonesPuzzles from './puzzles/BonesPuzzles';
import './Room.css';

const roomData = {
  bones: {
    title: 'The Bony Vault',
    description: 'Prove your knowledge of skull bones and foramina to unlock the vault.',
    atmosphere: 'You enter a dimly lit chamber. Ancient skulls line the walls, their hollow eyes watching. A massive vault door stands before you, adorned with intricate bone carvings.',
    PuzzleComponent: BonesPuzzles,
  },
  muscles: {
    title: 'The Muscle Chamber',
    description: 'Navigate the complex web of muscles to proceed.',
    atmosphere: 'Anatomical models surround you, their muscles exposed in vivid detail.',
    PuzzleComponent: null, // TODO
  },
  vessels: {
    title: 'The Vascular Maze',
    description: 'Trace the paths of blood through the head.',
    atmosphere: 'Red and blue tubes wind through the room like a living maze.',
    PuzzleComponent: null, // TODO
  },
  nerves: {
    title: 'The Nerve Network',
    description: 'Follow the signals to find your way.',
    atmosphere: 'Electrical sparks dance along golden wires that crisscross the ceiling.',
    PuzzleComponent: null, // TODO
  },
  clinical: {
    title: 'The Grand Synthesis',
    description: 'Apply everything you have learned.',
    atmosphere: 'A Victorian operating theater awaits, its secrets locked away.',
    PuzzleComponent: null, // TODO
  },
};

const Room = ({ roomId, onExit, onComplete }) => {
  const { state, completeRoom, addAchievement, updateMastery } = useGame();
  const [phase, setPhase] = useState('intro'); // intro, puzzle, complete
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [showHint, setShowHint] = useState(null);
  const [puzzleResults, setPuzzleResults] = useState([]);

  const room = roomData[roomId];
  const PuzzleComponent = room?.PuzzleComponent;

  useEffect(() => {
    if (phase === 'puzzle' && !startTime) {
      setStartTime(Date.now());
    }
  }, [phase, startTime]);

  const handlePuzzleComplete = (result) => {
    const newResults = [...puzzleResults, result];
    setPuzzleResults(newResults);
    setScore(prev => prev + result.score);
    setMaxScore(prev => prev + result.maxScore);
    
    // Update mastery for structures used in puzzle
    if (result.structures) {
      result.structures.forEach(s => {
        updateMastery(s.id, s.type, s.correct);
      });
    }

    // Check if more puzzles or complete
    if (result.isLast) {
      calculateFinalResults(newResults);
    } else {
      setCurrentPuzzle(prev => prev + 1);
    }
  };

  const calculateFinalResults = (results) => {
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const totalMaxScore = results.reduce((sum, r) => sum + r.maxScore, 0);
    const percentage = (totalScore / totalMaxScore) * 100;
    
    // Calculate stars
    let stars = 0;
    if (percentage >= 60) stars = 1;
    if (percentage >= 80) stars = 2;
    if (percentage >= 95 && hintsUsed === 0) stars = 3;

    // Complete the room
    completeRoom(roomId, stars);

    // Check for achievements
    if (stars === 3) {
      addAchievement(`${roomId}_perfect`);
    }
    if (hintsUsed === 0) {
      addAchievement(`${roomId}_no_hints`);
    }

    const elapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    if (elapsed < 300) { // Under 5 minutes
      addAchievement(`${roomId}_speed`);
    }

    setPhase('complete');
  };

  const useHint = () => {
    setHintsUsed(prev => prev + 1);
    // Hint content would be passed from puzzle component
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderIntro = () => (
    <motion.div 
      className="room-intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1>{room.title}</h1>
      <p className="atmosphere">{room.atmosphere}</p>
      <p className="objective">{room.description}</p>
      <div className="intro-actions">
        <button className="btn btn-secondary" onClick={onExit}>
          ← Not Ready
        </button>
        <button className="btn btn-primary" onClick={() => setPhase('puzzle')}>
          Begin Challenge →
        </button>
      </div>
    </motion.div>
  );

  const renderPuzzle = () => {
    if (!PuzzleComponent) {
      return (
        <div className="puzzle-coming-soon">
          <h2>🚧 Coming Soon</h2>
          <p>This room's puzzles are still being crafted...</p>
          <button className="btn btn-secondary" onClick={onExit}>
            Return to Laboratory
          </button>
        </div>
      );
    }

    return (
      <div className="puzzle-area">
        <div className="puzzle-header">
          <div className="puzzle-info">
            <span className="puzzle-number">Puzzle {currentPuzzle + 1}</span>
            <span className="puzzle-score">Score: {score}</span>
          </div>
          <div className="puzzle-tools">
            <button 
              className="btn btn-secondary hint-btn"
              onClick={useHint}
              disabled={hintsUsed >= 3}
            >
              💡 Hint ({3 - hintsUsed} left)
            </button>
            <button className="btn btn-secondary" onClick={onExit}>
              Exit
            </button>
          </div>
        </div>
        
        <PuzzleComponent
          puzzleIndex={currentPuzzle}
          onComplete={handlePuzzleComplete}
          hintsUsed={hintsUsed}
          onUseHint={useHint}
        />
      </div>
    );
  };

  const renderComplete = () => {
    const totalScore = puzzleResults.reduce((sum, r) => sum + r.score, 0);
    const totalMaxScore = puzzleResults.reduce((sum, r) => sum + r.maxScore, 0);
    const percentage = Math.round((totalScore / totalMaxScore) * 100);
    const elapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    
    const room = state.rooms[roomId];
    const stars = room.stars;

    return (
      <motion.div 
        className="room-complete"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="complete-ornament">🏆</div>
        <h1>Chamber Cleared!</h1>
        
        <div className="complete-stars">
          {Array.from({ length: 3 }, (_, i) => (
            <motion.span 
              key={i} 
              className={`star ${i < stars ? 'earned' : ''}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5 + i * 0.2 }}
            >
              ★
            </motion.span>
          ))}
        </div>

        <div className="complete-stats">
          <div className="stat-item">
            <span className="stat-label">Score</span>
            <span className="stat-value">{totalScore}/{totalMaxScore}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Accuracy</span>
            <span className="stat-value">{percentage}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Time</span>
            <span className="stat-value">{formatTime(elapsed)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Hints Used</span>
            <span className="stat-value">{hintsUsed}</span>
          </div>
        </div>

        {stars < 3 && (
          <p className="improvement-tip">
            💡 Try again without hints and above 95% accuracy for 3 stars!
          </p>
        )}

        <div className="complete-actions">
          <button className="btn btn-secondary" onClick={() => {
            setPhase('puzzle');
            setCurrentPuzzle(0);
            setScore(0);
            setMaxScore(0);
            setHintsUsed(0);
            setPuzzleResults([]);
            setStartTime(Date.now());
          }}>
            Try Again
          </button>
          <button className="btn btn-primary" onClick={onComplete}>
            Continue →
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="room">
      <AnimatePresence mode="wait">
        {phase === 'intro' && renderIntro()}
        {phase === 'puzzle' && renderPuzzle()}
        {phase === 'complete' && renderComplete()}
      </AnimatePresence>
    </div>
  );
};

export default Room;
