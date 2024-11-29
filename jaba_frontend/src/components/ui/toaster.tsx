'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Toast {
  id: number;
  message: string;
}

interface ToasterContextProps {
  toasts: Toast[];
  addToast: (message: string) => void;
  removeToast: (id: number) => void;
}

const ToasterContext = createContext<ToasterContextProps | undefined>(undefined);

export const ToasterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string) => {
    const id = Date.now();
    setToasts([...toasts, { id, message }]);
    setTimeout(() => removeToast(id), 3000); // Automatically remove toast after 3 seconds
  };

  const removeToast = (id: number) => {
    setToasts(toasts.filter(toast => toast.id !== id));
  };

  return (
    <ToasterContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className="bg-gray-800 text-white px-4 py-2 rounded shadow-lg">
            {toast.message}
          </div>
        ))}
      </div>
    </ToasterContext.Provider>
  );
};

export const useToaster = (): ToasterContextProps => {
  const context = useContext(ToasterContext);
  if (!context) {
    throw new Error('useToaster must be used within a ToasterProvider');
  }
  return context;
};