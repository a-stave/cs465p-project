/**
 * Credit: [CSS-Tricks typewriter effect](https://css-tricks.com/snippets/css/typewriter-effect/)
 */
class Typewriter {
  constructor(el, toRotate, period) {
    this.toRotate = toRotate;
    this.el = el;
    this.wrap = el.querySelector(".wrap");
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 2000;
    this.txt = "";
    this.isDeleting = false;
    this.tick();
  }

  tick() {
    const i = this.loopNum % this.toRotate.length;
    const fullTxt = this.toRotate[i];
    const wrap = this.wrap;

    if (this.isDeleting) {
      this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
      this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    wrap.textContent = this.txt;

    if (this.isDeleting || this.txt !== fullTxt) {
      wrap.classList.remove("cursor-blink");
      wrap.classList.add("cursor-solid");
    } else {
      wrap.classList.remove("cursor-solid");
      wrap.classList.add("cursor-blink");
    }

    let delta = 120 - Math.random() * 80;
    if (this.isDeleting) delta /= 2;

    if (!this.isDeleting && this.txt === fullTxt) {
      delta = this.period;
      this.isDeleting = true;
    } else if (this.isDeleting && this.txt === "") {
      this.isDeleting = false;
      this.loopNum++;
      delta = 500;
    }

    setTimeout(() => this.tick(), delta);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const elements = document.getElementsByClassName("typewrite");

  for (let i = 0; i < elements.length; i++) {
    const toRotate = elements[i].getAttribute("data-type");
    const period = elements[i].getAttribute("data-period");

    if (toRotate) {
      new Typewriter(elements[i], JSON.parse(toRotate), period);
    }
  }
});
