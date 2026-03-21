/**
 * Initializes the deck-playing interface in the DOM, including the carousel, flashcard flipping,
 * MCQ selection and reveal, and a 5-second timer that automates reveal.
 */
document.addEventListener("DOMContentLoaded", () => {
  const slides = Array.from(document.querySelectorAll(".slide-item"));
  const prevBtn = document.querySelector(".slider-prev");
  const nextBtn = document.querySelector(".slider-next");
  let index = 0;

  // If manual input is received pause the automated reveal timer.
  let timerLocked = false;

  /**
   * Returns the animated timer bar element.
   *
   * @returns {HTMLElement | null}
   */
  function getTimer() {
    return document.querySelector(".round-time-bar div");
  }

  /**
   * Pauses the timer animation when users interact manually.
   */
  function pauseTimer() {
    const timer = document.querySelector(".round-time-bar div");
    if (timer) {
      timer.style.animationPlayState = "paused";
    }
  }

  /**
   * Restarts the 5-second timer animation on each new slide. The timer is cloned
   * to remove old event listeners, then CSS animates the reset timer.
   *
   * @returns {HTMLElement | null}
   */
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

  /**
   * @returns Called when the timer finishes. Flips flashcards and reveals correct option in MCQs.
   */
  function handleTimerExpire() {
    const activeSlide = slides[index];
    if (timerLocked) return;

    // Flashcard auto-flip
    const flashcard = activeSlide.querySelector(".flip-card");
    if (flashcard) {
      flashcard.classList.add("flipped");
      return;
    }

    // MCQ auto-reveal
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

  /**
   * Flashcard flipping
   */
  document.querySelectorAll(".flip-card").forEach((card) => {
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
      timerLocked = true;
      pauseTimer();
    });
  });

  /**
   * Initializes click-handling for all MCQs. When an option is selected the timer pauses,
   * correct/incorrect styling is applied, and correct answer is revealed if needed.
   */
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

          // Clear previous state
          options.forEach((opt) => {
            opt.classList.remove("correct", "incorrect", "correct-reveal");
          });

          const selectedValue = radio.value;

          // Correct selection
          if (selectedValue === correctAnswer) {
            option.classList.add("correct");
          } else {
            // Incorrect selection and reveal
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

  /**
   * Resets all flashcards to their unflipped state.
   */
  function resetFlashcards() {
    document.querySelectorAll(".flip-card").forEach((card) => {
      card.classList.remove("flipped");
    });
  }

  /**
   * Resets all MCQs by unchecking radio buttons and removing correctness classes.
   */
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

  /**
   * Displays the slide at index `i`, resets card state, unlocks the timer, and restarts the
   * countdown.
   *
   * @param {number} i - Index of the slide to show
   */
  function showSlide(i) {
    slides.forEach((slide, n) => {
      slide.classList.toggle("active", n === i);
    });

    timerLocked = false;
    resetFlashcards();
    resetMCQs();
    restartTimer();
  }

  /**
   * Carousel navigation to next slide.
   */
  nextBtn.addEventListener("click", () => {
    index = (index + 1) % slides.length;
    showSlide(index);
  });

  /**
   * Carousel navigation to previous slide.
   */
  prevBtn.addEventListener("click", () => {
    index = (index - 1 + slides.length) % slides.length;
    showSlide(index);
  });

  initMCQLogic();
  showSlide(index);
});
