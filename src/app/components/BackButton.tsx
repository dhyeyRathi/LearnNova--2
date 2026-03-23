import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface BackButtonProps { label?: string; to?: string; className?: string; }

export default function BackButton({ label = 'Back', to, className = '' }: BackButtonProps) {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className={`mb-5 ${className}`}>
      <Button variant="ghost" onClick={() => to ? navigate(to) : navigate(-1)}
        className="group text-[#7A766F] hover:bg-purple-100 hover:text-purple-700 rounded-lg px-2.5 -ml-2.5 h-8 text-[13px]">
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-0.5 transition-transform" /> {label}
      </Button>
    </motion.div>
  );
}