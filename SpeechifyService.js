import React, { useState, useEffect, useRef } from 'react';

const SpeechifyService = () => {
  // Speechify API Key from the requirements
  const apiKey = 'E6y3sjHuqIxzWKocp0JhvL-EOzpy2i0cKVQq04c3ang=';
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const speechifyRef = useRef(null);

  useEffect(() => {
    // Load Speechify SDK
    const loadSpeechify = async () => {
      try {
        // Create script element to load Speechify SDK
        const script = document.createElement('script');
        script.src = 'https://cdn.speechify.io/speechify-api.js';
        script.async = true;
        script.onload = initializeSpeechify;
        document.body.appendChild(script);
      } catch (err) {
        console.error('Error loading Speechify SDK:', err);
        setError('Failed to load Speechify SDK');
      }
    };

    loadSpeechify();

    // Cleanup function
    return () => {
      if (speechifyRef.current) {
        speechifyRef.current.pause();
        speechifyRef.current = null;
      }
    };
  }, []);

  const initializeSpeechify = async () => {
    try {
      if (window.SpeechifyAPI) {
        speechifyRef.current = new window.SpeechifyAPI({
          apiKey: apiKey,
        });
        setIsInitialized(true);
      } else {
        throw new Error('Speechify SDK not available');
      }
    } catch (err) {
      console.error('Error initializing Speechify:', err);
      setError('Failed to initialize Speechify');
    }
  };

  const generateAudio = async (text, voice = 'en-US-Standard-B', speed = 1.0) => {
    if (!isInitialized || !speechifyRef.current) {
      setError('Speechify not initialized');
      return null;
    }

    try {
      const audioData = await speechifyRef.current.synthesize({
        text: text,
        voice: voice,
        speed: speed,
        format: 'mp3',
      });

      return audioData;
    } catch (err) {
      console.error('Error generating audio:', err);
      setError('Failed to generate audio');
      return null;
    }
  };

  const playAudio = async (audioData, onHighlight) => {
    if (!audioData) return;

    try {
      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      // Set up audio source
      const audioBlob = new Blob([audioData], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;

      // Set up event listeners
      audioRef.current.ontimeupdate = () => {
        const position = audioRef.current.currentTime / audioRef.current.duration;
        setCurrentPosition(position);
        if (onHighlight) {
          onHighlight(position);
        }
      };

      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onpause = () => setIsPlaying(false);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentPosition(0);
      };

      // Play audio
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Error playing audio:', err);
      setError('Failed to play audio');
    }
  };

  const pauseAudio = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resumeAudio = async () => {
    if (audioRef.current && audioRef.current.paused) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Error resuming audio:', err);
        setError('Failed to resume audio');
      }
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentPosition(0);
    }
  };

  const setPlaybackSpeed = (speed) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  return {
    isInitialized,
    isPlaying,
    currentPosition,
    error,
    generateAudio,
    playAudio,
    pauseAudio,
    resumeAudio,
    stopAudio,
    setPlaybackSpeed,
  };
};

export default SpeechifyService;
