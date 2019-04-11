function rnd() {
  return Math.floor(Math.random() * 256);
}
setInterval(() => {
  document.body.style.color = `rgb(${rnd()}, ${rnd()}, ${rnd()})`;
}, 1000);
