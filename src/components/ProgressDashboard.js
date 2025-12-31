import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { allBones, foramina } from '../data/bones';
import { allMuscles } from '../data/muscles';
import './ProgressDashboard.css';

const ProgressDashboard = ({ onBack }) => {
  const { state, getMasteryLevel, isStructureMastered, resetProgress } = useGame();
  const { rooms, player, mastery } = state;

  // Calculate overall stats
  const totalStructures = allBones.length + foramina.length + allMuscles.length;
  const masteredCount = Object.keys(mastery).filter(id => isStructureMastered(id)).length;
  const attemptedCount = Object.keys(mastery).length;
  
  const roomsCompleted = Object.values(rooms).filter(r => r.completed).length;
  const totalRooms = Object.keys(rooms).length;
  
  const totalStars = Object.values(rooms).reduce((sum, r) => sum + r.stars, 0);
  const maxStars = Object.values(rooms).reduce((sum, r) => sum + r.maxStars, 0);

  // Group structures by category
  const structureCategories = [
    { name: 'Cranial Bones', items: allBones.filter(b => b.type === 'cranial') },
    { name: 'Facial Bones', items: allBones.filter(b => b.type === 'facial') },
    { name: 'Foramina', items: foramina.slice(0, 15) },
    { name: 'Muscles of Mastication', items: allMuscles.filter(m => m.category === 'mastication') },
    { name: 'Muscles of Expression', items: allMuscles.filter(m => m.category === 'expression').slice(0, 10) },
  ];

  const getMasteryColor = (level) => {
    if (level >= 100) return 'mastered';
    if (level >= 60) return 'learning';
    if (level > 0) return 'started';
    return 'new';
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      resetProgress();
    }
  };

  return (
    <div className="progress-dashboard">
      <header className="dashboard-header">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <h1>Progress Dashboard</h1>
        <button className="btn btn-secondary reset-btn" onClick={handleReset}>
          Reset Progress
        </button>
      </header>

      <main className="dashboard-main">
        {/* Overview Stats */}
        <section className="overview-section">
          <div className="stat-cards">
            <motion.div 
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="stat-icon">🏛️</div>
              <div className="stat-content">
                <span className="stat-value">{roomsCompleted}/{totalRooms}</span>
                <span className="stat-label">Rooms Cleared</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${(roomsCompleted / totalRooms) * 100}%` }}
                />
              </div>
            </motion.div>

            <motion.div 
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <span className="stat-value">{totalStars}/{maxStars}</span>
                <span className="stat-label">Stars Earned</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${(totalStars / maxStars) * 100}%` }}
                />
              </div>
            </motion.div>

            <motion.div 
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="stat-icon">🧠</div>
              <div className="stat-content">
                <span className="stat-value">{attemptedCount}</span>
                <span className="stat-label">Structures Studied</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${(attemptedCount / totalStructures) * 100}%` }}
                />
              </div>
            </motion.div>

            <motion.div 
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="stat-icon">👑</div>
              <div className="stat-content">
                <span className="stat-value">{masteredCount}</span>
                <span className="stat-label">Structures Mastered</span>
              </div>
              <div className="progress-bar mastery">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${(masteredCount / totalStructures) * 100}%` }}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Mastery Legend */}
        <section className="legend-section">
          <h3>Mastery Levels</h3>
          <div className="legend">
            <span className="legend-item new">○ Not started</span>
            <span className="legend-item started">◐ Started</span>
            <span className="legend-item learning">◑ Learning</span>
            <span className="legend-item mastered">● Mastered</span>
          </div>
          <p className="legend-note">
            Master a structure by: recognizing it (2×), recalling it (2×), and applying it clinically (1×)
          </p>
        </section>

        {/* Structure Mastery Grid */}
        <section className="mastery-section">
          <h2>Structure Mastery</h2>
          
          {structureCategories.map((category, catIndex) => (
            <motion.div 
              key={category.name}
              className="category-group"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 * catIndex }}
            >
              <h3>{category.name}</h3>
              <div className="structure-grid">
                {category.items.map(item => {
                  const level = getMasteryLevel(item.id);
                  const status = getMasteryColor(level);
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`structure-item ${status}`}
                      title={`${item.name}: ${level}% mastery`}
                    >
                      <span className="structure-indicator"></span>
                      <span className="structure-name">{item.name}</span>
                      {level > 0 && (
                        <span className="structure-level">{level}%</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </section>

        {/* Achievements */}
        <section className="achievements-section">
          <h2>Achievements</h2>
          <div className="achievements-grid">
            {[
              { id: 'bones_perfect', name: 'Bone Master', desc: '3 stars in Bony Vault', icon: '🦴' },
              { id: 'bones_no_hints', name: 'Independent Scholar', desc: 'Complete bones without hints', icon: '📚' },
              { id: 'bones_speed', name: 'Speed Anatomist', desc: 'Complete bones in under 5 min', icon: '⚡' },
              { id: 'muscles_perfect', name: 'Muscle Master', desc: '3 stars in Muscle Chamber', icon: '💪' },
              { id: 'all_rooms', name: 'Grand Anatomist', desc: 'Complete all rooms', icon: '🏆' },
            ].map(achievement => {
              const earned = player.achievements.includes(achievement.id);
              return (
                <div 
                  key={achievement.id}
                  className={`achievement ${earned ? 'earned' : 'locked'}`}
                >
                  <span className="achievement-icon">{achievement.icon}</span>
                  <div className="achievement-info">
                    <span className="achievement-name">{achievement.name}</span>
                    <span className="achievement-desc">{achievement.desc}</span>
                  </div>
                  {earned && <span className="achievement-check">✓</span>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Study Recommendations */}
        <section className="recommendations-section">
          <h2>Recommended Study</h2>
          <div className="recommendations">
            {attemptedCount === 0 ? (
              <p className="no-data">Start studying in the Laboratory to see recommendations!</p>
            ) : (
              <>
                <div className="recommendation">
                  <span className="rec-icon">🔄</span>
                  <div className="rec-content">
                    <h4>Review These Structures</h4>
                    <p>Structures you've seen but haven't mastered yet</p>
                    <div className="rec-items">
                      {Object.entries(mastery)
                        .filter(([id, data]) => !isStructureMastered(id))
                        .slice(0, 5)
                        .map(([id]) => {
                          const structure = [...allBones, ...foramina, ...allMuscles].find(s => s.id === id);
                          return structure ? (
                            <span key={id} className="rec-tag">{structure.name}</span>
                          ) : null;
                        })}
                    </div>
                  </div>
                </div>
                
                <div className="recommendation">
                  <span className="rec-icon">🆕</span>
                  <div className="rec-content">
                    <h4>Explore New Content</h4>
                    <p>You've studied {attemptedCount} of {totalStructures} structures. Keep exploring!</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProgressDashboard;
