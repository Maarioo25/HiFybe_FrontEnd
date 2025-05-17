// components/FooterPlayer.jsx
import React from 'react';
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaRedo
} from 'react-icons/fa';
import { usePlayer } from '../context/PlayerContext';

const FooterPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    setIsPlaying,
    position,
    duration
  } = usePlayer();

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const togglePlay = () => setIsPlaying(prev => !prev);
  const prevTrack = () => {/* Spotify SDK no soporta prev directo, podría implementarse */};
  const nextTrack = () => {/* Spotify SDK no soporta next directo, podría implementarse */};

  if (!currentTrack) {
    return (
      <div className="now-playing-bar fixed left-0 bottom-0 w-full bg-harmony-secondary/80 backdrop-blur-lg border-t border-harmony-text-secondary/40 shadow-2xl flex items-center justify-center p-4">
        <span className="text-harmony-text-primary">Selecciona una canción para reproducir</span>
      </div>
    );
  }

  return (
    <div className="now-playing-bar fixed left-0 bottom-0 w-full bg-harmony-secondary/80 backdrop-blur-lg border-t border-harmony-text-secondary/40 shadow-2xl">
      <div className="mx-auto flex items-center gap-4 px-4 py-3">
        <img
          src={currentTrack.album.images[2]?.url}
          alt={currentTrack.name}
          className="w-12 h-12 rounded"
        />
        <div className="flex-1">
          <div className="font-semibold text-harmony-text-primary truncate">
            {currentTrack.name}
          </div>
          <div className="text-xs text-harmony-text-secondary truncate">
            {currentTrack.artists.map(a => a.name).join(', ')}
          </div>
        </div>
        <span className="text-xs text-harmony-text-secondary mr-2">
          {formatTime(position)} / {formatTime(duration)}
        </span>
        <button onClick={prevTrack} aria-label="prev">
          <FaStepBackward className="text-lg text-harmony-text-primary" />
        </button>
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-harmony-accent flex items-center justify-center"
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <button onClick={nextTrack} aria-label="next">
          <FaStepForward className="text-lg text-harmony-text-primary" />
        </button>
        <button aria-label="replay">
          <FaRedo className="text-lg text-harmony-text-primary" />
        </button>
      </div>
    </div>
  );
};

export default FooterPlayer;
