import { XIcon } from "lucide-react";
import { useEffect } from "react";

export function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  // auto-hide after 4 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-600';

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded text-white shadow-lg ${bgColor}`}>
      {message}
      <button className="ml-4 font-bold" onClick={onClose}><XIcon /></button>
    </div>
  );
}
