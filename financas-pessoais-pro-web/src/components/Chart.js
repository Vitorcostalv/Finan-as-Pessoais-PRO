import { el } from '../utils/dom.js';

const defaultOptions = {
  type: 'line',
  data: { labels: [], datasets: [] },
  options: {
    tension: 0.4,
  },
};

const Chart = (config = {}) => {
  const cfg = { ...defaultOptions, ...config };
  const canvas = el('canvas', { class: 'chart-canvas', attrs: { role: 'img' } });
  const ctx = canvas.getContext('2d');

  const drawLine = () => {
    const { labels, datasets } = cfg.data;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padding = 32;
    const stepX = (width - padding * 2) / Math.max(1, labels.length - 1);

    datasets.forEach((dataset) => {
      const values = dataset.data;
      const max = Math.max(...values);
      const min = Math.min(...values);
      const range = max - min || 1;

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = dataset.borderColor || '#7c3aed';
      ctx.shadowColor = dataset.borderColor || '#7c3aed';
      ctx.shadowBlur = 10;

      values.forEach((value, index) => {
        const x = padding + index * stepX;
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    });
  };

  const drawBar = () => {
    const { labels, datasets } = cfg.data;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    const padding = 32;
    const barWidth = (width - padding * 2) / labels.length;
    const values = datasets[0]?.data || [];
    const max = Math.max(...values, 1);

    values.forEach((value, index) => {
      const x = padding + index * barWidth;
      const barHeight = ((value / max) * (height - padding * 2));
      ctx.fillStyle = datasets[0]?.backgroundColor?.[index] || '#22c55e';
      ctx.fillRect(x, height - padding - barHeight, barWidth * 0.6, barHeight);
    });
  };

  const drawPie = () => {
    const { datasets } = cfg.data;
    const values = datasets[0]?.data || [];
    const total = values.reduce((sum, value) => sum + value, 0) || 1;
    let startAngle = -Math.PI / 2;

    values.forEach((value, index) => {
      const sliceAngle = (value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.fillStyle = datasets[0]?.backgroundColor?.[index] || '#7c3aed';
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        Math.min(canvas.width, canvas.height) / 2 - 10,
        startAngle,
        startAngle + sliceAngle
      );
      ctx.closePath();
      ctx.fill();
      startAngle += sliceAngle;
    });
  };

  const resize = () => {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    if (cfg.type === 'line') drawLine();
    if (cfg.type === 'bar') drawBar();
    if (cfg.type === 'pie') drawPie();
  };

  const update = (nextConfig) => {
    Object.assign(cfg, nextConfig);
    resize();
  };

  window.addEventListener('resize', resize);
  setTimeout(resize, 50);

  return {
    element: el('div', { class: 'chart', children: [canvas] }),
    update,
  };
};

export default Chart;
