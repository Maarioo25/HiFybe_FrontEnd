// components/FooterPlayer.jsx
import React from 'react';
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaShareAlt,
  FaRedo,
  FaVolumeUp,
  FaVolumeMute,
} from 'react-icons/fa';
import { usePlayer } from '../context/PlayerContext';

const FooterPlayer = () => {
  const {
    currentSong,
    isPlaying,
    setIsPlaying,
    progress,
    setProgress,
    volume,
    setVolume,
    duration,
  } = usePlayer();

  // Formatea tiempo en mm:ss
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  // Control de reproducción
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Lógica de siguiente canción (actualmente solo pausa)
  const handleNextSong = () => {
    setIsPlaying(false);
    // TODO: implementar cambio a la siguiente canción
  };

  // Lógica de canción anterior (actualmente solo pausa)
  const handlePreviousSong = () => {
    setIsPlaying(false);
    // TODO: implementar cambio a la canción anterior
  };

  // Maneja el seek
  const seek = (e) => {
    const newTime = (e.target.value / 100) * duration;
    setProgress(newTime);
  };

  // Maneja el cambio de volumen
  const changeVol = (e) => {
    setVolume(Number(e.target.value));
  };

  return (
    <div className="now-playing-bar fixed left-0 bottom-0 w-full shadow-2xl">
      {/* Fondo semitransparente y desenfoque */}
      <div className="absolute inset-0 bg-harmony-secondary/80 backdrop-blur-lg border-t border-harmony-text-secondary/40 z-0" />

      {/* Contenido del footer */}
      <div className="relative mx-auto flex flex-col md:flex-row items-center md:items-stretch gap-4 px-4 py-3">
        {/* Imagen de fondo degradada parcial, z-0 */}
        <div
          className="absolute left-0 top-0 h-full pointer-events-none overflow-hidden z-0"
          style={{ width: '40%', height: '100%' }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${currentSong.img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'left',
              filter: 'blur(12px) brightness(0.7)',
              maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%,rgba(0,0,0,0.7) 50%,rgba(0,0,0,0) 100%)',
            }}
          />
        </div>

        {/* Portada y texto */}
        <div className="flex items-center z-10 gap-4 min-w-[200px] max-w-[320px] w-[320px] overflow-hidden">
          <img
            src={currentSong.img}
            alt="Album cover"
            className="w-14 h-14 rounded-xl object-cover border-2 border-harmony-accent shadow-lg"
          />
          <div className="truncate text-harmony-text-primary">
            <div
              className="font-semibold truncate max-w-[210px]"
              title={currentSong.title}
            >
              {currentSong.title}
            </div>
            <div
              className="text-xs text-harmony-text-secondary truncate max-w-[210px]"
              title={currentSong.artist}
            >
              {currentSong.artist}
            </div>
          </div>
        </div>

        {/* Barra de progreso y controles */}
        <div className="flex-1 flex flex-col items-center justify-center min-w-0">
          <div className="w-full flex items-center gap-3 mb-2">
            <span className="text-xs text-harmony-text-secondary w-10 text-right select-none">
              {formatTime(progress)}
            </span>
            <input
              type="range"
              className="flex-1 h-1 accent-harmony-accent bg-harmony-secondary/20 rounded-full"
              min={0}
              max={100}
              value={duration ? (progress / duration) * 100 : 0}
              onChange={seek}
            />
            <span className="text-xs text-harmony-text-secondary w-10 text-left select-none">
              {formatTime(duration)}
            </span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button aria-label="replay">
              <FaRedo className="text-lg" />
            </button>
            <button onClick={handlePreviousSong} aria-label="prev">
              <FaStepBackward className="text-lg" />
            </button>
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-harmony-accent flex items-center justify-center hover:bg-harmony-accent/80 transition"
            >
              {isPlaying ? <FaPause className="text-2xl" /> : <FaPlay className="text-2xl" />}
            </button>
            <button onClick={handleNextSong} aria-label="next">
              <FaStepForward className="text-lg" />
            </button>
            <button aria-label="share">
              <FaShareAlt className="text-lg" />
            </button>
          </div>
        </div>

        {/* Control de volumen */}
        <div className="flex items-center gap-2 min-w-[120px] justify-end">
          {volume > 0 ? <FaVolumeUp /> : <FaVolumeMute />}
          <input
            type="range"
            className="w-24 h-2 accent-harmony-accent bg-harmony-secondary/20 rounded-full"
            min={0}
            max={100}
            value={volume}
            onChange={changeVol}
          />
          <span className="text-xs text-harmony-text-secondary w-8 text-center select-none">
            {volume}
          </span>
        </div>
      </div>
    </div>
  );
};


export default FooterPlayer;
