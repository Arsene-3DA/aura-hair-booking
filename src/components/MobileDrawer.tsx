
import { useState } from 'react';
import { X } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const MobileDrawer = ({ isOpen, onClose, children }: MobileDrawerProps) => {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (currentY - startY > 100) { // Swipe down de plus de 100px
      onClose();
    }
    setStartY(0);
    setCurrentY(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Drawer */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transform transition-transform duration-300 animate-slide-in-up"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        <div className="flex justify-center py-4">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 pb-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-luxury-charcoal">Menu</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileDrawer;
