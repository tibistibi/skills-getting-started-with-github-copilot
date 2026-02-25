document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <p>Participants:</p>
          <ul class="participants-list">
            ${details.participants
              .map(
                (participant) =>
                  `<li>
                     <span class="participant-email">${participant}</span>
                     <button class="remove-participant" data-activity="${name}" data-email="${participant}" title="Unregister">&times;</button>
                   </li>`
              )
              .join("")}
          </ul>
        `;

        activitiesList.appendChild(activityCard);

        // attach remove handlers
        activityCard.querySelectorAll(".remove-participant").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const act = btn.dataset.activity;
            const emailToRemove = btn.dataset.email;
            try {
              const resp = await fetch(
                `/activities/${encodeURIComponent(act)}/unregister?email=${encodeURIComponent(
                  emailToRemove
                )}`,
                { method: "DELETE" }
              );
              const json = await resp.json();
              if (resp.ok) {
                messageDiv.textContent = json.message || "Unregistered successfully";
                messageDiv.className = "success";
                // refresh the activities list to reflect change
                fetchActivities();
              } else {
                messageDiv.textContent = json.detail || "Failed to unregister";
                messageDiv.className = "error";
              }
            } catch (err) {
              console.error("Error unregistering:", err);
              messageDiv.textContent = "Error unregistering. Please try again.";
              messageDiv.className = "error";
            }
            messageDiv.classList.remove("hidden");

            setTimeout(() => {
              messageDiv.classList.add("hidden");
            }, 5000);
          });
        });

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // refresh list to show new participant
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
