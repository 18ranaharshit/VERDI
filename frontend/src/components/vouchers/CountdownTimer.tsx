// Performance: Uses requestAnimationFrame or robust setInterval. Memoized to prevent parent re-renders.
import { useState, useEffect, memo } from 'react';

interface CountdownTimerProps {
  expiresAt: string;
}

const CountdownTimer = memo(function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const targetDate = new Date(expiresAt).getTime();

    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = targetDate - now;
      setTimeLeft(Math.max(0, difference));
    };

    calculateTimeLeft(); // Initial calculation

    const timerId = setInterval(calculateTimeLeft, 1000);

    // iOS Safari background tab throttle fix
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        calculateTimeLeft();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [expiresAt]);

  if (timeLeft <= 0) {
    return <span className="font-mono font-bold text-error">Expired</span>;
  }

  // Calculate hours, minutes, seconds
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  // Formatting helper
  const pad = (num: number) => num.toString().padStart(2, '0');

  // Determine color status
  let colorClass = 'text-accent';
  let pulseClass = '';

  if (hours === 0 && minutes < 30) {
    colorClass = 'text-warning';
  }
  if (hours === 0 && minutes < 10) {
    colorClass = 'text-error';
  }
  if (hours === 0 && minutes < 5) {
    pulseClass = 'animate-pulse';
  }

  return (
    <span className={`font-mono font-bold ${colorClass} ${pulseClass}`}>
      {hours > 0 ? `${hours}h ` : ''}
      {pad(minutes)}m {pad(seconds)}s
    </span>
  );
});

export default CountdownTimer;
