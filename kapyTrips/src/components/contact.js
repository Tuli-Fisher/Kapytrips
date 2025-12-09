
export function setupContactForm() {
    const form = document.getElementById("contact-form");
    const result = document.getElementById("form-result");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // reset status
        result.style.display = "none";
        result.className = "form-result";

        const formData = new FormData(form);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: json,
            });

            const jsonResponse = await response.json();

            if (response.status === 200) {
                result.innerHTML = jsonResponse.message || "Message sent successfully!";
                result.classList.add("success");
                form.reset();
            } else {
                console.log(response);
                result.innerHTML = jsonResponse.message || "Something went wrong!";
                result.classList.add("error");
            }
        } catch (error) {
            console.log(error);
            result.innerHTML = "Something went wrong!";
            result.classList.add("error");
        } finally {
            result.style.display = "block";
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;

            // Hide success message after 5 seconds
            if (result.classList.contains("success")) {
                setTimeout(() => {
                    result.style.display = "none";
                }, 5000);
            }
        }
    });
}
