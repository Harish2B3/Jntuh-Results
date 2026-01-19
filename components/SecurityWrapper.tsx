import React, { useEffect } from 'react';

export const SecurityWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useEffect(() => {
        // --- DISABLE RIGHT CLICK ---
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // --- DISABLE SHORTCUTS ---
        const handleKeyDown = (e: KeyboardEvent) => {
            // Disable F12
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }

            // Disable Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
                e.preventDefault();
                window.location.reload();
                return false;
            }

            // Disable Ctrl+U (View Source)
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                return false;
            }
        };

        // --- DEVTOOLS DETECTION ---
        const detectDevTools = () => {
            const threshold = 160;
            const widthDiff = window.outerWidth - window.innerWidth > threshold;
            const heightDiff = window.outerHeight - window.innerHeight > threshold;

            if (widthDiff || heightDiff) {
                // Potential DevTools open side-by-side or bottom
                window.location.href = "about:blank"; // Close/Redirect
            }
        };

        // --- DEBUGGER LOOP ---
        const startDebugger = () => {
            const startTime = new Date().getTime();
            // eslint-disable-next-line no-debugger
            debugger;
            const endTime = new Date().getTime();
            if (endTime - startTime > 100) {
                // Debugger was hit, implying dev tools are open
                window.location.reload();
            }
        };

        const interval = setInterval(() => {
            detectDevTools();
            startDebugger();
        }, 1000);

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            clearInterval(interval);
        };
    }, []);

    return <>{children}</>;
};
