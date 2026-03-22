import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="mb-5">
          <span className="text-[8rem] font-semibold text-[#2C3E6B] leading-none block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>404</span>
        </div>
        <h2 className="text-xl font-semibold text-[#1A1F2E] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Page Not Found</h2>
        <p className="text-sm text-[#7A766F] mb-8 max-w-xs mx-auto">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex items-center justify-center gap-2.5">
          <Link to="/"><Button className="bg-[#2C3E6B] hover:bg-[#243356] text-white rounded-lg h-9 px-4 text-sm"><Home className="w-3.5 h-3.5 mr-1.5" /> Home</Button></Link>
          <Button variant="outline" onClick={() => window.history.back()} className="rounded-lg h-9 px-4 text-sm border-[#E5E2DC]"><ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back</Button>
        </div>
      </motion.div>
    </div>
  );
}