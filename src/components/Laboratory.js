import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import './Laboratory.css';

const roomIcons = {
  bones: '🦴',
  muscles: '💪',
  vessels: '🔴',
  nerves: '⚡',
  clinical: '🏥',
};

const roomOrder = ['bones', 'muscles', 'vessels', 'nerves', 'clinical'];

const Laboratory = ({ onEnterRoom, onStudy, onProgress }) => {
  const { state, isReadyForChallenge } = useGame();
  const { rooms, player } = state;

  const getRoomStatus = (room) => {
    if (!room.unlocked) return 'locked';
    if (room.completed && room.stars === room.maxStars) return 'mastered';
    if (room.completed) return 'completed';
    return 'available';
  };

  const renderStars = (room) => {
    return Array.from({ length: room.maxStars }, (_, i) => (
      <span key={i} className={`star ${i < room.stars ? 'earned' : ''}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="laboratory">
      <header className="lab-header">
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Das Laboratorium
        </motion.h1>
        <div className="player-stats">
          <span className="stat">
            <span className="stat-icon">⭐</span>
            <span className="stat-value">{player.totalStars}</span>
            <span className="stat-label">Sterne</span>
          </span>
          <span className="stat">
            <span className="stat-icon">🏆</span>
            <span className="stat-value">{player.achievements.length}</span>
            <span className="stat-label">Erfolge</span>
          </span>
          <button className="btn btn-secondary" onClick={onProgress}>
            Fortschritt
          </button>
        </div>
      </header>

      <main className="lab-main">
        <p className="lab-intro">
          Willkommen, Lehrling. Jede Kammer enthält anatomische Rätsel zu lösen. 
          <strong> Lerne</strong> zuerst die Materialien, dann <strong>betrete</strong> die Kammer wenn du bereit bist, dein Wissen zu beweisen.
        </p>

        <div className="rooms-grid">
          {roomOrder.map((roomId, index) => {
            const room = rooms[roomId];
            const status = getRoomStatus(room);
            const ready = isReadyForChallenge(roomId);

            return (
              <motion.div
                key={room.id}
                className={`room-card ${status}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={room.unlocked ? { scale: 1.02, y: -5 } : {}}
              >
                <div className="room-number">{index + 1}</div>
                <div className="room-icon">{roomIcons[room.id]}</div>
                <h2 className="room-name">{room.name}</h2>
                <p className="room-description">{room.description}</p>
                
                <div className="room-stars">
                  {renderStars(room)}
                </div>

                <div className="room-status">
                  <span className={`badge badge-${status}`}>
                    {status === 'locked' && '🔒 Gesperrt'}
                    {status === 'available' && '📖 Verfügbar'}
                    {status === 'completed' && '✓ Abgeschlossen'}
                    {status === 'mastered' && '👑 Gemeistert'}
                  </span>
                </div>

                {room.unlocked && (
                  <div className="room-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => onStudy(room.id)}
                    >
                      📖 Lernen
                    </button>
                    <button 
                      className={`btn ${ready ? 'btn-primary' : ''}`}
                      onClick={() => onEnterRoom(room.id)}
                    >
                      🚪 Betreten
                    </button>
                  </div>
                )}

                {!room.unlocked && (
                  <div className="room-locked-message">
                    Schließe den vorherigen Raum ab, um freizuschalten
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </main>

      <footer className="lab-footer">
        <div className="lab-tip">
          💡 <strong>Tipp:</strong> Lerne das Material bevor du einen Raum betrittst. 
          Du lernst schneller und verdienst mehr Sterne!
        </div>
      </footer>
    </div>
  );
};

export default Laboratory;
