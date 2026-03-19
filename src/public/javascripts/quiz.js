/* Trying to override Bootstrap carousel behavior to mixed success */
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("deckCarousel");
  const instance = bootstrap.Carousel.getInstance(el);
  if (instance) instance.dispose();
});

document.addEventListener("DOMContentLoaded", () => {
  const slides = Array.from(
    document.querySelectorAll("#deckCarousel .carousel-item"),
  );
  let index = 0;

  function showSlide(i) {
    slides.forEach((slide, n) => {
      slide.style.display = n === i ? "flex" : "none";
    });
  }

  showSlide(index);

  document
    .querySelector('[data-bs-slide="next"]')
    .addEventListener("click", () => {
      index = (index + 1) % slides.length;
      showSlide(index);
    });

  document
    .querySelector('[data-bs-slide="prev"]')
    .addEventListener("click", () => {
      index = (index - 1 + slides.length) % slides.length;
      showSlide(index);
    });
});

/* MCQ logic highlights correct answer in green and incorrect answer in red when
 * the appropriate radio button is selected
 */
function initMCQLogic() {
  const mcqGroups = document.querySelectorAll(".mcq-options");

  mcqGroups.forEach((group) => {
    const options = group.querySelectorAll(".mcq-option");

    options.forEach((option) => {
      const radio = option.querySelector("input[type='radio']");
      if (!radio) return;

      radio.addEventListener("change", () => {
        const selectedValue = radio.value;

        // Clear previous states
        options.forEach((opt) => {
          opt.classList.remove("correct", "incorrect", "correct-reveal");
        });

        // Determine correct answer from data attribute
        const correctAnswer = group.dataset.correct;

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

/* When the carousel moves to a new slide, reset flashcard to unflipped, reset
 * MCQ state, and clear radio selections */
function initCarouselReset() {
  const carousel = document.querySelector("#deckCarousel");
  if (!carousel) return;

  carousel.addEventListener("slide.bs.carousel", () => {
    /* Reset flashcards */
    document.querySelectorAll(".flip-card").forEach((card) => {
      card.classList.remove("flipped");
    });

    /* Reset MCQs */
    document.querySelectorAll(".mcq-options").forEach((group) => {
      const options = group.querySelectorAll(".mcq-option");

      options.forEach((opt) => {
        opt.classList.remove("correct", "incorrect", "correct-reveal");
        const radio = opt.querySelector("input[type='radio']");
        if (radio) radio.checked = false;
      });
    });
  });
}

/* Flashcard flip logic causes flashcards to flip when tapped
 * TODO - broken
 */
function initFlashcardFlips() {
  const flipCards = document.querySelectorAll(".flip-card");

  flipCards.forEach((card) => {
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMCQLogic();
  initFlashcardFlips();
  initCarouselReset();
});
