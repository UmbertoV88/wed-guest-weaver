import { useEffect, useRef, useCallback } from 'react';

export interface IdleTimerConfig {
  timeout: number; // milliseconds
  onIdle: () => void;
  onWarning?: (timeLeft: number) => void;
  warningTime?: number; // milliseconds before timeout to show warning
  events?: string[];
  enabled?: boolean;
}

export const useIdleTimer = ({
  timeout = 20 * 60 * 1000, // 20 minutes default
  onIdle,
  onWarning,
  warningTime = 5 * 60 * 1000, // 5 minutes warning
  events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'],
  enabled = true
}: IdleTimerConfig) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    if (!enabled) return;

    // Set warning timer
    if (onWarning && warningTime > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        onWarning(warningTime);
      }, timeout - warningTime);
    }

    // Set idle timer
    timeoutRef.current = setTimeout(() => {
      onIdle();
    }, timeout);
  }, [timeout, onIdle, onWarning, warningTime, enabled]);

  const pauseTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
  }, []);

  const resumeTimer = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!enabled) {
      pauseTimer();
      return;
    }

    // Set up event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Start the timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
      pauseTimer();
    };
  }, [resetTimer, pauseTimer, events, enabled]);

  return {
    resetTimer,
    pauseTimer,
    resumeTimer
  };
};