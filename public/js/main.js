document.addEventListener("DOMContentLoaded", function () {
    // 1. Dynamic Active Class for Navigation Links
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(".navbar nav ul li a");
    navLinks.forEach(link => {
        const linkPath = link.getAttribute("href");
        if (currentPath.endsWith(linkPath) || (currentPath === "/" && linkPath === "index.html")) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    // 2. WhatsApp Join Direct Action (Hero Page)
    const joinBtn = document.getElementById("join-whatsapp-btn");
    if (joinBtn) {
        joinBtn.addEventListener("click", function (e) {
            e.preventDefault();

            const originalText = joinBtn.innerHTML;
            joinBtn.disabled = true;
            joinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';

            const phoneNumber = "916385842829";
            const message = "Hello Sarvham Team, I would like to join and become a member. Please share the registration process and further details.";
            const encodedText = encodeURIComponent(message);

            setTimeout(() => {
                try {
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                    if (isMobile) {
                        const nativeUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodedText}`;
                        const webUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;

                        let hasOpened = false;
                        const handleVisibilityChange = () => {
                            if (document.hidden) {
                                hasOpened = true;
                            }
                        };
                        document.addEventListener("visibilitychange", handleVisibilityChange);

                        window.location.href = nativeUrl;

                        setTimeout(() => {
                            document.removeEventListener("visibilitychange", handleVisibilityChange);
                            if (!hasOpened) {
                                window.location.href = webUrl;
                            }
                            joinBtn.disabled = false;
                            joinBtn.innerHTML = originalText;
                        }, 2000);

                    } else {
                        const webUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedText}`;
                        window.open(webUrl, '_blank');

                        joinBtn.disabled = false;
                        joinBtn.innerHTML = originalText;
                    }
                } catch (error) {
                    console.error("WhatsApp redirect error:", error);
                    showErrorToast("Unable to open WhatsApp automatically. Please contact us directly at +91 6385842829.");
                    joinBtn.disabled = false;
                    joinBtn.innerHTML = originalText;
                }
            }, 800);
        });
    }

    // 3. Dynamic Gallery Fetching & Insertion (Homepage Carousel Track)
    const galleryTrack = document.querySelector(".gallery-track");
    if (galleryTrack) {
        fetch("/api/gallery")
            .then(res => res.json())
            .then(images => {
                if (images && images.length > 0) {
                    galleryTrack.innerHTML = ""; // Clear loader/hardcoded placeholders
                    
                    // Render fetched images
                    images.forEach(img => {
                        const imgElement = document.createElement("img");
                        imgElement.src = img.imageUrl;
                        imgElement.alt = img.title;
                        imgElement.title = `${img.title} - ${img.description || ""}`;
                        galleryTrack.appendChild(imgElement);
                    });

                    // Duplicate images to maintain a flawless infinite scroll carousel loop
                    const totalImages = images.length;
                    for (let i = 0; i < Math.max(8, totalImages); i++) {
                        const cloneImg = document.createElement("img");
                        const sourceImg = images[i % totalImages];
                        cloneImg.src = sourceImg.imageUrl;
                        cloneImg.alt = sourceImg.title;
                        cloneImg.title = `${sourceImg.title} - ${sourceImg.description || ""}`;
                        galleryTrack.appendChild(cloneImg);
                    }
                }
            })
            .catch(err => {
                console.error("Failed to dynamically fetch gallery. Using hardcoded static fallback:", err);
            });
    }

    // 4. AJAX Contact Form Submission
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        const feedback = document.getElementById("form-feedback");
        const submitBtn = contactForm.querySelector("button");

        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            feedback.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending message...';
            feedback.className = 'form-feedback processing';
            submitBtn.disabled = true;

            const name = document.getElementById("contact-name").value.trim();
            const email = document.getElementById("contact-email").value.trim();
            const phone = document.getElementById("contact-phone").value.trim();
            const message = document.getElementById("contact-message").value.trim();

            if (!name || !email || !phone || !message) {
                feedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> All fields are required.';
                feedback.className = 'form-feedback error';
                submitBtn.disabled = false;
                return;
            }

            try {
                const response = await fetch("/api/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, phone, message })
                });

                const result = await response.json();

                if (response.ok) {
                    feedback.innerHTML = '<i class="fas fa-check-circle"></i> Message sent successfully!';
                    feedback.className = 'form-feedback success';
                    contactForm.reset();
                } else {
                    throw new Error(result.error || 'Failed to send message.');
                }
            } catch (err) {
                feedback.innerHTML = `<i class="fas fa-times-circle"></i> ${err.message}`;
                feedback.className = 'form-feedback error';
            } finally {
                submitBtn.disabled = false;
                setTimeout(() => {
                    feedback.textContent = '';
                    feedback.className = 'form-feedback';
                }, 4000);
            }
        });
    }

    // 5. AJAX Join Volunteer Form Submission
    const joinForm = document.getElementById("joinForm");
    if (joinForm) {
        const submitBtn = joinForm.querySelector("button");

        // Create elegant loading spinner
        const loadingSpinner = document.createElement("div");
        loadingSpinner.style.position = "fixed";
        loadingSpinner.style.top = "50%";
        loadingSpinner.style.left = "50%";
        loadingSpinner.style.transform = "translate(-50%, -50%)";
        loadingSpinner.style.backgroundColor = "rgba(0,0,0,0.85)";
        loadingSpinner.style.color = "white";
        loadingSpinner.style.padding = "20px 40px";
        loadingSpinner.style.borderRadius = "10px";
        loadingSpinner.style.zIndex = "10000";
        loadingSpinner.style.fontFamily = "inherit";
        loadingSpinner.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
        loadingSpinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting application...';

        joinForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const fullName = document.getElementById("fullname").value.trim();
            const fatherName = document.getElementById("fatherName").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const whatsapp = document.getElementById("whatsapp").value.trim();
            const aadhar = document.getElementById("aadhar").value.trim();
            const dob = document.getElementById("dob").value.trim();
            const gender = document.getElementById("gender").value.trim();
            const bloodGroup = document.getElementById("bloodGroup").value.trim();
            const street = document.getElementById("street").value.trim();
            const place = document.getElementById("place").value.trim();
            const district = document.getElementById("district").value.trim();
            const pincode = document.getElementById("pincode").value.trim();
            const state = document.getElementById("state").value.trim();
            const message = document.getElementById("message").value.trim();

            if (!fullName || !fatherName || !email || !phone || !whatsapp || !aadhar || !dob || !gender ||
                !bloodGroup || !street || !place || !district || !pincode || !state || !message) {
                showErrorToast("Please fill out all fields.");
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = "Submitting...";
            document.body.appendChild(loadingSpinner);

            try {
                const response = await fetch("/api/join", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fullName,
                        fatherName,
                        email,
                        phone,
                        whatsapp,
                        aadhar,
                        dob,
                        gender,
                        bloodGroup,
                        street,
                        place,
                        district,
                        pincode,
                        state,
                        message
                    })
                });

                const result = await response.json();
                if (response.ok) {
                    showSuccessToast(result.message || "Successfully submitted!");
                    joinForm.reset();
                } else {
                    showErrorToast("Error: " + result.error);
                }
            } catch (err) {
                console.error("Error:", err);
                showErrorToast("Something went wrong. Please try again later.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Join Now";
                if (document.body.contains(loadingSpinner)) {
                    document.body.removeChild(loadingSpinner);
                }
            }
        });
    }

    // Helper alerts styling
    function showSuccessToast(msg) {
        const toast = document.createElement("div");
        toast.style.position = "fixed";
        toast.style.bottom = "20px";
        toast.style.left = "50%";
        toast.style.transform = "translateX(-50%)";
        toast.style.backgroundColor = "#2ecc71";
        toast.style.color = "white";
        toast.style.padding = "12px 30px";
        toast.style.borderRadius = "30px";
        toast.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";
        toast.style.zIndex = "10001";
        toast.style.fontFamily = "inherit";
        toast.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    function showErrorToast(msg) {
        const toast = document.createElement("div");
        toast.style.position = "fixed";
        toast.style.bottom = "20px";
        toast.style.left = "50%";
        toast.style.transform = "translateX(-50%)";
        toast.style.backgroundColor = "#e74c3c";
        toast.style.color = "white";
        toast.style.padding = "12px 30px";
        toast.style.borderRadius = "30px";
        toast.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";
        toast.style.zIndex = "10001";
        toast.style.fontFamily = "inherit";
        toast.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${msg}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }
});
