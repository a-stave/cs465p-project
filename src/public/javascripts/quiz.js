// Bootstrap's carousel is intractible, so I'll just use my own (basic) one
document.addEventListener("DOMContentLoaded", () => {
  const slides = Array.from(document.querySelectorAll(".slide-item"));
  const prevBtn = document.querySelector(".slider-prev");
  const nextBtn = document.querySelector(".slider-next");

  let index = 0;
  let timerLocked = false;

  function getTimer() {
    return document.querySelector(".round-time-bar div");
  }

  function restartTimer() {
    let timer = getTimer();
    if (!timer) return;

    // Remove old listeners by cloning
    const clone = timer.cloneNode(true);
    timer.parentNode.replaceChild(clone, timer);
    timer = clone;

    // Restart animation
    timer.style.animation = "none";
    timer.offsetHeight; // force reflow
    timer.style.animation = "";

    timer.addEventListener("animationend", handleTimerExpire);
  }

  function showSlide(i) {
    slides.forEach((slide, n) => {
      slide.classList.toggle("active", n === i);
    });

    timerLocked = false;
    resetFlashcards();
    resetMCQs();
    restartTimer();
  }

  function pauseTimer() {
    const timer = document.querySelector(".round-time-bar div");
    if (timer) {
      timer.style.animationPlayState = "paused";
    }
  }

  function handleTimerExpire() {
    const activeSlide = slides[index];
    if (timerLocked) return;

    // Flashcard?
    const flashcard = activeSlide.querySelector(".flip-card");
    if (flashcard) {
      flashcard.classList.add("flipped");
      return;
    }

    // MCQ?
    const mcqGroup = activeSlide.querySelector(".mcq-options");
    if (mcqGroup) {
      const correct = mcqGroup.dataset.correct;
      const options = mcqGroup.querySelectorAll(".mcq-option");

      options.forEach((opt) => {
        const radio = opt.querySelector("input[type='radio']");
        if (radio && radio.value === correct) {
          opt.classList.add("correct-reveal");
        }
      });
    }
  }

  function resetFlashcards() {
    document.querySelectorAll(".flip-card").forEach((card) => {
      card.classList.remove("flipped");
    });
  }

  function resetMCQs() {
    document.querySelectorAll(".mcq-options").forEach((group) => {
      const options = group.querySelectorAll(".mcq-option");
      options.forEach((opt) => {
        opt.classList.remove("correct", "incorrect", "correct-reveal");
        const radio = opt.querySelector("input[type='radio']");
        if (radio) radio.checked = false;
      });
    });
  }

  function initMCQLogic() {
    const mcqGroups = document.querySelectorAll(".mcq-options");

    mcqGroups.forEach((group) => {
      const options = group.querySelectorAll(".mcq-option");
      const correctAnswer = group.dataset.correct;

      options.forEach((option) => {
        option.addEventListener("click", () => {
          const radio = option.querySelector("input[type='radio']");
          if (!radio) return;

          radio.checked = true;

          options.forEach((opt) => {
            opt.classList.remove("correct", "incorrect", "correct-reveal");
          });

          const selectedValue = radio.value;

          if (selectedValue === correctAnswer) {
            option.classList.add("correct");
          } else {
            option.classList.add("incorrect");

            options.forEach((opt) => {
              const optRadio = opt.querySelector("input[type='radio']");
              if (optRadio && optRadio.value === correctAnswer) {
                opt.classList.add("correct-reveal");
              }
            });
          }
          timerLocked = true;
          pauseTimer();
        });
      });
    });
  }

  // Navigation
  nextBtn.addEventListener("click", () => {
    index = (index + 1) % slides.length;
    showSlide(index);
  });

  prevBtn.addEventListener("click", () => {
    index = (index - 1 + slides.length) % slides.length;
    showSlide(index);
  });

  // Flashcard flipping
  document.querySelectorAll(".flip-card").forEach((card) => {
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
      timerLocked = true;
      pauseTimer();
    });
  });

  initMCQLogic();
  showSlide(index);
});
