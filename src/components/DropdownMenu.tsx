import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Info, Github, FileText } from 'lucide-react';

interface DropdownMenuProps {
  onAboutClick: () => void;
}

export function DropdownMenu({ onAboutClick }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAboutClick = () => {
    onAboutClick();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-2 rounded-lg bg-[#0bd17f] hover:bg-[#09b871] transition-colors"
        aria-label="Menú"
      >
        <Menu className="h-6 w-6 text-white" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
          >
            <div className="py-2">
              <button
                onClick={handleAboutClick}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 group"
              >
                <div className="p-2 rounded-lg bg-[#bdef34]/10 group-hover:bg-[#bdef34]/20 transition-colors">
                  <Info className="h-5 w-5 text-[#1b1a32]" />
                </div>
                <div>
                  <div className="font-medium text-[#1b1a32]">Acerca del proyecto</div>
                  <div className="text-xs text-slate-500">Información del equipo</div>
                </div>
              </button>

              <a
                href="https://github.com/Vibemiko/Clasificador_flores_vercel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 group"
              >
                <div className="p-2 rounded-lg bg-[#0bd17f]/10 group-hover:bg-[#0bd17f]/20 transition-colors">
                  <Github className="h-5 w-5 text-[#1b1a32]" />
                </div>
                <div>
                  <div className="font-medium text-[#1b1a32]">Repositorio GitHub</div>
                  <div className="text-xs text-slate-500">Ver código fuente</div>
                </div>
              </a>

              <a
                href="https://docs.google.com/document/d/1--j1RlGI3uqmH0Rz5gVhCh2Wee9ccDDUdJDNTJkBtOQ/edit?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 group"
              >
                <div className="p-2 rounded-lg bg-[#c4b6ee]/20 group-hover:bg-[#c4b6ee]/30 transition-colors">
                  <FileText className="h-5 w-5 text-[#1b1a32]" />
                </div>
                <div>
                  <div className="font-medium text-[#1b1a32]">Documentación</div>
                  <div className="text-xs text-slate-500">Google Docs</div>
                </div>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
