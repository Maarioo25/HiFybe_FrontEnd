// context/PlayerContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { SONGS } from '../data/songs';

// Un único objeto Audio global que persiste entre vistas
const globalAudio = new Audio();
const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(globalAudio);
  const [currentSong, setCurrentSong] = useState(SONGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(50);
  const [duration, setDuration] = useState(0);

  // Carga inicial de estado
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('playerState'));
    if (saved) {
      setCurrentSong(saved.currentSong);
      setProgress(saved.progress);
      setVolume(saved.volume);
      setIsPlaying(saved.isPlaying);
    }
  }, []);

  // Persistir estado en localStorage
  useEffect(() => {
    localStorage.setItem(
      'playerState',
      JSON.stringify({ currentSong, progress, volume, isPlaying })
    );
  }, [currentSong, progress, volume, isPlaying]);

  // Registrar listeners solo una vez
  useEffect(() => {
    const audio = audioRef.current;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // Actualizar src y mantener posición al cambiar de canción
  useEffect(() => {
    const audio = audioRef.current;
    audio.src = currentSong.audioUrl;
    audio.currentTime = progress;
  }, [currentSong]);

  // Reproducir o pausar según isPlaying
  useEffect(() => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.play().catch(err => {
        console.error('Error al reproducir:', err);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  // Seek manual
  useEffect(() => {
    const audio = audioRef.current;
    if (Math.abs(audio.currentTime - progress) > 0.5) {
      audio.currentTime = progress;
    }
  }, [progress]);

  // Volumen
  useEffect(() => {
    audioRef.current.volume = volume / 100;
  }, [volume]);

  return (
    <PlayerContext.Provider value={{
      currentSong,
      setCurrentSong,
      isPlaying,
      setIsPlaying,
      progress,
      setProgress,
      volume,
      setVolume,
      duration,
      setDuration,
      audioRef,
    }}>
      {children}
      <audio ref={audioRef} hidden />
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must usarse dentro de PlayerProvider');
  return ctx;
};