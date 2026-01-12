import confetti from 'canvas-confetti';

export function triggerConfetti() {
  // Fire confetti from the center
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#e07850', '#7a9a6d', '#d4a574', '#8fbc8f', '#f4e4bc']
  });
}

export function triggerConfettiSides() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#e07850', '#7a9a6d', '#d4a574', '#8fbc8f', '#f4e4bc']
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

export function triggerFirstDishConfetti() {
  // Extra special confetti for first dish
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const colors = ['#e07850', '#7a9a6d', '#d4a574', '#8fbc8f', '#f4e4bc'];

  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

const FIRST_DISH_KEY = 'pantry_first_dish_created';

export function checkAndTriggerFirstDishConfetti(): boolean {
  const hasCreatedDish = localStorage.getItem(FIRST_DISH_KEY);
  
  if (!hasCreatedDish) {
    localStorage.setItem(FIRST_DISH_KEY, 'true');
    triggerFirstDishConfetti();
    return true;
  }
  
  return false;
}
