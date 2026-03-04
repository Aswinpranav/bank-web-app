import React, { useRef, useEffect } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

const LiveTree = ({ hueRotate = 0 }) => {
    const canvasRef = useRef(null);
    const scrollRef = useRef(0);

    // Hook into Framer Motion's scroll directly to easily update a ref we can access in the animation loop
    const { scrollYProgress } = useScroll();
    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        scrollRef.current = latest;
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        let time = 0;

        class Firefly {
            constructor() {
                this.reset();
                this.y = Math.random() * canvas.height; // initial scatter
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + 10;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * -1.5 - 0.5;
                this.life = Math.random() * 100;
            }
            update(wind, scrollOffset) {
                this.x += this.speedX + wind;
                this.y += this.speedY - (scrollOffset * 0.1); // float faster when scrolling
                this.life += 0.05;

                if (this.y < -50 || this.x > canvas.width + 50 || this.x < -50) {
                    this.reset();
                }
            }
            draw(ctx) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(150, 100%, 70%, ${Math.abs(Math.sin(this.life))})`;
                ctx.fill();
                ctx.restore();
            }
        }

        const fireflies = Array.from({ length: 45 }, () => new Firefly());

        // Recursive function to draw tree
        const drawBranch = (startX, startY, len, angle, branchWidth, depth, maxDepth, wind) => {
            ctx.save();
            ctx.translate(startX, startY);
            ctx.rotate(angle);

            // Branch color gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, -len);
            if (depth < 4) {
                // Trunk is dark brown-green
                gradient.addColorStop(0, '#0a1a0f');
                gradient.addColorStop(1, '#11331c');
            } else {
                // Leaves/outer branches are glowing green
                gradient.addColorStop(0, '#11331c');
                gradient.addColorStop(1, '#00ff99');
            }

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -len);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = branchWidth;
            ctx.lineCap = 'round';

            ctx.stroke();

            if (depth < maxDepth) {
                // Recursive branching
                const newLen = len * 0.75;
                const newWidth = branchWidth * 0.65;
                const flex = Math.sin(time + depth * 0.5) * 0.03 * wind;

                // Right branch
                drawBranch(0, -len, newLen, 0.4 + flex, newWidth, depth + 1, maxDepth, wind);
                // Left branch
                drawBranch(0, -len, newLen, -0.4 + flex, newWidth, depth + 1, maxDepth, wind);
            } else {
                // Draw leaves at the tips
                ctx.beginPath();
                ctx.arc(0, -len, 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 255, 153, ${0.5 + Math.abs(Math.sin(time)) * 0.5})`;
                ctx.fill();
            }

            ctx.restore();
        };

        const render = () => {
            time += 0.015;

            // Clear canvas with a very slight fade for trailing effect (optional, removed for clarity)
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const currentScroll = scrollRef.current; // 0 to 1

            // Base wind plus extra wind injected by scrolling depth!
            const windForce = Math.sin(time) * 1.5 + (currentScroll * 3);

            fireflies.forEach(firefly => {
                firefly.update(windForce * 0.5, currentScroll * 100);
                firefly.draw(ctx);
            });

            // Position the tree dynamically based on scroll
            // As user scrolls down (scrollProgress -> 1), tree moves up the screen
            const treeBaseX = canvas.width * 0.75; // Right side of the screen
            const treeBaseY = canvas.height + 50 - (currentScroll * canvas.height * 0.5);
            const initialLength = Math.min(canvas.height / 5, 200);

            drawBranch(
                treeBaseX,
                treeBaseY,
                initialLength,
                0, // angle
                18, // width
                0, // current depth
                8, // max depth (reduced from 9 to prevent lag)
                windForce
            );

            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
                opacity: 0.8,
                filter: `hue-rotate(${hueRotate}deg)`
            }}
        />
    );
};

export default LiveTree;
