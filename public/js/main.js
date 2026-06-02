document.addEventListener("DOMContentLoaded", function () {
    // 0. Dynamic Helpline & Contact Loading
    fetch("/api/stats")
        .then(res => res.json())
        .then(data => {
            if (data) {
                const helplineLink = document.getElementById("emergency-helpline-link");
                const helplineText = document.getElementById("emergency-helpline-text");
                const helplinePhone = data.helplinePhone || data.phone;
                if (helplineLink && helplinePhone) {
                    helplineLink.href = `tel:${helplinePhone.replace(/\s+/g, '')}`;
                }
                if (helplineText && helplinePhone) {
                    helplineText.textContent = helplinePhone;
                }

                const supportEmailLink = document.getElementById("support-email-link");
                const supportEmailText = document.getElementById("support-email-text");
                if (supportEmailLink && data.email) {
                    supportEmailLink.href = `mailto:${data.email}`;
                }
                if (supportEmailText && data.email) {
                    supportEmailText.textContent = data.email;
                }
            }
        })
        .catch(err => console.error("Failed to dynamically load contact info:", err));

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
        const phoneInput = document.getElementById("contact-phone");

        if (phoneInput) {
            phoneInput.addEventListener("input", (e) => {
                // Remove non-digit characters dynamically
                e.target.value = e.target.value.replace(/\D/g, "");
            });
        }

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

            // Validate that phone is exactly 10 digits
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(phone)) {
                feedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> Phone number must be exactly 10 digits.';
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

                    // Fetch the dynamic WhatsApp config and append formatted data
                    try {
                        const statsRes = await fetch("/api/stats");
                        const config = await statsRes.json();
                        
                        const waPhone = config.whatsappPhone || "916385842829";
                        const waBaseText = config.whatsappText || "Hello Sarvham Foundation, I have successfully submitted my volunteer application. Looking forward to joining!";
                        
                        const dataSummary = `\n\n--- Volunteer Registration Dossier ---\n• Name: ${fullName}\n• Father's Name: ${fatherName}\n• Email: ${email}\n• Phone: ${phone}\n• WhatsApp: ${whatsapp}\n• Aadhar ID: ${aadhar}\n• Date of Birth: ${dob}\n• Gender: ${gender}\n• Blood Group: ${bloodGroup}\n• Address: ${street}, ${place}, ${district}, ${state} - ${pincode}\n• Why join: ${message}`;
                        
                        const finalMessage = waBaseText + dataSummary;
                        const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(finalMessage)}`;

                        setTimeout(() => {
                            window.open(waUrl, "_blank");
                        }, 1500);
                    } catch (configErr) {
                        console.error("Failed to load WhatsApp redirect config, using defaults:", configErr);
                        const backupMsg = `Hello Sarvham Foundation, I have successfully submitted my volunteer application under the name ${fullName}. Looking forward to joining!`;
                        const backupUrl = `https://wa.me/916385842829?text=${encodeURIComponent(backupMsg)}`;
                        setTimeout(() => {
                            window.open(backupUrl, "_blank");
                        }, 1500);
                    }
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

    // 5.5. AJAX Blood Enquiry Form Submission
    const bloodForm = document.getElementById("blood-form");
    if (bloodForm) {
        const feedback = document.getElementById("blood-feedback");
        const submitBtn = bloodForm.querySelector("button");
        const phoneInput = document.getElementById("blood-phone");

        if (phoneInput) {
            phoneInput.addEventListener("input", (e) => {
                e.target.value = e.target.value.replace(/\D/g, "");
            });
        }

        bloodForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            feedback.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting emergency request...';
            feedback.className = 'form-feedback processing';
            submitBtn.disabled = true;

            const patientName = document.getElementById("blood-patientName").value.trim();
            const contactName = document.getElementById("blood-contactName").value.trim();
            const email = document.getElementById("blood-email").value.trim();
            const phone = document.getElementById("blood-phone").value.trim();
            const bloodGroup = document.getElementById("blood-group").value.trim();
            const unitsRequired = parseInt(document.getElementById("blood-units").value.trim(), 10);
            const requiredDate = document.getElementById("blood-date").value.trim();
            const hospitalName = document.getElementById("blood-hospitalName").value.trim();
            const hospitalLocation = document.getElementById("blood-hospitalLocation").value.trim();
            const message = document.getElementById("blood-message").value.trim();

            if (!patientName || !contactName || !email || !phone || !bloodGroup || !unitsRequired || !requiredDate || !hospitalName || !hospitalLocation) {
                feedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please fill out all required fields.';
                feedback.className = 'form-feedback error';
                submitBtn.disabled = false;
                return;
            }

            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(phone)) {
                feedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> Phone number must be exactly 10 digits.';
                feedback.className = 'form-feedback error';
                submitBtn.disabled = false;
                return;
            }

            try {
                const response = await fetch("/api/blood-enquiry", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        patientName,
                        contactName,
                        email,
                        phone,
                        bloodGroup,
                        unitsRequired,
                        requiredDate,
                        hospitalName,
                        hospitalLocation,
                        message
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    feedback.innerHTML = '<i class="fas fa-check-circle"></i> Emergency request submitted successfully! Our team will contact you shortly.';
                    feedback.className = 'form-feedback success';
                    bloodForm.reset();
                    document.getElementById('blood-date').valueAsDate = new Date();
                    // Reset the custom blood-group dropdown UI (defined in blood-enquiry.html inline script)
                    if (typeof window.bloodDropdownReset === 'function') {
                        window.bloodDropdownReset();
                    }
                    showSuccessToast("Emergency request submitted successfully!");
                } else {
                    throw new Error(result.error || 'Failed to submit request.');
                }
            } catch (err) {
                // Show friendly message for DB timeout errors
                const userMsg = (err.message && (err.message.includes('buffering') || err.message.includes('Server error')))
                    ? 'Database is unavailable. Please call +91 6385842829 for immediate assistance.'
                    : (err.message || 'Something went wrong. Please try again.');
                feedback.innerHTML = `<i class="fas fa-times-circle"></i> ${userMsg}`;
                feedback.className = 'form-feedback error';
                showErrorToast(userMsg);
            } finally {
                submitBtn.disabled = false;
                setTimeout(() => {
                    feedback.textContent = '';
                    feedback.className = 'form-feedback';
                }, 5000);
            }
        });
    }

    // 5.6 Become a Blood Donor Form Submission
    const donorForm = document.getElementById("donor-form");
    if (donorForm) {
        const dFeedback = document.getElementById("donor-feedback");
        const dSubmitBtn = donorForm.querySelector("button[type='submit']");

        donorForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            dFeedback.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering donor profile...';
            dFeedback.className = 'form-feedback processing';
            dSubmitBtn.disabled = true;

            const fullName = document.getElementById("donor-fullName").value.trim();
            const phone = document.getElementById("donor-phone").value.trim();
            const email = document.getElementById("donor-email").value.trim();
            const age = parseInt(document.getElementById("donor-age").value.trim(), 10);
            const gender = document.getElementById("donor-gender").value;
            const bloodGroup = document.getElementById("donor-group").value.trim();
            const city = document.getElementById("donor-city").value.trim();
            const lastDonationDate = document.getElementById("donor-lastDonationDate").value.trim();
            const address = document.getElementById("donor-address").value.trim();
            const availability = document.getElementById("donor-availability").value;
            const consent = document.getElementById("donor-consent").checked;

            if (!fullName || !phone || !age || !gender || !bloodGroup || !city || !address) {
                dFeedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please fill out all required fields.';
                dFeedback.className = 'form-feedback error';
                dSubmitBtn.disabled = false;
                return;
            }

            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(phone)) {
                dFeedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> Mobile number must be exactly 10 digits.';
                dFeedback.className = 'form-feedback error';
                dSubmitBtn.disabled = false;
                return;
            }

            if (age < 18 || age > 65) {
                dFeedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> Age must be between 18 and 65 years.';
                dFeedback.className = 'form-feedback error';
                dSubmitBtn.disabled = false;
                return;
            }

            if (!consent) {
                dFeedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> You must agree to be contacted for blood donation requests.';
                dFeedback.className = 'form-feedback error';
                dSubmitBtn.disabled = false;
                return;
            }

            try {
                const response = await fetch("/api/donor", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fullName,
                        phone,
                        email,
                        age,
                        gender,
                        bloodGroup,
                        city,
                        lastDonationDate,
                        address,
                        availability,
                        consent
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    dFeedback.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Registered successfully as a voluntary blood donor.';
                    dFeedback.className = 'form-feedback success';
                    donorForm.reset();
                    if (typeof window.donorDropdownReset === 'function') {
                        window.donorDropdownReset();
                    }
                    showSuccessToast("Thank you for registering as a blood donor!");
                } else {
                    throw new Error(result.error || 'Failed to register as donor.');
                }
            } catch (err) {
                const userMsg = (err.message && (err.message.includes('buffering') || err.message.includes('Server error')))
                    ? 'Database is unavailable. Please try again later.'
                    : (err.message || 'Something went wrong. Please try again.');
                dFeedback.innerHTML = `<i class="fas fa-times-circle"></i> ${userMsg}`;
                dFeedback.className = 'form-feedback error';
                showErrorToast(userMsg);
            } finally {
                dSubmitBtn.disabled = false;
                setTimeout(() => {
                    dFeedback.textContent = '';
                    dFeedback.className = 'form-feedback';
                }, 5000);
            }
        });
    }

    // 6. Dynamic Contact Details Loader
    fetch("/api/stats")
        .then(res => res.json())
        .then(data => {
            if (data) {
                // Update footer/contact paragraphs containing direct icons
                document.querySelectorAll("p").forEach(p => {
                    const icon = p.querySelector("i");
                    if (icon) {
                        if (icon.classList.contains("fa-map-marker-alt")) {
                            p.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${data.address || 'Coimbatore, Tamil Nadu, India'}`;
                        } else if (icon.classList.contains("fa-phone-alt")) {
                            p.innerHTML = `<i class="fas fa-phone-alt"></i> ${data.phone || '+91 6385842829'}`;
                        } else if (icon.classList.contains("fa-envelope")) {
                            p.innerHTML = `<i class="fas fa-envelope"></i> ${data.email || 'sarvhamhelp@gmail.com'}`;
                        }
                    }
                });

                // Update Contact page specific cards
                document.querySelectorAll(".contact-info-card").forEach(card => {
                    const icon = card.querySelector(".card-icon i");
                    const p = card.querySelector("p");
                    if (icon && p) {
                        if (icon.classList.contains("fa-map-marker-alt")) {
                            p.textContent = data.address || 'Coimbatore, Tamil Nadu, India';
                        } else if (icon.classList.contains("fa-phone-alt")) {
                            p.textContent = data.phone || '+91 6385842829';
                            if (card.tagName === "A") {
                                card.setAttribute("href", `tel:${(data.phone || '+916385842829').replace(/[^\d+]/g, "")}`);
                            }
                        } else if (icon.classList.contains("fa-envelope")) {
                            p.textContent = data.email || 'sarvhamhelp@gmail.com';
                            if (card.tagName === "A") {
                                card.setAttribute("href", `mailto:${data.email || 'sarvhamhelp@gmail.com'}`);
                            }
                        }
                    }
                });
            }
        })
        .catch(err => console.error("Failed to load dynamic contact details:", err));
});
