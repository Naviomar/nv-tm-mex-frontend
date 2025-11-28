import confetti from 'canvas-confetti';

function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

type ConfettiOptions = {
    particleCount?: number;
    spread?: number;
    startVelocity?: number;
    ticks?: number;
    zIndex?: number;
    origin?: {
        x?: number;
        y?: number;
    };
    angle?: number;
    decay?: number;
    drift?: number;
    gravity?: number;
    scalar?: number;
    shapes?: string[];
    colors?: string[];
};

export default function useConfetti() {
    const fireworks = () => {
        const duration = 5 * 1000; // 5 seconds duration
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const interval: NodeJS.Timeout = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                clearInterval(interval);
                return;
            }

            const particleCount = 50 * (timeLeft / duration);
            // Fire confetti from the left and right
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            });
        }, 250);
    };

    const simpleConfetti = (options?: ConfettiOptions) => {
        confetti(options || { particleCount: 100, spread: 70, origin: { y: 0.6 } });
    };

    return {
        fireworks,
        simpleConfetti,
    };
}
