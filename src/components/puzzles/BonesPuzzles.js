import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { allBones, foramina, landmarks } from '../../data/bones';
import './BonesPuzzles.css';

// Puzzle definitions
const puzzles = [
  {
    id: 'skull-bones',
    type: 'matching',
    title: 'The Bone Cipher',
    description: 'Match each bone to its correct description to unlock the first lock.',
    generateContent: () => {
      const selectedBones = allBones.slice(0, 6);
      return {
        items: selectedBones.map(bone => ({
          id: bone.id,
          name: bone.name,
          hint: bone.location,
        })),
        pairs: selectedBones.map(bone => ({
          id: bone.id,
          text: bone.location,
        })).sort(() => Math.random() - 0.5),
      };
    },
  },
  {
    id: 'foramen-code',
    type: 'code',
    title: 'The Foramen Lock',
    description: 'Solve the riddles to find the 4-digit code.',
    questions: [
      {
        riddle: 'I am the largest opening in the skull. The spinal cord passes through me. Count my letters.',
        answer: '13', // FORAMEN MAGNUM = 13 letters
        hint: 'Foramen _______ (Latin for "great")',
        solution: 'FORAMEN MAGNUM has 13 letters',
        structure: 'foramen_magnum',
      },
      {
        riddle: 'The mandibular nerve (V3) exits through me. I am shaped like an egg. How many sides does an egg have?',
        answer: '0',
        hint: 'Oval... like an egg...',
        solution: 'Foramen OVALE - an egg (oval) has 0 sides (it\'s curved)',
        structure: 'foramen_ovale',
      },
      {
        riddle: 'I carry the facial nerve out of the skull. I am between the styloid and mastoid processes. What number is VII in Arabic numerals?',
        answer: '7',
        hint: 'Stylomastoid foramen carries CN ___',
        solution: 'Stylomastoid foramen - Facial nerve is CN VII = 7',
        structure: 'stylomastoid_foramen',
      },
      {
        riddle: 'How many bones form the orbit of the eye?',
        answer: '7',
        hint: 'Frontal, Zygomatic, Maxilla, Lacrimal, Ethmoid, Sphenoid, Palatine',
        solution: '7 bones: Frontal, Zygomatic, Maxilla, Lacrimal, Ethmoid, Sphenoid, Palatine',
        structure: 'orbit',
      },
    ],
  },
  {
    id: 'suture-path',
    type: 'sequence',
    title: 'The Sutured Path',
    description: 'Arrange these landmarks in order from anterior to posterior on the skull.',
    items: [
      { id: 'glabella', name: 'Glabella', position: 1 },
      { id: 'nasion', name: 'Nasion', position: 2 },
      { id: 'bregma', name: 'Bregma', position: 3 },
      { id: 'lambda', name: 'Lambda', position: 4 },
      { id: 'inion', name: 'Inion (Ext. Occipital Protuberance)', position: 5 },
    ],
  },
  {
    id: 'bone-identify',
    type: 'identify',
    title: 'The Final Lock',
    description: 'Identify these structures to complete the vault.',
    questions: [
      {
        question: 'Which bone contains the sella turcica (housing the pituitary gland)?',
        options: ['Ethmoid', 'Sphenoid', 'Temporal', 'Frontal'],
        correct: 'Sphenoid',
        explanation: 'The sella turcica ("Turkish saddle") is a depression in the sphenoid bone.',
        structure: 'sphenoid',
      },
      {
        question: 'The pterion is clinically important because:',
        options: [
          'It is the thickest part of the skull',
          'The middle meningeal artery runs beneath it',
          'It contains the foramen magnum',
          'The optic nerve passes through it',
        ],
        correct: 'The middle meningeal artery runs beneath it',
        explanation: 'The pterion is the WEAKEST point of the skull. Trauma here can damage the middle meningeal artery, causing epidural hematoma.',
        structure: 'pterion',
      },
      {
        question: 'Which foramen transmits the maxillary nerve (V2)?',
        options: ['Foramen ovale', 'Foramen rotundum', 'Foramen spinosum', 'Superior orbital fissure'],
        correct: 'Foramen rotundum',
        explanation: 'Foramen Rotundum (round) → V2 (maxillary). Foramen Ovale → V3 (mandibular).',
        structure: 'foramen_rotundum',
      },
      {
        question: 'The cribriform plate is part of which bone?',
        options: ['Sphenoid', 'Frontal', 'Ethmoid', 'Nasal'],
        correct: 'Ethmoid',
        explanation: 'The cribriform plate of the ethmoid has tiny holes for olfactory nerve fibers. Fracture can cause CSF rhinorrhea.',
        structure: 'ethmoid',
      },
      {
        question: 'Which is the only movable bone of the skull?',
        options: ['Maxilla', 'Temporal', 'Mandible', 'Zygomatic'],
        correct: 'Mandible',
        explanation: 'The mandible articulates with the temporal bone at the TMJ - the only synovial joint of the skull.',
        structure: 'mandible',
      },
    ],
  },
];

const BonesPuzzles = ({ puzzleIndex, onComplete, hintsUsed, onUseHint }) => {
  const [currentPuzzle, setCurrentPuzzle] = useState(puzzles[puzzleIndex] || puzzles[0]);
  const [puzzleState, setPuzzleState] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    initializePuzzle(puzzles[puzzleIndex] || puzzles[0]);
  }, [puzzleIndex]);

  const initializePuzzle = (puzzle) => {
    setCurrentPuzzle(puzzle);
    setFeedback(null);
    setIsComplete(false);
    
    switch (puzzle.type) {
      case 'matching':
        const content = puzzle.generateContent();
        setPuzzleState({
          items: content.items,
          pairs: content.pairs,
          matches: {},
          selectedItem: null,
        });
        break;
      case 'code':
        setPuzzleState({
          answers: ['', '', '', ''],
          currentQuestion: 0,
          revealed: [false, false, false, false],
        });
        break;
      case 'sequence':
        setPuzzleState({
          items: [...puzzle.items].sort(() => Math.random() - 0.5),
          correctOrder: puzzle.items.map(i => i.id),
        });
        break;
      case 'identify':
        setPuzzleState({
          currentQuestion: 0,
          answers: [],
          score: 0,
        });
        break;
      default:
        setPuzzleState({});
    }
  };

  const handleMatchingSelect = (type, id) => {
    if (type === 'item') {
      setPuzzleState(prev => ({ ...prev, selectedItem: id }));
    } else if (type === 'pair' && puzzleState.selectedItem) {
      const isCorrect = puzzleState.selectedItem === id;
      
      if (isCorrect) {
        const newMatches = { ...puzzleState.matches, [puzzleState.selectedItem]: id };
        setPuzzleState(prev => ({
          ...prev,
          matches: newMatches,
          selectedItem: null,
        }));
        
        // Check if all matched
        if (Object.keys(newMatches).length === puzzleState.items.length) {
          setFeedback({ type: 'success', message: 'All bones matched correctly!' });
          setTimeout(() => completePuzzle(Object.keys(newMatches).length, puzzleState.items.length), 1500);
        }
      } else {
        setFeedback({ type: 'error', message: 'Not quite right. Try again!' });
        setTimeout(() => setFeedback(null), 1500);
      }
    }
  };

  const handleCodeInput = (index, value) => {
    const newAnswers = [...puzzleState.answers];
    newAnswers[index] = value;
    setPuzzleState(prev => ({ ...prev, answers: newAnswers }));
  };

  const checkCodeAnswer = (index) => {
    const question = currentPuzzle.questions[index];
    const userAnswer = puzzleState.answers[index].trim();
    const isCorrect = userAnswer === question.answer;
    
    if (isCorrect) {
      const newRevealed = [...puzzleState.revealed];
      newRevealed[index] = true;
      setPuzzleState(prev => ({ ...prev, revealed: newRevealed }));
      setFeedback({ type: 'success', message: `Correct! ${question.solution}` });
      
      // Check if all solved
      if (newRevealed.filter(Boolean).length === currentPuzzle.questions.length) {
        setTimeout(() => completePuzzle(4, 4), 2000);
      }
    } else {
      setFeedback({ type: 'error', message: 'Not quite. Think about the riddle again.' });
    }
    
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleSequenceReorder = (dragIndex, dropIndex) => {
    const newItems = [...puzzleState.items];
    const [removed] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, removed);
    setPuzzleState(prev => ({ ...prev, items: newItems }));
  };

  const checkSequence = () => {
    const isCorrect = puzzleState.items.every((item, index) => 
      item.id === puzzleState.correctOrder[index]
    );
    
    if (isCorrect) {
      setFeedback({ type: 'success', message: 'Perfect! The path is clear.' });
      setTimeout(() => completePuzzle(puzzleState.items.length, puzzleState.items.length), 1500);
    } else {
      let correctCount = puzzleState.items.filter((item, index) => 
        item.id === puzzleState.correctOrder[index]
      ).length;
      setFeedback({ 
        type: 'error', 
        message: `${correctCount}/${puzzleState.items.length} in correct position. Keep trying!` 
      });
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const handleIdentifyAnswer = (answer) => {
    const question = currentPuzzle.questions[puzzleState.currentQuestion];
    const isCorrect = answer === question.correct;
    
    const newAnswers = [...puzzleState.answers, { answer, isCorrect }];
    const newScore = puzzleState.score + (isCorrect ? 1 : 0);
    
    setFeedback({ 
      type: isCorrect ? 'success' : 'error', 
      message: isCorrect ? 'Correct!' : `Incorrect. ${question.explanation}`,
      explanation: question.explanation,
    });
    
    setTimeout(() => {
      setFeedback(null);
      if (puzzleState.currentQuestion < currentPuzzle.questions.length - 1) {
        setPuzzleState(prev => ({
          ...prev,
          currentQuestion: prev.currentQuestion + 1,
          answers: newAnswers,
          score: newScore,
        }));
      } else {
        completePuzzle(newScore, currentPuzzle.questions.length);
      }
    }, 2500);
  };

  const completePuzzle = (score, maxScore) => {
    setIsComplete(true);
    onComplete({
      puzzleId: currentPuzzle.id,
      score,
      maxScore,
      isLast: puzzleIndex >= puzzles.length - 1,
      structures: [], // Could track which structures were tested
    });
  };

  const renderMatching = () => (
    <div className="matching-puzzle">
      <div className="matching-columns">
        <div className="matching-column items-column">
          <h4>Bones</h4>
          {puzzleState.items?.map(item => (
            <button
              key={item.id}
              className={`match-item ${puzzleState.matches[item.id] ? 'matched' : ''} ${puzzleState.selectedItem === item.id ? 'selected' : ''}`}
              onClick={() => !puzzleState.matches[item.id] && handleMatchingSelect('item', item.id)}
              disabled={!!puzzleState.matches[item.id]}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="matching-column pairs-column">
          <h4>Locations</h4>
          {puzzleState.pairs?.map(pair => (
            <button
              key={pair.id}
              className={`match-pair ${Object.values(puzzleState.matches || {}).includes(pair.id) ? 'matched' : ''}`}
              onClick={() => !Object.values(puzzleState.matches || {}).includes(pair.id) && handleMatchingSelect('pair', pair.id)}
              disabled={Object.values(puzzleState.matches || {}).includes(pair.id)}
            >
              {pair.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCode = () => (
    <div className="code-puzzle">
      <div className="code-display">
        {puzzleState.answers?.map((digit, i) => (
          <div key={i} className={`code-digit ${puzzleState.revealed?.[i] ? 'revealed' : ''}`}>
            {puzzleState.revealed?.[i] ? digit : '?'}
          </div>
        ))}
      </div>
      
      <div className="riddles">
        {currentPuzzle.questions.map((q, index) => (
          <div key={index} className={`riddle ${puzzleState.revealed?.[index] ? 'solved' : ''}`}>
            <span className="riddle-number">{index + 1}.</span>
            <p className="riddle-text">{q.riddle}</p>
            {!puzzleState.revealed?.[index] && (
              <div className="riddle-input">
                <input
                  type="text"
                  value={puzzleState.answers?.[index] || ''}
                  onChange={(e) => handleCodeInput(index, e.target.value)}
                  placeholder="?"
                  maxLength={2}
                />
                <button className="btn" onClick={() => checkCodeAnswer(index)}>
                  Check
                </button>
                {hintsUsed < 3 && (
                  <button className="btn btn-secondary hint-mini" onClick={onUseHint}>
                    💡
                  </button>
                )}
              </div>
            )}
            {puzzleState.revealed?.[index] && (
              <p className="riddle-solution">✓ {q.solution}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderSequence = () => (
    <div className="sequence-puzzle">
      <p className="sequence-instruction">Drag to reorder (or click swap buttons):</p>
      <div className="sequence-items">
        {puzzleState.items?.map((item, index) => (
          <div key={item.id} className="sequence-item">
            <span className="sequence-number">{index + 1}</span>
            <span className="sequence-name">{item.name}</span>
            <div className="sequence-controls">
              {index > 0 && (
                <button 
                  className="seq-btn"
                  onClick={() => handleSequenceReorder(index, index - 1)}
                >
                  ↑
                </button>
              )}
              {index < puzzleState.items.length - 1 && (
                <button 
                  className="seq-btn"
                  onClick={() => handleSequenceReorder(index, index + 1)}
                >
                  ↓
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-primary check-sequence" onClick={checkSequence}>
        Check Order
      </button>
    </div>
  );

  const renderIdentify = () => {
    const question = currentPuzzle.questions[puzzleState.currentQuestion];
    if (!question) return null;
    
    return (
      <div className="identify-puzzle">
        <div className="question-progress">
          Question {puzzleState.currentQuestion + 1} of {currentPuzzle.questions.length}
        </div>
        <div className="question-card">
          <p className="question-text">{question.question}</p>
          <div className="question-options">
            {question.options.map((option, i) => (
              <button
                key={i}
                className={`option-btn ${
                  feedback 
                    ? option === question.correct 
                      ? 'correct' 
                      : puzzleState.answers[puzzleState.currentQuestion]?.answer === option 
                        ? 'incorrect' 
                        : ''
                    : ''
                }`}
                onClick={() => !feedback && handleIdentifyAnswer(option)}
                disabled={!!feedback}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bones-puzzle">
      <div className="puzzle-content">
        <h2>{currentPuzzle.title}</h2>
        <p className="puzzle-description">{currentPuzzle.description}</p>
        
        {currentPuzzle.type === 'matching' && renderMatching()}
        {currentPuzzle.type === 'code' && renderCode()}
        {currentPuzzle.type === 'sequence' && renderSequence()}
        {currentPuzzle.type === 'identify' && renderIdentify()}
        
        <AnimatePresence>
          {feedback && (
            <motion.div 
              className={`puzzle-feedback ${feedback.type}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BonesPuzzles;
