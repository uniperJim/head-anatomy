import React, { useState, useEffect } from 'react';
import { GameProvider } from './context/GameContext';
import TitleScreen from './components/TitleScreen';
import Laboratory from './components/Laboratory';
import StudyMode from './components/StudyMode';
import Room from './components/Room';
import ProgressDashboard from './components/ProgressDashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('title');
  const [currentRoom, setCurrentRoom] = useState(null);

  const navigateTo = (view, roomId = null) => {
    setCurrentView(view);
    if (roomId) setCurrentRoom(roomId);
  };

  const renderView = () => {
    switch (currentView) {
      case 'title':
        return <TitleScreen onStart={() => navigateTo('laboratory')} />;
      case 'laboratory':
        return (
          <Laboratory 
            onEnterRoom={(roomId) => navigateTo('room', roomId)}
            onStudy={(roomId) => navigateTo('study', roomId)}
            onProgress={() => navigateTo('progress')}
          />
        );
      case 'study':
        return (
          <StudyMode 
            roomId={currentRoom}
            onBack={() => navigateTo('laboratory')}
            onReady={() => navigateTo('room', currentRoom)}
          />
        );
      case 'room':
        return (
          <Room 
            roomId={currentRoom}
            onExit={() => navigateTo('laboratory')}
            onComplete={() => navigateTo('laboratory')}
          />
        );
      case 'progress':
        return (
          <ProgressDashboard 
            onBack={() => navigateTo('laboratory')}
          />
        );
      default:
        return <TitleScreen onStart={() => navigateTo('laboratory')} />;
    }
  };

  return (
    <GameProvider>
      <div className="app">
        {renderView()}
      </div>
    </GameProvider>
  );
}

export default App;
