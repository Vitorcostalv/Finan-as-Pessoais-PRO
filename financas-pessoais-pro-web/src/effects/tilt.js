const tilt = (element) => {
  const handleMouseMove = (event) => {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    element.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const reset = () => {
    element.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg)';
  };

  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', reset);
};

export default tilt;
