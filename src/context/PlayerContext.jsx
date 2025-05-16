import { createContext, useContext, useState } from 'react';
import { SONGS } from '../data/songs';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  // Cargar el estado inicial desde localStorage
  const savedState = JSON.parse(localStorage.getItem('playerState')) || {
    currentSong: SONGS[0],
    isPlaying: false,
    progress: 0,
    volume: 50,
    duration: 0
  };

  const [currentSong, setCurrentSong] = useState(savedState.currentSong);
  const [isPlaying, setIsPlaying] = useState(savedState.isPlaying);
  const [progress, setProgress] = useState(savedState.progress);
  const [volume, setVolume] = useState(savedState.volume);
  const [duration, setDuration] = useState(savedState.duration);

  // Actualizar localStorage cuando cambia el estado
  const updateState = (newState) => {
    localStorage.setItem('playerState', JSON.stringify(newState));
  };

  const value = {
    currentSong,
    setCurrentSong: (song) => {
      setCurrentSong(song);
      updateState({ ...savedState, currentSong: song });
    },
    isPlaying,
    setIsPlaying: (playing) => {
      setIsPlaying(playing);
      updateState({ ...savedState, isPlaying: playing });
    },
    progress,
    setProgress: (newProgress) => {
      setProgress(newProgress);
      updateState({ ...savedState, progress: newProgress });
    },
    volume,
    setVolume: (newVolume) => {
      setVolume(newVolume);
      updateState({ ...savedState, volume: newVolume });
    },
    duration,
    setDuration: (newDuration) => {
      setDuration(newDuration);
      updateState({ ...savedState, duration: newDuration });
    }
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
