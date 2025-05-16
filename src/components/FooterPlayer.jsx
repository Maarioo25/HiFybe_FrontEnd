import React, { useRef } from 'react';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaShareAlt, FaRedo, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { usePlayer } from '../context/PlayerContext';

const FooterPlayer = () => {
  const { currentSong, setCurrentSong, isPlaying, setIsPlaying, progress, setProgress, volume, setVolume, duration, setDuration } = usePlayer();
  const audioRef = useRef(null);

  // Formatear tiempo
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Control de reproducción
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  // Cambiar canción
  const handleNextSong = () => {
    // Aquí implementar la lógica para cambiar a la siguiente canción
    // Por ahora solo pausamos
    setIsPlaying(false);
  };

  const handlePreviousSong = () => {
    // Aquí implementar la lógica para cambiar a la canción anterior
    // Por ahora solo pausamos
    setIsPlaying(false);
  };

  // Manejar progreso
  const handleProgressChange = (e) => {
    const newTime = (e.target.value / 100) * duration;
    setProgress(newTime);
    audioRef.current.currentTime = newTime;
  };

  // Manejar volumen
  const handleVolumeChange = (e) => {
    setVolume(Number(e.target.value));
    audioRef.current.volume = Number(e.target.value) / 100;
  };

  return (
    <div className="now-playing-bar fixed left-0 bottom-0 w-full bg-harmony-secondary/80 backdrop-blur-lg border-t border-harmony-text-secondary/40 shadow-2xl">
      <div className="mx-auto flex flex-col md:flex-row items-center md:items-stretch gap-4 px-4 py-3 relative">
        {/* Imagen de fondo degradada de la canción */}
        <div
          className="absolute left-0 top-0 h-full pointer-events-none select-none overflow-hidden"
          style={{ 
            width: '40%',
            height: '100%',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${currentSong?.img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'left',
              filter: 'blur(12px) brightness(0.7)',
              maskImage: `linear-gradient(to right, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.3) 75%, rgba(0, 0, 0, 0) 100%)`,
              WebkitMaskImage: `linear-gradient(to right, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.3) 75%, rgba(0, 0, 0, 0) 100%)`,
            }}
          />
        </div>

        {/* Portada y título */}
        <div className="flex items-center gap-4 min-w-[200px] max-w-[320px] w-[320px] relative overflow-hidden">
          <img src={currentSong?.img} alt="Album cover" className="w-14 h-14 rounded-xl object-cover border-2 border-harmony-accent shadow-lg shrink-0" />
          <div className="truncate">
            <div className="font-semibold text-harmony-text-primary leading-tight truncate max-w-[210px]" title={currentSong?.title}>{currentSong?.title}</div>
            <div className="text-xs text-harmony-text-secondary truncate max-w-[210px]" title={currentSong?.artist}>{currentSong?.artist}</div>
          </div>
        </div>
        
        {/* Centro: barra y controles */}
        <div className="flex-1 flex flex-col items-center justify-center min-w-0">
          {/* Barra de progreso */}
          <div className="w-full flex items-center gap-3 mb-2">
            <span className="text-xs text-harmony-text-secondary w-10 text-right select-none">{formatTime(progress)}</span>
            <div className="relative flex-1 h-3 flex items-center group"
              onClick={e => {
                if (e.target.closest('.cursor-pointer')) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                setProgress(Math.round(x * duration));
              }}
            >
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 progress-bar-bg rounded-full" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-harmony-accent rounded-full transition-all"
                style={{ width: `${(progress/duration)*100}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ left: `calc(${(progress/duration)*100}% - 10px)` }}
                tabIndex={0}
                role="slider"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={duration}
              >
                <div className="w-4 h-4 bg-harmony-accent border-2 border-white rounded-full shadow transition-all group-hover:scale-110" />
              </div>
            </div>
            <span className="text-xs text-harmony-text-secondary w-10 text-left select-none">{formatTime(duration)}</span>
          </div>
          
          {/* Controles */}
          <div className="flex items-center justify-center gap-4 w-full">
            <button className="w-9 h-9 rounded-full bg-harmony-secondary/50 flex items-center justify-center hover:bg-harmony-secondary/60 transition shadow-lg" aria-label="Repetir">
              <FaRedo className="text-lg" />
            </button>
            <button className="w-9 h-9 rounded-full bg-harmony-secondary/50 flex items-center justify-center hover:bg-harmony-secondary/60 transition shadow-lg" aria-label="Anterior" onClick={handlePreviousSong}>
              <FaStepBackward className="text-lg" />
            </button>
            <button className="w-12 h-12 rounded-full bg-harmony-accent flex items-center justify-center hover:bg-harmony-accent/80 transition shadow-xl mx-2" onClick={handlePlayPause} aria-label="Play/Pause">
              {isPlaying ? <FaPause className="text-2xl" /> : <FaPlay className="text-2xl" />}
            </button>
            <button className="w-9 h-9 rounded-full bg-harmony-secondary/50 flex items-center justify-center hover:bg-harmony-secondary/60 transition shadow-lg" aria-label="Siguiente" onClick={handleNextSong}>
              <FaStepForward className="text-lg" />
            </button>
            <button className="w-9 h-9 rounded-full bg-harmony-secondary/50 flex items-center justify-center hover:bg-harmony-secondary/60 transition shadow-lg" aria-label="Compartir">
              <FaShareAlt className="text-lg" />
            </button>
          </div>
        </div>
        
        {/* Volumen a la derecha */}
        <div className="flex items-center gap-2 min-w-[120px] justify-end">
          <input
            type="range"
            className="volume-slider w-24 h-2 accent-harmony-accent bg-harmony-secondary/20 rounded-full"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            aria-label="Volumen"
          />
          <span className="text-xs text-harmony-text-secondary w-8 text-center select-none">{volume}</span>
        </div>
      </div>
      
      {/* Reproductor de audio */}
      <audio
        ref={audioRef}
        src={currentSong?.audioUrl || 'https://example.com/default.mp3'}
        autoPlay={isPlaying}
        onTimeUpdate={(e) => setProgress(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default FooterPlayer;