document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".icon-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });
});
