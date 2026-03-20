// Bootstrap's carousel is intractible, so I'll just use my own (basic) one
document.addEventListener("DOMContentLoaded", () => {
  const slides = Array.from(document.querySelectorAll(".slide-item"));
  const prevBtn = document.querySelector(".slider-prev");
  const nextBtn = document.querySelector(".slider-next");

  let index = 0;

  function showSlide(i) {
    slides.forEach((slide, n) => {
      slide.classList.toggle("active", n === i);
    });

    resetFlashcards();
    resetMCQs();
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

          // Select the radio programmatically
          radio.checked = true;

          // Clear previous states
          options.forEach((opt) => {
            opt.classList.remove("correct", "incorrect", "correct-reveal");
          });

          const selectedValue = radio.value;

          // Apply correct/incorrect classes
          if (selectedValue === correctAnswer) {
            option.classList.add("correct");
          } else {
            option.classList.add("incorrect");

            // Reveal correct answer
            options.forEach((opt) => {
              const optRadio = opt.querySelector("input[type='radio']");
              if (optRadio && optRadio.value === correctAnswer) {
                opt.classList.add("correct-reveal");
              }
            });
          }
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
    });
  });

  initMCQLogic();
  showSlide(index);
});
