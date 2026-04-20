'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function Preloader() {
    const [loading, setLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const pathname = usePathname();
    const lastPathname = useRef<string | null>(null);
    const mountTime = useRef<number>(Date.now());

    // ✅ Single source of truth — change this one value to adjust duration
    const MIN_DISPLAY_MS = 1500;

    // ✅ All dismissals go through here — guarantees the minimum wait
    const dismissPreloader = () => {
        const elapsed = Date.now() - mountTime.current;
        const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
        setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => setLoading(false), 500);
        }, remaining);
    };

    // 1. Initial page load
    // ✅ Failsafe is MIN_DISPLAY_MS + 1500 — never fires before minimum is met
    useEffect(() => {
        const failsafe = setTimeout(() => {
            if (loading) dismissPreloader();
        }, MIN_DISPLAY_MS + 1500);

        const handleLoad = () => dismissPreloader();

        if (document.readyState === 'complete') {
            handleLoad();
        } else {
            window.addEventListener('load', handleLoad);
        }

        return () => {
            window.removeEventListener('load', handleLoad);
            clearTimeout(failsafe);
        };
    }, []);

    // 2. Route transitions — also respect the minimum display time
    useEffect(() => {
        if (lastPathname.current === pathname) return;

        const oldBase = lastPathname.current?.split('#')[0];
        const newBase = pathname?.split('#')[0];
        if (oldBase === newBase && lastPathname.current !== null) {
            lastPathname.current = pathname;
            return;
        }

        lastPathname.current = pathname;
        if (lastPathname.current === null) return;

        // Reset mount time so the 4s restarts on each new route
        mountTime.current = Date.now();
        setLoading(true);
        setFadeOut(false);

        // ✅ Route-change also goes through dismissPreloader — respects MIN_DISPLAY_MS
        const endTimer = setTimeout(() => dismissPreloader(), MIN_DISPLAY_MS);
        return () => clearTimeout(endTimer);
    }, [pathname]);

    if (!loading) return null;

    return (
        <>
            <style>{`
                @keyframes needleSpin {
                    0% { transform: rotate(0deg); }
                    20% { transform: rotate(220deg); }
                    40% { transform: rotate(180deg); }
                    60% { transform: rotate(310deg); }
                    80% { transform: rotate(290deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes compassPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(253,70,33,0.3), 0 0 60px rgba(253,70,33,0.1); }
                    50% { box-shadow: 0 0 0 20px rgba(253,70,33,0), 0 0 80px rgba(253,70,33,0.2); }
                }
                @keyframes routeDraw {
                    from { stroke-dashoffset: 400; }
                    to { stroke-dashoffset: 0; }
                }
                @keyframes pinDrop {
                    0% { transform: translateY(-20px) scale(0); opacity: 0; }
                    60% { transform: translateY(4px) scale(1.2); opacity: 1; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }
                @keyframes gridFade {
                    0% { opacity: 0; }
                    100% { opacity: 0.08; }
                }
                @keyframes pl2Text {
                    0% { opacity: 0; transform: translateY(8px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes outerRingRotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(-360deg); }
                }
                .pl2-wrap {
                    position: fixed; inset: 0; z-index: 99999;
                    background: #f5f0e8;
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    transition: opacity 0.5s ease, visibility 0.5s ease;
                    overflow: hidden;
                }
                .pl2-grid {
                    position: absolute; inset: 0;
                    background-image:
                        linear-gradient(rgba(0,0,0,0.07) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,0,0,0.07) 1px, transparent 1px);
                    background-size: 40px 40px;
                    animation: gridFade 1s ease forwards;
                }
                .pl2-compass-outer {
                    position: relative; width: 160px; height: 160px;
                    border-radius: 50%;
                    background: radial-gradient(circle at 35% 35%, #fff8f0, #e8ddd0);
                    border: 3px solid #c4a882;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.8);
                    animation: compassPulse 2s ease-in-out infinite;
                    display: flex; align-items: center; justify-content: center;
                    margin-bottom: 36px;
                }
                .pl2-ring {
                    position: absolute; inset: 8px; border-radius: 50%;
                    border: 1px dashed rgba(139,107,73,0.4);
                    animation: outerRingRotate 20s linear infinite;
                }
                .pl2-face {
                    position: relative; width: 130px; height: 130px;
                    border-radius: 50%;
                    background: radial-gradient(circle at 40% 35%, #fffcf8, #f0e8d8);
                    border: 1px solid rgba(139,107,73,0.3);
                    display: flex; align-items: center; justify-content: center;
                }
                .pl2-needle-wrap {
                    position: absolute; width: 100%; height: 100%;
                    display: flex; align-items: center; justify-content: center;
                    animation: needleSpin 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
                .pl2-cardinal {
                    position: absolute; font-family: 'Georgia', serif;
                    font-size: 13px; font-weight: bold; color: #5a3e28;
                }
                .pl2-center-dot {
                    position: absolute; width: 10px; height: 10px;
                    border-radius: 50%; background: #1a1a1a;
                    z-index: 10; box-shadow: 0 0 0 2px #fff;
                }
                .pl2-route-svg {
                    position: absolute; width: 140px; height: 140px;
                }
                .pl2-route-path {
                    stroke-dasharray: 400;
                    animation: routeDraw 2.5s ease-in-out forwards;
                }
                .pl2-pin {
                    position: absolute;
                    animation: pinDrop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                    animation-delay: 2s; opacity: 0;
                }
                .pl2-brand {
                    font-family: 'Georgia', serif; font-size: 22px;
                    font-weight: bold; color: #2d1f0e; letter-spacing: 2px;
                    animation: pl2Text 0.8s ease forwards; animation-delay: 0.3s; opacity: 0;
                }
                .pl2-sub {
                    font-family: 'Georgia', serif; font-size: 11px;
                    color: #8b6b49; letter-spacing: 5px; text-transform: uppercase;
                    margin-top: 4px;
                    animation: pl2Text 0.8s ease forwards; animation-delay: 0.6s; opacity: 0;
                }
                .pl2-dots {
                    display: flex; gap: 6px; margin-top: 20px;
                    animation: pl2Text 0.8s ease forwards; animation-delay: 0.8s; opacity: 0;
                }
                .pl2-dot {
                    width: 6px; height: 6px; border-radius: 50%; background: #c4a882;
                    animation: compassPulse 1s ease-in-out infinite;
                }
                .pl2-dot:nth-child(2) { animation-delay: 0.2s; }
                .pl2-dot:nth-child(3) { animation-delay: 0.4s; }
            `}</style>

            <div className="pl2-wrap" style={{ opacity: fadeOut ? 0 : 1, visibility: fadeOut ? 'hidden' : 'visible' }}>
                <div className="pl2-grid" />

                <div className="pl2-compass-outer">
                    <div className="pl2-ring" />
                    <div className="pl2-face">
                        <span className="pl2-cardinal" style={{ top: '8px', left: '50%', transform: 'translateX(-50%)', color: '#fd4621' }}>N</span>
                        <span className="pl2-cardinal" style={{ bottom: '8px', left: '50%', transform: 'translateX(-50%)' }}>S</span>
                        <span className="pl2-cardinal" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}>E</span>
                        <span className="pl2-cardinal" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}>W</span>

                        <svg className="pl2-route-svg" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path className="pl2-route-path" d="M 30 110 Q 45 85 60 70 Q 70 55 55 40 Q 65 25 80 35 Q 95 45 100 30" stroke="#fd4621" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="400" />
                            <circle cx="30" cy="110" r="3" fill="#fd4621" opacity="0.6" />
                            <circle cx="55" cy="40" r="3" fill="#fd4621" opacity="0.6" />
                        </svg>

                        <div className="pl2-pin" style={{ top: '16%', right: '22%' }}>
                            <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 5.25 8 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8z" fill="#fd4621" />
                                <circle cx="8" cy="8" r="3" fill="white" />
                            </svg>
                        </div>

                        <div className="pl2-needle-wrap">
                            <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                                <polygon points="60,18 56,60 64,60" fill="#fd4621" />
                                <polygon points="60,102 56,60 64,60" fill="#2d1f0e" />
                            </svg>
                        </div>

                        <div className="pl2-center-dot" />
                    </div>
                </div>

                <div className="pl2-brand">Shivansh Holidays</div>
                <div className="pl2-sub">Roads to Roar</div>
                <div className="pl2-dots">
                    {[0, 1, 2].map(i => <div key={i} className="pl2-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}
                </div>
            </div>
        </>
    );
}