import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getBadgeLevel } from '../data/mockData';

interface PointsPopupProps {
  points: number;
  totalPoints: number;
  show: boolean;
  onClose: () => void;
}

export default function PointsPopup({ points, totalPoints, show, onClose }: PointsPopupProps) {
  const [leveledUp, setLeveledUp] = useState(false);
  const badge = getBadgeLevel(totalPoints);
  const prevBadge = getBadgeLevel(totalPoints - points);

  useEffect(() => {
    if (show && badge.level !== prevBadge.level) {
      setLeveledUp(true);
      // Fire confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899']
      });
    }
  }, [show, badge, prevBadge]);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <div className="bg-red-500 rounded-3xl p-6 shadow-2xl text-white min-w-[300px] relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl" />
            
            <div className="relative z-10">
              {leveledUp ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="text-center"
                  >
                    <div className="text-6xl mb-2">{badge.icon}</div>
                    <h3 className="text-2xl font-bold mb-1">Level Up!</h3>
                    <p className="text-white/90 mb-3">
                      You're now a <span className="font-bold">{badge.level}</span>
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-3xl font-bold">
                      <Trophy className="w-6 h-6" />
                      <span>+{points}</span>
                      <Sparkles className="w-6 h-6" />
                    </div>
                  </motion.div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-6 h-6" />
                      <span className="text-xl font-bold">Points Earned!</span>
                    </div>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="text-4xl font-bold mb-2">+{points}</div>
                  <p className="text-white/90 text-sm">
                    Total: {totalPoints} points • {badge.level} {badge.icon}
                  </p>
                  {badge.maxPoints < Infinity && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <p className="text-xs text-white/70 mb-1">
                        {badge.maxPoints + 1 - totalPoints} points to next level
                      </p>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(totalPoints / (badge.maxPoints + 1)) * 100}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-white rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}