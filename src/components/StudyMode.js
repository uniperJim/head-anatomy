import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { allBones, foramina, sutures, landmarks } from '../data/bones';
import { allMuscles, muscleConcepts } from '../data/muscles';
import './StudyMode.css';

// Section images for bones
import schaedelKnochen from '../assets/images/schaedel_knochen.png';
import gesichtsKnochen from '../assets/images/gesichts_knochen.png';
import wichtigeForamina from '../assets/images/wichtige_foramina.png';
import landmarkenSuturen from '../assets/images/landmarken_und_suturen.png';

// Map section IDs to their images
const sectionImages = {
  cranial: schaedelKnochen,
  facial: gesichtsKnochen,
  foramina: wichtigeForamina,
  landmarks: landmarkenSuturen,
};

// Content maps for each room
const roomContent = {
  bones: {
    title: 'Knochen des Schädels',
    subtitle: 'Lerne die Schädelknochen, Gesichtsknochen, Foramina und ihre Beziehungen',
    sections: [
      { id: 'cranial', title: 'Schädelknochen (Ossa cranii)', items: allBones.filter(b => b.type === 'cranial') },
      { id: 'facial', title: 'Gesichtsknochen (Ossa faciei)', items: allBones.filter(b => b.type === 'facial') },
      { id: 'foramina', title: 'Wichtige Foramina', items: foramina.slice(0, 10) },
      { id: 'landmarks', title: 'Landmarken & Suturen', items: [...landmarks, ...sutures] },
    ],
  },
  muscles: {
    title: 'Muskeln des Kopfes',
    subtitle: 'Beherrsche die Kaumuskeln und mimische Muskulatur',
    sections: [
      { id: 'mastication', title: 'Kaumuskeln (Mm. masticatorii)', items: allMuscles.filter(m => m.category === 'mastication') },
      { id: 'expression', title: 'Mimische Muskeln (Mm. faciei)', items: allMuscles.filter(m => m.category === 'expression') },
      { id: 'concepts', title: 'Schlüsselkonzepte', items: Object.values(muscleConcepts) },
    ],
  },
  vessels: {
    title: 'Blutgefäße des Kopfes',
    subtitle: 'Verfolge die Arterien und Venen',
    sections: [], // TODO: Add vessel data
  },
  nerves: {
    title: 'Hirnnerven',
    subtitle: 'Navigiere durch die Nervenbahnen',
    sections: [], // TODO: Add nerve data
  },
  clinical: {
    title: 'Klinische Fälle',
    subtitle: 'Wende dein Wissen an',
    sections: [], // TODO: Add clinical cases
  },
};

const StudyMode = ({ roomId, onBack, onReady }) => {
  const { updateStudyProgress } = useGame();
  const [currentSection, setCurrentSection] = useState(0);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewedCards, setViewedCards] = useState(new Set());
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState(null);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [showFeedback, setShowFeedback] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const content = roomContent[roomId] || roomContent.bones;
  const currentSectionData = content.sections[currentSection];
  const currentItem = currentSectionData?.items[currentCard];
  
  const totalCards = content.sections.reduce((sum, s) => sum + s.items.length, 0);
  const progress = (viewedCards.size / totalCards) * 100;

  // Track viewed cards
  useEffect(() => {
    if (currentItem) {
      setViewedCards(prev => new Set([...prev, `${currentSection}-${currentCard}`]));
    }
  }, [currentSection, currentCard, currentItem]);

  const nextCard = () => {
    setIsFlipped(false);
    if (currentCard < currentSectionData.items.length - 1) {
      setCurrentCard(prev => prev + 1);
    } else if (currentSection < content.sections.length - 1) {
      setCurrentSection(prev => prev + 1);
      setCurrentCard(0);
    }
  };

  const prevCard = () => {
    setIsFlipped(false);
    if (currentCard > 0) {
      setCurrentCard(prev => prev - 1);
    } else if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
      const prevSectionItems = content.sections[currentSection - 1].items;
      setCurrentCard(prevSectionItems.length - 1);
    }
  };

  const startQuiz = () => {
    setQuizMode(true);
    generateQuizQuestion();
  };

  const generateQuizQuestion = () => {
    // Flatten all items for quiz
    const allItems = content.sections.flatMap(s => s.items);
    const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
    
    // Generate different question types
    const questionTypes = ['identify', 'function', 'clinical'];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    let question, correctAnswer, options;
    
    if (type === 'identify' && randomItem.name) {
      question = randomItem.location 
        ? `Welche Struktur befindet sich: ${randomItem.location}?`
        : `Welche Struktur hat folgende Merkmale: ${randomItem.keyFeatures?.[0] || randomItem.action || randomItem.contents?.[0]}?`;
      correctAnswer = randomItem.name;
      options = generateOptions(randomItem.name, allItems.map(i => i.name).filter(Boolean));
    } else if (type === 'function' && (randomItem.action || randomItem.contents)) {
      question = `Was ist die Funktion/der Inhalt von ${randomItem.name}?`;
      correctAnswer = randomItem.action || randomItem.contents?.join(', ') || 'Unbekannt';
      // For function questions, we just show the answer
      options = null;
    } else {
      question = randomItem.clinicalNotes 
        ? `Klinische Notiz zu ${randomItem.name}: Was ist klinisch relevant?`
        : `Was weißt du über ${randomItem.name}?`;
      correctAnswer = randomItem.clinicalNotes || randomItem.location || 'Siehe Lernkarte für Details';
      options = null;
    }

    setQuizQuestion({
      question,
      correctAnswer,
      options,
      item: randomItem,
    });
    setShowFeedback(null);
  };

  const generateOptions = (correct, allOptions) => {
    const filtered = allOptions.filter(o => o && o !== correct);
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    const wrong = shuffled.slice(0, 3);
    return [...wrong, correct].sort(() => Math.random() - 0.5);
  };

  const handleQuizAnswer = (answer) => {
    const isCorrect = answer === quizQuestion.correctAnswer;
    setShowFeedback({ isCorrect, correctAnswer: quizQuestion.correctAnswer });
    setQuizScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    // Track mastery
    if (quizQuestion.item?.id) {
      // updateMastery would be called here
    }

    setTimeout(() => {
      if (quizScore.total + 1 >= 5) {
        // After 5 questions, offer to continue or go to challenge
        setQuizMode(false);
        updateStudyProgress(roomId, { readyForChallenge: true });
      } else {
        generateQuizQuestion();
      }
    }, 2000);
  };

  const renderCardContent = () => {
    if (!currentItem) return null;

    // Different card layouts based on item type
    if (currentItem.keyFeatures) {
      // Bone card
      return (
        <div className="study-card bone-card">
          <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
            <div className="card-front">
              <h3>{currentItem.name}</h3>
              {currentItem.germanName && <p className="german-name">{currentItem.germanName}</p>}
              <p className="card-location">{currentItem.location}</p>
              {currentItem.count > 1 && (
                <span className="card-count">×{currentItem.count}</span>
              )}
              <button className="flip-hint" onClick={() => setIsFlipped(true)}>
                Klicke für Details →
              </button>
            </div>
            <div className="card-back">
              <h4>Wichtige Merkmale</h4>
              <ul className="feature-list">
                {currentItem.keyFeatures?.slice(0, 5).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              
              {currentItem.clinicalNotes && (
                <div className="clinical-note">
                  <h4>🏥 Klinik</h4>
                  <p>{currentItem.clinicalNotes}</p>
                </div>
              )}
              
              {currentItem.mnemonics && (
                <div className="mnemonic">
                  <h4>💡 Merkhilfe</h4>
                  <p>{currentItem.mnemonics}</p>
                </div>
              )}
              
              <button className="flip-hint" onClick={() => setIsFlipped(false)}>
                ← Zurück
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentItem.action || currentItem.innervation) {
      // Muscle card
      return (
        <div className="study-card muscle-card">
          <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
            <div className="card-front">
              <h3>{currentItem.name}</h3>
              {currentItem.germanName && <p className="german-name">{currentItem.germanName}</p>}
              <p className="card-category">{currentItem.category}</p>
              <p className="card-action">{currentItem.action}</p>
              <button className="flip-hint" onClick={() => setIsFlipped(true)}>
                Klicke für Details →
              </button>
            </div>
            <div className="card-back">
              <div className="muscle-details">
                <p><strong>Ursprung:</strong> {currentItem.origin}</p>
                <p><strong>Ansatz:</strong> {currentItem.insertion}</p>
                <p><strong>Innervation:</strong> {currentItem.innervation}</p>
              </div>
              
              {currentItem.clinicalNotes && (
                <div className="clinical-note">
                  <h4>🏥 Klinik</h4>
                  <p>{currentItem.clinicalNotes}</p>
                </div>
              )}
              
              <button className="flip-hint" onClick={() => setIsFlipped(false)}>
                ← Zurück
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentItem.contents) {
      // Foramen card
      return (
        <div className="study-card foramen-card">
          <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
            <div className="card-front">
              <h3>{currentItem.name}</h3>
              {currentItem.germanName && <p className="german-name">{currentItem.germanName}</p>}
              <p className="card-bone">In: {currentItem.bone}</p>
              <button className="flip-hint" onClick={() => setIsFlipped(true)}>
                Was tritt hindurch? →
              </button>
            </div>
            <div className="card-back">
              <h4>Inhalt</h4>
              <ul className="contents-list">
                {currentItem.contents.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
              
              {currentItem.clinicalNotes && (
                <div className="clinical-note">
                  <h4>🏥 Klinik</h4>
                  <p>{currentItem.clinicalNotes}</p>
                </div>
              )}
              
              {currentItem.mnemonics && (
                <div className="mnemonic">
                  <h4>💡 Merkhilfe</h4>
                  <p>{currentItem.mnemonics}</p>
                </div>
              )}
              
              <button className="flip-hint" onClick={() => setIsFlipped(false)}>
                ← Zurück
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Generic card
    return (
      <div className="study-card generic-card">
        <div className="card-inner">
          <h3>{currentItem.name || currentItem.fact}</h3>
          <p>{currentItem.location || currentItem.significance || currentItem.mnemonic}</p>
          {currentItem.clinicalNotes && (
            <div className="clinical-note">
              <p>{currentItem.clinicalNotes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    if (!quizQuestion) return null;

    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <h3>Schnell-Quiz</h3>
          <span className="quiz-score">
            Punkte: {quizScore.correct}/{quizScore.total}
          </span>
        </div>

        <div className="quiz-question">
          <p>{quizQuestion.question}</p>
        </div>

        {quizQuestion.options ? (
          <div className="quiz-options">
            {quizQuestion.options.map((option, i) => (
              <button
                key={i}
                className={`quiz-option ${
                  showFeedback
                    ? option === quizQuestion.correctAnswer
                      ? 'correct'
                      : 'incorrect'
                    : ''
                }`}
                onClick={() => !showFeedback && handleQuizAnswer(option)}
                disabled={!!showFeedback}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <div className="quiz-recall">
            <p className="recall-prompt">Überlege deine Antwort, dann aufdecken:</p>
            {!showFeedback ? (
              <button 
                className="btn btn-primary"
                onClick={() => setShowFeedback({ isCorrect: null, correctAnswer: quizQuestion.correctAnswer })}
              >
                Antwort zeigen
              </button>
            ) : (
              <div className="answer-reveal">
                <p className="correct-answer">{quizQuestion.correctAnswer}</p>
                <div className="self-assess">
                  <p>Hattest du recht?</p>
                  <button 
                    className="btn btn-success"
                    onClick={() => {
                      setQuizScore(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
                      generateQuizQuestion();
                    }}
                  >
                    ✓ Ja
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setQuizScore(prev => ({ ...prev, total: prev.total + 1 }));
                      generateQuizQuestion();
                    }}
                  >
                    ✗ Nein
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {showFeedback && showFeedback.isCorrect !== null && (
            <motion.div 
              className={`quiz-feedback ${showFeedback.isCorrect ? 'correct' : 'incorrect'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {showFeedback.isCorrect ? '✓ Richtig!' : `✗ Die Antwort ist: ${showFeedback.correctAnswer}`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="study-mode">
      <header className="study-header">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Zurück
        </button>
        <div className="study-title">
          <h1>{content.title}</h1>
          <p>{content.subtitle}</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={onReady}
        >
          Herausforderung starten →
        </button>
      </header>

      <div className="study-progress">
        <div className="progress-bar">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-text">
          {viewedCards.size}/{totalCards} Karten gelernt
        </span>
      </div>

      <div className="study-tabs">
        {!quizMode ? (
          <>
            <div className="section-tabs">
              {content.sections.map((section, i) => (
                <button
                  key={section.id}
                  className={`tab ${currentSection === i ? 'active' : ''}`}
                  onClick={() => { setCurrentSection(i); setCurrentCard(0); setIsFlipped(false); }}
                >
                  {section.title}
                  <span className="tab-count">{section.items.length}</span>
                </button>
              ))}
            </div>
            <button className="btn quiz-btn" onClick={startQuiz}>
              🧠 Schnell-Quiz
            </button>
          </>
        ) : (
          <button className="btn btn-secondary" onClick={() => setQuizMode(false)}>
            ← Zurück zum Lernen
          </button>
        )}
      </div>

      <main className="study-content">
        {!quizMode ? (
          <>
            <div className="study-layout">
              {/* Left: Cards and navigation */}
              <div className="study-cards-area">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentSection}-${currentCard}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderCardContent()}
                  </motion.div>
                </AnimatePresence>

                    <div className="card-navigation">
                  <button 
                    className="btn nav-btn"
                    onClick={prevCard}
                    disabled={currentSection === 0 && currentCard === 0}
                  >
                    ← Zurück
                  </button>
                  <span className="card-position">
                    {currentCard + 1} / {currentSectionData?.items.length || 0}
                  </span>
                  <button 
                    className="btn nav-btn"
                    onClick={nextCard}
                    disabled={
                      currentSection === content.sections.length - 1 && 
                      currentCard === (currentSectionData?.items.length || 1) - 1
                    }
                  >
                    Weiter →
                  </button>
                </div>
              </div>

              {/* Right: Reference image */}
              {currentSectionData && sectionImages[currentSectionData.id] && (
                <div 
                  className="section-image-panel"
                  onClick={() => setLightboxOpen(true)}
                  title="Klicken für Vollbild"
                >
                  <img 
                    src={sectionImages[currentSectionData.id]} 
                    alt={currentSectionData.title}
                  />
                  <span className="image-hint">🔍 Klicken zum Vergrößern</span>
                </div>
              )}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
              {lightboxOpen && sectionImages[currentSectionData?.id] && (
                <motion.div
                  className="lightbox-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setLightboxOpen(false)}
                >
                  <motion.div
                    className="lightbox-content"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      className="lightbox-close"
                      onClick={() => setLightboxOpen(false)}
                    >
                      ✕
                    </button>
                    <img 
                      src={sectionImages[currentSectionData.id]} 
                      alt={currentSectionData.title}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          renderQuiz()
        )}
      </main>

      {quizScore.total >= 5 && !quizMode && (
        <motion.div 
          className="ready-banner"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>🎉 Super gemacht! Du hast das Quiz abgeschlossen!</h3>
          <p>
            Punkte: {quizScore.correct}/{quizScore.total} 
            ({Math.round((quizScore.correct / quizScore.total) * 100)}%)
          </p>
          <button className="btn btn-primary" onClick={onReady}>
            Bereit für die Herausforderung? →
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default StudyMode;
