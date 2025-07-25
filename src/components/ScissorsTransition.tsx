import { useEffect, useState } from 'react';
import { Scissors } from 'lucide-react';

interface ScissorsTransitionProps {
  isActive: boolean;
  onComplete?: () => void;
}

const ScissorsTransition = ({ isActive, onComplete }: ScissorsTransitionProps) => {
  const [phase, setPhase] = useState<'enter' | 'traverse' | 'exit'>('enter');

  useEffect(() => {
    if (!isActive) return;

    const timer1 = setTimeout(() => setPhase('traverse'), 100);
    const timer2 = setTimeout(() => setPhase('exit'), 1000);
    const timer3 = setTimeout(() => {
      onComplete?.();
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Background overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r from-luxury-gold-400 via-luxury-gold-500 to-luxury-gold-600 transition-opacity duration-500 ${
          phase === 'enter' ? 'opacity-0' : phase === 'traverse' ? 'opacity-90' : 'opacity-0'
        }`}
      />
      
      {/* Animated scissors */}
      <div 
        className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 ease-out ${
          phase === 'enter' 
            ? '-left-20 rotate-12' 
            : phase === 'traverse' 
            ? 'left-1/2 -translate-x-1/2 rotate-[360deg]' 
            : 'right-[-80px] rotate-[720deg]'
        }`}
      >
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 animate-pulse">
            <Scissors className="h-16 w-16 text-white opacity-50 blur-sm" />
          </div>
          
          {/* Main scissors */}
          <Scissors className="h-16 w-16 text-white drop-shadow-2xl relative z-10" />
          
          {/* Sparkle effects */}
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-white rounded-full animate-ping" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white rounded-full animate-ping delay-300" />
          <div className="absolute top-1/2 -right-4 w-1 h-1 bg-white rounded-full animate-ping delay-150" />
        </div>
      </div>

      {/* Text overlay */}
      {phase === 'traverse' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white animate-fade-in">
            <h2 className="text-4xl font-bold mb-2">✨ Connexion réussie ✨</h2>
            <p className="text-xl opacity-90">Redirection en cours...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScissorsTransition;