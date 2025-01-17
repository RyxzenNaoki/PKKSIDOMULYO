// Import dependencies
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase.js";

// Get elements from the DOM
const registerForm = document.getElementById("registerForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorContainer = document.getElementById("errorContainer");

// Handle form submit event
registerForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent default form submission

  // Get email and password values
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    // Register the user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // If registration successful, show user info or redirect
    console.log("User registered successfully:", user);

    // Redirect user to login page after successful registration
    window.location.href = "login.html"; // Update with the correct URL
  } catch (error) {
    // Handle errors during registration
    const errorCode = error.code;
    const errorMessage = error.message;

    // Display error messages on the UI
    errorContainer.textContent = `Error: ${errorMessage}`;
    console.error("Registration error:", errorCode, errorMessage);
  }
});
