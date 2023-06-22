const loginForm = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");



loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailUsername = document.getElementById("email-username").value;
    const password = document.getElementById("password").value;

    const credentials = btoa(`${emailUsername}:${password}`);

    try {
        const response = await fetch("https://zone01normandie.org/api/auth/signin", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${credentials}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("JWT", data);

            window.location.replace("profil.html");
        } else {
            errorMessage.textContent = "Identifiants incorrect";
        }
    } catch (error) {
        errorMessage.textContent = "Une erreur est survenue";
    }
});
