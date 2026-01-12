import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();

  const shortcuts: KeyboardShortcut[] = [
    // Navigation
    { key: 'h', alt: true, action: () => navigate('/'), description: 'Go to Home' },
    { key: 'r', alt: true, action: () => navigate('/recipes'), description: 'Go to Recipes' },
    { key: 'w', alt: true, action: () => navigate('/weekly-calendar'), description: 'Go to Weekly Calendar' },
    { key: 'g', alt: true, action: () => navigate('/groups'), description: 'Go to Groups' },
    { key: 'i', alt: true, action: () => navigate('/ingredient-finder'), description: 'Go to Ingredient Finder' },
    
    // Actions
    { 
      key: '/', 
      action: () => {
        // Focus search input if on recipes page
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="suchen"], input[placeholder*="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 
      description: 'Focus search' 
    },
    { 
      key: 'Escape', 
      action: () => {
        // Close any open dialogs or blur active element
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) {
          activeElement.blur();
        }
      }, 
      description: 'Close/Cancel' 
    },
  ];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Only allow Escape in inputs
      if (e.key !== 'Escape') return;
    }

    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
      const altMatch = shortcut.alt ? e.altKey : !e.altKey;
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
      
      if (e.key.toLowerCase() === shortcut.key.toLowerCase() && ctrlMatch && altMatch && shiftMatch) {
        e.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [navigate, location]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const showShortcutsHelp = () => {
    toast({
      title: language === 'de' ? 'Tastaturkürzel' : 'Keyboard Shortcuts',
      description: language === 'de' 
        ? 'Alt+H: Start | Alt+R: Rezepte | Alt+W: Wochenplan | Alt+G: Gruppen | /: Suchen'
        : 'Alt+H: Home | Alt+R: Recipes | Alt+W: Weekly Plan | Alt+G: Groups | /: Search',
      duration: 5000,
    });
  };

  return { shortcuts, showShortcutsHelp };
}
