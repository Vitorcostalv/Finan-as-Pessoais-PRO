const random = (min, max) => Math.random() * (max - min) + min;

const confetti = () => {
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  const ctx = canvas.getContext('2d');
  document.body.appendChild(canvas);

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const pieces = Array.from({ length: 150 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height - height,
    size: random(5, 12),
    speed: random(1, 3),
    color: `hsl(${random(180, 360)}, 70%, 60%)`,
    rotation: random(0, Math.PI * 2),
  }));

  const update = () => {
    ctx.clearRect(0, 0, width, height);
    pieces.forEach((piece) => {
      piece.y += piece.speed;
      piece.rotation += 0.02;
      if (piece.y > height) piece.y = -10;
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
      ctx.restore();
    });
    animationFrame = requestAnimationFrame(update);
  };

  let animationFrame = requestAnimationFrame(update);

  setTimeout(() => {
    cancelAnimationFrame(animationFrame);
    canvas.remove();
  }, 3000);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
};

export default confetti;
