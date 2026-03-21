/**
 * Tracks the item the user intends to delete. This object is populated when the delete button is
 * clicked and consumed when the user confirms deletion.
 */
let deleteTarget = null;

/**
 * Prevents tapping of play/edit/delete buttons from triggering the block to expand.
 */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".icon-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });
});

/**
 * Opens the Bootstrap delete-confirmation modal and stores the target item.
 *
 * @param {HTMLElement} btn - The delete button that was clicked. Must contain the data-id and
 * data-route attributes.
 */
function openDeleteModal(btn) {
  deleteTarget = {
    id: btn.dataset.id,
    route: btn.dataset.route,
  };

  const modalEl = document.getElementById("deleteModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

/**
 * Handles the deletion request after confirmation is received. Sends a POST to /:id/delete and
 * reloads the page on success.
 */
document.addEventListener("DOMContentLoaded", () => {
  const confirmBtn = document.getElementById("confirmDeleteBtn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      if (!deleteTarget) return;

      const { id, route } = deleteTarget;

      try {
        const res = await fetch(`/${route}/${id}/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          location.reload();
        } else {
          alert("Error deleting item.");
        }
      } catch (error) {
        console.error("Delete request failed:", error);
        alert("Error deleting item.");
      }
    });
  }
});
