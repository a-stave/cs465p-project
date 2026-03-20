document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".icon-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });
});

let deleteTarget = null;

function openDeleteModal(btn) {
  deleteTarget = {
    id: btn.dataset.id,
    route: btn.dataset.route,
  };

  const modalEl = document.getElementById("deleteModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

document.addEventListener("DOMContentLoaded", () => {
  // Prevent summary toggling when clicking icons
  document.querySelectorAll(".icon-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });

  // Handle delete confirmation
  const confirmBtn = document.getElementById("confirmDeleteBtn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      if (!deleteTarget) return;

      const { id, route } = deleteTarget;

      const res = await fetch(`/${route}/${id}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        location.reload();
      } else {
        alert("Error deleting item.");
      }
    });
  }
});
