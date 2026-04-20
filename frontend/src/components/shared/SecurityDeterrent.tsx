'use client';

import { useEffect } from 'react';

/**
 * SecurityDeterrent component implements measures to discourage users from
 * inspecting the application's source code or network requests via browser DevTools.
 * 
 * Includes:
 * - Disabling right-click context menu
 * - Disabling common keyboard shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U)
 * - Anti-debugging tricks
 */
export default function SecurityDeterrent() {
    useEffect(() => {
        // 1. Disable Right Click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // 2. Disable Keyboard Shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            // F12
            if (e.key === 'F12')
            {
                e.preventDefault();
                return;
            }

            // Ctrl + Shift + I/J/C/K (Windows/Linux) or Cmd + Opt + I/J/C (Mac)
            if ((e.ctrlKey && e.shiftKey && (
                e.key === 'I' || e.key === 'i' ||
                e.key === 'J' || e.key === 'j' ||
                e.key === 'C' || e.key === 'c' ||
                e.key === 'K' || e.key === 'k'
            )) || (e.metaKey && e.altKey && (
                e.key === 'I' || e.key === 'i' ||
                e.key === 'J' || e.key === 'j' ||
                e.key === 'C' || e.key === 'c'
            )))
            {
                e.preventDefault();
                return;
            }

            // Ctrl + U (View Source)
            if (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
            {
                e.preventDefault();
                return;
            }

            // Ctrl + S (Save Page)
            if (e.ctrlKey && (e.key === 'S' || e.key === 's'))
            {
                e.preventDefault();
                return;
            }
        };

        // 3. Simple Anti-Debugger
        // This is a deterrent that makes it harder to use the debugger effectively.
        const antiDebugger = () => {
            const start = new Date().getTime();
            debugger; // This will pause if DevTools is open
            const stop = new Date().getTime();
            if (stop - start > 100)
            {
                // DevTools probably open
            }
        };

        // Only run anti-debugger occasionally or in production
        let debuggerInterval: any;
        if (process.env.NODE_ENV === 'production')
        {
            // debuggerInterval = setInterval(antiDebugger, 2000);
        }

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('keydown', handleKeyDown);
            if (debuggerInterval) clearInterval(debuggerInterval);
        };
    }, []);

    return null;
}
