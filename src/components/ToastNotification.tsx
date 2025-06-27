
import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const ToastNotification = ({ type, message, isVisible, onClose }: ToastProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const styles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-in-right">
      <div className={`
        ${styles[type]} 
        px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 min-w-80
        transform transition-all duration-200
      `}>
        <Sparkles className="h-5 w-5 flex-shrink-0" />
        <span className="font-medium flex-1">{message}</span>
        <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Hook pour utiliser les toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
  }>>([]);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          type={toast.type}
          message={toast.message}
          isVisible={true}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );

  return { showToast, ToastContainer };
};

export default ToastNotification;
