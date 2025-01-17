import { auth, signInWithEmailAndPassword } from '../../../firebase.js';

document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("yourEmail").value;
    const password = document.getElementById("yourPassword").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Logged in successfully
            const user = userCredential.user;
            console.log("User logged in: ", user);
            // Redirect or show dashboard
            window.location.href = "dashboard.html"; // Atau halaman lain
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Login failed:", errorCode, errorMessage);
            alert("Login failed: " + errorMessage);
        });
});
