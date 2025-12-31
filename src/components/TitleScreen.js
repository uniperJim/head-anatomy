import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TitleScreen.css';

const TitleScreen = ({ onStart }) => {
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowSubtitle(true), 1000);
    const timer2 = setTimeout(() => setShowButton(true), 2000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="title-screen">
      <div className="title-background">
        <div className="floating-anatomy skull" />
        <div className="floating-anatomy bone-1" />
        <div className="floating-anatomy bone-2" />
      </div>
      
      <motion.div 
        className="title-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="title-ornament top">❧</div>
        
        <motion.h1 
          className="title"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          The Anatomist's
          <br />
          <span className="title-accent">Laboratory</span>
        </motion.h1>

        <AnimatePresence>
          {showSubtitle && (
            <motion.p 
              className="subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              An Escape Room for the Scholarly Mind
            </motion.p>
          )}
        </AnimatePresence>

        <motion.div 
          className="title-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <p>
            Master the anatomy of the human head through puzzles, 
            challenges, and clinical mysteries.
          </p>
          <div className="feature-list">
            <span>🦴 Bones & Foramina</span>
            <span>💪 Muscles</span>
            <span>🔴 Vessels</span>
            <span>⚡ Nerves</span>
          </div>
        </motion.div>

        <AnimatePresence>
          {showButton && (
            <motion.button 
              className="btn btn-primary start-button"
              onClick={onStart}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              Enter the Laboratory
            </motion.button>
          )}
        </AnimatePresence>

        <div className="title-ornament bottom">❧</div>
      </motion.div>

      <footer className="title-footer">
        <p>Learn. Solve. Master.</p>
        <p className="version">v0.1.0 — Head Anatomy</p>
      </footer>
    </div>
  );
};

export default TitleScreen;
