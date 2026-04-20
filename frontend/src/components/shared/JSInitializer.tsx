'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function JSInitializer() {
    const pathname = usePathname();

    useEffect(() => {
        const initJS = () => {
            // 1. Re-initialize PureCounter
            if (typeof (window as any).PureCounter !== 'undefined')
            {
                try
                {
                    new (window as any).PureCounter();
                } catch (err)
                {
                    console.warn('PureCounter re-initialization failed', err);
                }
            }

            // 2. Re-initialize GSAP fade animations
            if (typeof (window as any).gsap !== 'undefined' && typeof (window as any).ScrollTrigger !== 'undefined')
            {
                const gsap = (window as any).gsap;
                const ScrollTrigger = (window as any).ScrollTrigger;

                try
                {
                    // We don't kill all triggers because some might be from other components (like Pin)
                    // Instead, we target elements that haven't been animated yet
                    const fadeAnims = document.querySelectorAll(".fade-anim:not(.togo-animated)");
                    if (fadeAnims.length)
                    {
                        fadeAnims.forEach((item: any) => {
                            item.classList.add('togo-animated'); // Mark as handled

                            const fadeOffset = Number(item.dataset.fadeOffset) || 40;
                            const duration = Number(item.dataset.duration) || 0.75;
                            const fadeFrom = item.dataset.fadeFrom || "bottom";
                            const onScroll = item.dataset.onScroll !== "0";
                            const delay = Number(item.dataset.delay) || 0.15;
                            const ease = item.dataset.ease || "power2.out";

                            const animSettings: any = {
                                opacity: 0,
                                duration,
                                delay,
                                ease,
                                x: 0,
                                y: 0,
                                overwrite: "auto",
                            };

                            switch (fadeFrom)
                            {
                                case "left": animSettings.x = -fadeOffset; break;
                                case "right": animSettings.x = fadeOffset; break;
                                case "top": animSettings.y = -fadeOffset; break;
                                case "bottom":
                                default: animSettings.y = fadeOffset;
                            }

                            // Check if item is already in view (e.g. Hero section)
                            const rect = item.getBoundingClientRect();
                            const isBasicallyVisible = rect.top < (window.innerHeight * 0.9);

                            if (onScroll && !isBasicallyVisible)
                            {
                                animSettings.scrollTrigger = {
                                    trigger: item,
                                    start: "top 85%",
                                    once: true,
                                };
                            }

                            gsap.from(item, animSettings);
                        });
                    }
                } catch (err)
                {
                    console.warn('GSAP re-initialization failed', err);
                }
            }
            // 3. Re-initialize NiceSelect
            if (typeof (window as any).jQuery !== 'undefined')
            {
                const $ = (window as any).jQuery;
                if (typeof $.fn.niceSelect === 'function')
                {
                    try
                    {
                        $('select.wide').niceSelect('destroy'); // Clear old ones
                        $('select.wide').niceSelect();

                        // Remove hydrating class once ready
                        $('.togo-hydrating').removeClass('togo-hydrating');
                    } catch (err)
                    {
                        console.warn('NiceSelect re-initialization failed', err);
                    }
                }
            }
        };

        // Execute after a slightly longer delay to ensure DOM and layout are stable
        const timer = setTimeout(initJS, 300);
        return () => clearTimeout(timer);
    }, [pathname]);

    return null;
}
