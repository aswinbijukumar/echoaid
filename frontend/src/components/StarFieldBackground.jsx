import React, { useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';

const StarFieldBackground = () => {
    const canvasRef = useRef(null);
    const { darkMode } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let stars = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initStars();
        };

        const initStars = () => {
            stars = [];
            const numStars = Math.floor((canvas.width * canvas.height) / 3000); // Density

            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 1.5,
                    color: `rgba(${Math.random() * 55 + 200}, ${Math.random() * 55 + 200}, 255, ${Math.random()})`, // Bluish white
                    velocity: Math.random() * 0.5 + 0.1,
                    alpha: Math.random(),
                    fading: Math.random() > 0.5
                });
            }
        };

        const animate = () => {
            // Clear with trail effect
            ctx.fillStyle = darkMode ? 'rgba(10, 10, 20, 0.2)' : 'rgba(240, 245, 255, 0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            stars.forEach(star => {
                // Update position
                star.y -= star.velocity; // Move up

                // Wrap around
                if (star.y < 0) {
                    star.y = canvas.height;
                    star.x = Math.random() * canvas.width;
                }

                // Twinkle
                if (star.fading) {
                    star.alpha -= 0.01;
                    if (star.alpha <= 0.2) star.fading = false;
                } else {
                    star.alpha += 0.01;
                    if (star.alpha >= 1) star.fading = true;
                }

                // Draw
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = darkMode
                    ? `rgba(255, 255, 255, ${star.alpha})`
                    : `rgba(50, 50, 150, ${star.alpha})`; // Blue stars in light mode
                ctx.fill();

                // Glow effect for larger stars
                if (star.radius > 1 && darkMode) {
                    ctx.shadowBlur = 5;
                    ctx.shadowColor = "white";
                } else {
                    ctx.shadowBlur = 0;
                }
            });

            animationFrameId = window.requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [darkMode]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[-1] pointer-events-none transition-colors duration-1000"
            style={{
                background: darkMode
                    ? 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)'
                    : 'radial-gradient(ellipse at top, #E6F0FF 0%, #FFFFFF 100%)'
            }}
        />
    );
};

export default StarFieldBackground;
