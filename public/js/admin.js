document.addEventListener("DOMContentLoaded", function () {
    
    // Core Elements
    const loginContainer = document.getElementById("login-container");
    const dashboardContainer = document.getElementById("dashboard-container");
    const loginForm = document.getElementById("login-form");
    const loginError = document.getElementById("login-error");
    const logoutBtn = document.getElementById("logout-btn");
    
    // Tab Elements
    const tabSections = document.querySelectorAll(".tab-section");
    const menuItems = document.querySelectorAll(".menu-item");
    const workspaceTitle = document.getElementById("workspace-title");
    const workspaceSubtitle = document.getElementById("workspace-subtitle");

    // Stat Elements
    const statContacts = document.getElementById("stat-contacts-count");
    const statVolunteers = document.getElementById("stat-volunteers-count");
    const statGallery = document.getElementById("stat-gallery-count");
    
    // Modals
    const volunteerModal = document.getElementById("volunteer-modal");
    const closeVolModalBtn = document.getElementById("close-volunteer-modal");
    const closeVolModalBtn2 = document.getElementById("close-volunteer-modal-btn");
    const volModalContent = document.getElementById("volunteer-modal-content");
    
    const contactModal = document.getElementById("contact-message-modal");
    const closeContactModalBtn = document.getElementById("close-contact-modal");
    const closeContactModalBtn2 = document.getElementById("close-contact-modal-btn");
    const contactModalName = document.getElementById("contact-modal-name");
    const contactModalDetails = document.getElementById("contact-modal-details");
    const contactModalBody = document.getElementById("contact-modal-body");
    
    const galleryModal = document.getElementById("gallery-modal");
    const openGalModalBtn = document.getElementById("open-add-image-modal");
    const closeGalModalBtn = document.getElementById("close-gallery-modal");
    const cancelGalModalBtn = document.getElementById("cancel-gallery-modal");
    const galleryForm = document.getElementById("gallery-form");
    
    // Live Image Preview elements
    const imgUrlInput = document.getElementById("img-url");
    const imgPreview = document.getElementById("img-preview");
    const imgPreviewPlaceholder = document.getElementById("img-preview-placeholder");

    // Local state variables
    let token = localStorage.getItem("sarvham_admin_token") || null;
    let contactsList = [];
    let volunteersList = [];
    let galleryList = [];

    // Initialize application state
    if (token) {
        showDashboard();
    } else {
        showLogin();
    }

    // ==================== AUTH SYSTEM FLOWS ====================
    
    function showLogin() {
        token = null;
        localStorage.removeItem("sarvham_admin_token");
        dashboardContainer.style.display = "none";
        loginContainer.style.display = "flex";
        loginError.textContent = "";
        loginForm.reset();
    }

    function showDashboard() {
        loginContainer.style.display = "none";
        dashboardContainer.style.display = "flex";
        initializeDashboardData();
    }

    // Login Form Submit Handler
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        loginError.textContent = "";
        
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const authBtn = loginForm.querySelector("button");

        if (!username || !password) {
            loginError.textContent = "Please fill out all credentials.";
            return;
        }

        authBtn.disabled = true;
        authBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            
            if (response.ok) {
                token = result.token;
                localStorage.setItem("sarvham_admin_token", token);
                showDashboard();
            } else {
                loginError.textContent = result.error || "Authentication failed.";
            }
        } catch (err) {
            console.error("Login request error:", err);
            loginError.textContent = "Network error. Please try again later.";
        } finally {
            authBtn.disabled = false;
            authBtn.innerHTML = '<span class="btn-text">Authenticate</span> <i class="fas fa-fingerprint"></i>';
        }
    });

    // Logout Handler
    logoutBtn.addEventListener("click", function () {
        if (confirm("Are you sure you want to log out of the administration console?")) {
            showLogin();
        }
    });

    // Handle session expiry on 401s
    function handleApiError(err, responseStatus) {
        console.error("API Fetch error:", err);
        if (responseStatus === 401) {
            alert("Your security token has expired or is invalid. Please log in again.");
            showLogin();
        } else {
            showToast("Server request failed. Please check backend status.", "error");
        }
    }

    // ==================== TABS SYSTEM FLOWS ====================

    menuItems.forEach(item => {
        item.addEventListener("click", function () {
            const tabName = this.getAttribute("data-tab");
            
            // Toggle active menu class
            menuItems.forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
            
            // Toggle active section class
            tabSections.forEach(section => section.classList.remove("active"));
            document.getElementById(`tab-${tabName}`).classList.add("active");

            // Update Header titles dynamically
            updateWorkspaceTitles(tabName);
        });
    });

    function updateWorkspaceTitles(tab) {
        switch (tab) {
            case "overview":
                workspaceTitle.textContent = "Overview Dashboard";
                workspaceSubtitle.textContent = "Welcome back! Here is what is happening today.";
                fetchCounters(); // Refresh stats
                break;
            case "contacts":
                workspaceTitle.textContent = "Contact Queries";
                workspaceSubtitle.textContent = "View and manage feedback requests submitted by the public.";
                loadContacts();
                break;
            case "volunteers":
                workspaceTitle.textContent = "Volunteer Registrations";
                workspaceSubtitle.textContent = "Process applications submitted to join the Sarvamates family.";
                loadVolunteers();
                break;
            case "gallery":
                workspaceTitle.textContent = "Gallery Manager";
                workspaceSubtitle.textContent = "Add, preview, or remove visual moment assets on the homepage.";
                loadGallery();
                break;
        }
    }

    // ==================== DASHBOARD LOAD & CORE FETCHES ====================

    function initializeDashboardData() {
        // Trigger overview stats fetch first
        fetchCounters();
        
        // Populate standard table arrays in background
        loadContacts(true);
        loadVolunteers(true);
        loadGallery(true);
    }

    // Overview counters fetch
    async function fetchCounters() {
        if (!token) return;

        try {
            // Fetch contacts
            let contactsRes = await fetch("/api/contact", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (contactsRes.status === 401) { showLogin(); return; }
            let contacts = await contactsRes.json();
            statContacts.textContent = Array.isArray(contacts) ? contacts.length : 0;

            // Fetch volunteers
            let volunteersRes = await fetch("/api/join", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            let volunteers = await volunteersRes.json();
            statVolunteers.textContent = Array.isArray(volunteers) ? volunteers.length : 0;

            // Fetch gallery
            let galleryRes = await fetch("/api/gallery");
            let gallery = await galleryRes.json();
            statGallery.textContent = Array.isArray(gallery) ? gallery.length : 0;

        } catch (err) {
            console.error("Failed to load overview counts:", err);
            statContacts.textContent = 0;
            statVolunteers.textContent = 0;
            statGallery.textContent = 0;
        }
    }

    // ==================== CONTACT QUERIES HANDLING ====================

    async function loadContacts(silent = false) {
        if (!token) return;
        const tbody = document.getElementById("contacts-tbody");
        
        if (!silent) {
            tbody.innerHTML = `<tr><td colspan="6" class="table-loader-row"><i class="fas fa-spinner"></i><p>Loading messages...</p></td></tr>`;
        }

        try {
            const res = await fetch("/api/contact", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.status === 401) { showLogin(); return; }
            contactsList = await res.json();
            renderContacts(contactsList);
        } catch (err) {
            handleApiError(err);
        }
    }

    function renderContacts(data) {
        const tbody = document.getElementById("contacts-tbody");
        tbody.innerHTML = "";

        if (!Array.isArray(data)) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger" style="padding:40px; font-weight:700;"><i class="fas fa-triangle-exclamation" style="margin-right:8px;"></i>Database Connection Error: Ensure MONGO_URI is set on your server.</td></tr>`;
            return;
        }

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding:40px;">No contact inquiries found.</td></tr>`;
            return;
        }

        data.forEach(item => {
            const formattedDate = new Date(item.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="font-weight:700;">${escapeHTML(item.name)}</td>
                <td><a href="mailto:${escapeHTML(item.email)}" style="color:var(--color-orange); text-decoration:none;">${escapeHTML(item.email)}</a></td>
                <td><a href="tel:${escapeHTML(item.phone)}" style="color:var(--text-primary); text-decoration:none;">${escapeHTML(item.phone)}</a></td>
                <td title="${escapeHTML(item.message)}">${escapeHTML(item.message)}</td>
                <td>${formattedDate}</td>
                <td class="text-center">
                    <div class="action-btns">
                        <button class="action-btn btn-view view-contact-btn" 
                                data-msg="${escapeHTML(item.message)}" 
                                data-name="${escapeHTML(item.name)}" 
                                data-email="${escapeHTML(item.email)}"
                                data-phone="${escapeHTML(item.phone)}"
                                data-date="${formattedDate}"
                                title="Read Message">
                            <i class="fas fa-comment-dots"></i>
                        </button>
                        <button class="action-btn btn-delete delete-contact-btn" data-id="${item._id}" title="Delete Query">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Attach dynamic row actions
        document.querySelectorAll(".view-contact-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const name = this.getAttribute("data-name");
                const email = this.getAttribute("data-email");
                const phone = this.getAttribute("data-phone");
                const date = this.getAttribute("data-date");
                const msg = this.getAttribute("data-msg");
                showContactModal(name, email, phone, date, msg);
            });
        });

        document.querySelectorAll(".delete-contact-btn").forEach(btn => {
            btn.addEventListener("click", async function () {
                const id = this.getAttribute("data-id");
                if (confirm("Are you sure you want to permanently delete this contact query?")) {
                    await deleteContact(id);
                }
            });
        });
    }

    async function deleteContact(id) {
        try {
            const res = await fetch(`/api/contact/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                showToast("Contact query deleted successfully.", "success");
                loadContacts();
                fetchCounters();
            } else {
                const result = await res.json();
                showToast(result.error || "Failed to delete query.", "error");
            }
        } catch (err) {
            handleApiError(err);
        }
    }

    // Dynamic Search Contacts
    document.getElementById("search-contacts").addEventListener("input", function (e) {
        const query = e.target.value.toLowerCase().trim();
        const filtered = contactsList.filter(item => 
            item.name.toLowerCase().includes(query) ||
            item.email.toLowerCase().includes(query) ||
            item.phone.includes(query) ||
            item.message.toLowerCase().includes(query)
        );
        renderContacts(filtered);
    });


    // ==================== VOLUNTEERS APPLICATIONS HANDLING ====================

    async function loadVolunteers(silent = false) {
        if (!token) return;
        const tbody = document.getElementById("volunteers-tbody");
        
        if (!silent) {
            tbody.innerHTML = `<tr><td colspan="8" class="table-loader-row"><i class="fas fa-spinner"></i><p>Loading applications...</p></td></tr>`;
        }

        try {
            const res = await fetch("/api/join", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.status === 401) { showLogin(); return; }
            volunteersList = await res.json();
            renderVolunteers(volunteersList);
        } catch (err) {
            handleApiError(err);
        }
    }

    function renderVolunteers(data) {
        const tbody = document.getElementById("volunteers-tbody");
        tbody.innerHTML = "";

        if (!Array.isArray(data)) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger" style="padding:40px; font-weight:700;"><i class="fas fa-triangle-exclamation" style="margin-right:8px;"></i>Database Connection Error: Ensure MONGO_URI is set on your server.</td></tr>`;
            return;
        }

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding:40px;">No volunteer applications found.</td></tr>`;
            return;
        }

        data.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="font-weight:700;">${escapeHTML(item.fullName)}</td>
                <td><span class="badge-blood">${escapeHTML(item.bloodGroup)}</span></td>
                <td><a href="mailto:${escapeHTML(item.email)}" style="color:var(--color-orange); text-decoration:none;">${escapeHTML(item.email)}</a></td>
                <td><a href="tel:${escapeHTML(item.phone)}" style="color:var(--text-primary); text-decoration:none;">${escapeHTML(item.phone)}</a></td>
                <td>
                    <a href="https://wa.me/${escapeHTML(item.whatsapp)}" target="_blank" style="color:var(--color-green); text-decoration:none; font-weight:bold;">
                        <i class="fab fa-whatsapp"></i> Chat
                    </a>
                </td>
                <td>${escapeHTML(item.district)}, ${escapeHTML(item.state)}</td>
                <td class="text-center">
                    <button class="action-btn btn-view view-dossier-btn" data-id="${item._id}">
                        <i class="fas fa-user-tag"></i>
                    </button>
                </td>
                <td class="text-center">
                    <button class="action-btn btn-delete delete-volunteer-btn" data-id="${item._id}">
                        <i class="fas fa-trash-can"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Attach Actions
        document.querySelectorAll(".view-dossier-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const id = this.getAttribute("data-id");
                const profile = volunteersList.find(v => v._id === id);
                if (profile) {
                    showDossierModal(profile);
                }
            });
        });

        document.querySelectorAll(".delete-volunteer-btn").forEach(btn => {
            btn.addEventListener("click", async function () {
                const id = this.getAttribute("data-id");
                if (confirm("Are you sure you want to delete this volunteer registration dossier?")) {
                    await deleteVolunteer(id);
                }
            });
        });
    }

    async function deleteVolunteer(id) {
        try {
            const res = await fetch(`/api/join/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                showToast("Volunteer dossier removed.", "success");
                loadVolunteers();
                fetchCounters();
            } else {
                const result = await res.json();
                showToast(result.error || "Failed to remove volunteer record.", "error");
            }
        } catch (err) {
            handleApiError(err);
        }
    }

    // Dynamic Search Volunteers
    document.getElementById("search-volunteers").addEventListener("input", function (e) {
        const query = e.target.value.toLowerCase().trim();
        const filtered = volunteersList.filter(item => 
            item.fullName.toLowerCase().includes(query) ||
            item.fatherName.toLowerCase().includes(query) ||
            item.email.toLowerCase().includes(query) ||
            item.phone.includes(query) ||
            item.bloodGroup.toLowerCase().includes(query) ||
            item.district.toLowerCase().includes(query) ||
            item.state.toLowerCase().includes(query)
        );
        renderVolunteers(filtered);
    });

    // Dossier Modal Generator
    function showDossierModal(v) {
        const formattedDate = new Date(v.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

        const formattedAadhar = v.aadhar.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");

        volModalContent.innerHTML = `
            <div class="dossier-grid">
                <!-- Section 1: Personal Details -->
                <div class="dossier-section">
                    <h4>Personal Profile</h4>
                    <div class="dossier-field">
                        <span class="d-lbl">Full Name:</span>
                        <span class="d-val">${escapeHTML(v.fullName)}</span>
                    </div>
                    <div class="dossier-field">
                        <span class="d-lbl">Father's Name:</span>
                        <span class="d-val">${escapeHTML(v.fatherName)}</span>
                    </div>
                    <div class="dossier-field">
                        <span class="d-lbl">Date of Birth:</span>
                        <span class="d-val">${escapeHTML(v.dob)}</span>
                    </div>
                    <div class="dossier-field">
                        <span class="d-lbl">Gender:</span>
                        <span class="d-val">${escapeHTML(v.gender)}</span>
                    </div>
                    <div class="dossier-field">
                        <span class="d-lbl">Blood Group:</span>
                        <span class="d-val"><span class="badge-blood">${escapeHTML(v.bloodGroup)}</span></span>
                    </div>
                    <div class="dossier-field">
                        <span class="d-lbl">Aadhar ID:</span>
                        <span class="d-val" style="font-family:monospace; letter-spacing:0.5px;">${escapeHTML(formattedAadhar)}</span>
                    </div>
                </div>

                <!-- Section 2: Contact Info -->
                <div class="dossier-section">
                    <h4>Contact Channels</h4>
                    <div class="dossier-field">
                        <span class="d-lbl">Email Address:</span>
                        <span class="d-val"><a href="mailto:${escapeHTML(v.email)}" style="color:var(--color-orange);">${escapeHTML(v.email)}</a></span>
                    </div>
                    <div class="dossier-field">
                        <span class="d-lbl">Phone Number:</span>
                        <span class="d-val"><a href="tel:${escapeHTML(v.phone)}" style="color:white; text-decoration:none;">${escapeHTML(v.phone)}</a></span>
                    </div>
                    <div class="dossier-field">
                        <span class="d-lbl">WhatsApp:</span>
                        <span class="d-val"><a href="https://wa.me/${escapeHTML(v.whatsapp)}" target="_blank" style="color:var(--color-green); font-weight:bold;"><i class="fab fa-whatsapp"></i> Native Chat</a></span>
                    </div>
                    <div class="dossier-field">
                        <span class="d-lbl">Joined Timestamp:</span>
                        <span class="d-val" style="font-size:0.8rem; color:var(--text-secondary);">${formattedDate}</span>
                    </div>
                </div>

                <!-- Section 3: Residential Address -->
                <div class="dossier-section dossier-full-section">
                    <h4>Residential Address</h4>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px;">
                        <div class="dossier-field">
                            <span class="d-lbl">Street:</span>
                            <span class="d-val">${escapeHTML(v.street)}</span>
                        </div>
                        <div class="dossier-field">
                            <span class="d-lbl">Area/Place:</span>
                            <span class="d-val">${escapeHTML(v.place)}</span>
                        </div>
                        <div class="dossier-field">
                            <span class="d-lbl">District:</span>
                            <span class="d-val">${escapeHTML(v.district)}</span>
                        </div>
                        <div class="dossier-field">
                            <span class="d-lbl">Pincode:</span>
                            <span class="d-val" style="font-family:monospace;">${escapeHTML(v.pincode)}</span>
                        </div>
                        <div class="dossier-field" style="grid-column: span 2;">
                            <span class="d-lbl">State:</span>
                            <span class="d-val">${escapeHTML(v.state)}</span>
                        </div>
                    </div>
                </div>

                <!-- Section 4: Statement of Intent -->
                <div class="dossier-section dossier-full-section">
                    <h4>Why do you want to join Sarvham Foundation?</h4>
                    <div class="dossier-essay">${escapeHTML(v.message)}</div>
                </div>
            </div>
        `;
        volunteerModal.style.display = "flex";
    }

    // Modal Close Triggers
    closeVolModalBtn.addEventListener("click", () => volunteerModal.style.display = "none");
    closeVolModalBtn2.addEventListener("click", () => volunteerModal.style.display = "none");
    volunteerModal.addEventListener("click", (e) => {
        if (e.target === volunteerModal) volunteerModal.style.display = "none";
    });

    // Contact Modal Close Triggers
    closeContactModalBtn.addEventListener("click", () => contactModal.style.display = "none");
    closeContactModalBtn2.addEventListener("click", () => contactModal.style.display = "none");
    contactModal.addEventListener("click", (e) => {
        if (e.target === contactModal) contactModal.style.display = "none";
    });

    function showContactModal(name, email, phone, date, msg) {
        contactModalName.textContent = `Inquiry from ${name}`;
        contactModalDetails.innerHTML = `
            <div class="dossier-field">
                <span class="d-lbl">Email Address:</span>
                <span class="d-val"><a href="mailto:${escapeHTML(email)}" style="color:var(--color-orange);">${escapeHTML(email)}</a></span>
            </div>
            <div class="dossier-field">
                <span class="d-lbl">Phone Number:</span>
                <span class="d-val"><a href="tel:${escapeHTML(phone)}" style="color:white; text-decoration:none;">${escapeHTML(phone)}</a></span>
            </div>
            <div class="dossier-field">
                <span class="d-lbl">Received Date:</span>
                <span class="d-val" style="font-size:0.8rem; color:var(--text-secondary);">${escapeHTML(date)}</span>
            </div>
        `;
        contactModalBody.textContent = msg;
        contactModal.style.display = "flex";
    }


    // ==================== GALLERY MANAGEMENT HANDLING ====================

    async function loadGallery(silent = false) {
        const grid = document.getElementById("gallery-manager-grid");
        
        if (!silent) {
            grid.innerHTML = `<div class="table-loader-row" style="grid-column:1/-1;"><i class="fas fa-spinner"></i><p>Loading gallery items...</p></div>`;
        }

        try {
            const res = await fetch("/api/gallery");
            galleryList = await res.json();
            renderGallery(galleryList);
        } catch (err) {
            console.error("Gallery fetch failed:", err);
            grid.innerHTML = `<div class="text-center text-muted" style="grid-column:1/-1; padding:40px;">Failed to load gallery items.</div>`;
        }
    }

    function renderGallery(data) {
        const grid = document.getElementById("gallery-manager-grid");
        grid.innerHTML = "";

        if (!Array.isArray(data)) {
            grid.innerHTML = `<div class="text-center text-danger" style="grid-column:1/-1; padding:40px; font-weight:700;"><i class="fas fa-triangle-exclamation" style="margin-right:8px;"></i>Database Connection Error: Ensure MONGO_URI is set on your server.</div>`;
            return;
        }

        if (data.length === 0) {
            grid.innerHTML = `<div class="text-center text-muted" style="grid-column:1/-1; padding:40px;">No gallery assets present in database.</div>`;
            return;
        }

        data.forEach(item => {
            const card = document.createElement("div");
            card.className = "gallery-admin-card";
            card.innerHTML = `
                <div class="card-img-wrapper">
                    <img src="${escapeHTML(item.imageUrl)}" alt="${escapeHTML(item.title)}" onerror="this.src='https://placehold.co/400x300?text=Invalid+Image+URL';">
                    <div class="card-delete-overlay">
                        <button class="action-btn btn-delete delete-gallery-btn" data-id="${item._id}" title="Remove Image">
                            <i class="fas fa-trash-can"></i>
                        </button>
                    </div>
                </div>
                <div class="gallery-info">
                    <h4>${escapeHTML(item.title)}</h4>
                    <p>${escapeHTML(item.description || "No description provided.")}</p>
                </div>
            `;
            grid.appendChild(card);
        });

        // Attach action click events
        document.querySelectorAll(".delete-gallery-btn").forEach(btn => {
            btn.addEventListener("click", async function (e) {
                e.stopPropagation();
                const id = this.getAttribute("data-id");
                if (confirm("Are you sure you want to permanently remove this image from the gallery?")) {
                    await deleteGalleryItem(id);
                }
            });
        });
    }

    async function deleteGalleryItem(id) {
        try {
            const res = await fetch(`/api/gallery/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                showToast("Gallery asset deleted successfully.", "success");
                loadGallery();
                fetchCounters();
            } else {
                const result = await res.json();
                showToast(result.error || "Failed to delete gallery image.", "error");
            }
        } catch (err) {
            handleApiError(err);
        }
    }

    // Modal UI flows for Gallery creation
    openGalModalBtn.addEventListener("click", () => {
        galleryModal.style.display = "flex";
        galleryForm.reset();
        resetImagePreview();
    });

    function closeGalleryModalWindow() {
        galleryModal.style.display = "none";
        galleryForm.reset();
        resetImagePreview();
    }

    closeGalModalBtn.addEventListener("click", closeGalleryModalWindow);
    cancelGalModalBtn.addEventListener("click", closeGalleryModalWindow);
    galleryModal.addEventListener("click", (e) => {
        if (e.target === galleryModal) closeGalleryModalWindow();
    });

    // Dynamic Live URL Preview listener
    imgUrlInput.addEventListener("input", function (e) {
        const url = e.target.value.trim();
        if (url) {
            imgPreview.src = url;
            imgPreview.style.display = "block";
            imgPreviewPlaceholder.style.display = "none";
        } else {
            resetImagePreview();
        }
    });

    imgPreview.addEventListener("error", function () {
        imgPreview.style.display = "none";
        imgPreviewPlaceholder.style.display = "flex";
        imgPreviewPlaceholder.innerHTML = `<i class="fas fa-triangle-exclamation" style="color:var(--color-red); font-size:2.2rem; margin-bottom:8px;"></i><p style="color:var(--color-red);">Unable to resolve Image path. Please enter a valid URL.</p>`;
    });

    function resetImagePreview() {
        imgPreview.src = "";
        imgPreview.style.display = "none";
        imgPreviewPlaceholder.style.display = "flex";
        imgPreviewPlaceholder.innerHTML = `<i class="fas fa-image"></i><p>Insert a valid Image URL above to see a preview here.</p>`;
    }

    // Modal submit action
    galleryForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        
        const title = document.getElementById("img-title").value.trim();
        const imageUrl = imgUrlInput.value.trim();
        const description = document.getElementById("img-desc").value.trim();
        const submitBtn = galleryForm.querySelector("button[type='submit']");

        if (!title || !imageUrl) {
            showToast("Required fields are missing.", "error");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Creating...";

        try {
            const res = await fetch("/api/gallery", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ title, imageUrl, description })
            });

            if (res.ok) {
                showToast("Gallery asset saved successfully!", "success");
                closeGalleryModalWindow();
                loadGallery();
                fetchCounters();
            } else {
                const result = await res.json();
                showToast(result.error || "Failed to create gallery asset.", "error");
            }
        } catch (err) {
            handleApiError(err);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Create Asset";
        }
    });


    // ==================== CORE COMMON UTILITIES ====================

    // Clean escaping for protection
    function escapeHTML(str) {
        if (!str) return "";
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // Toast alert triggers
    function showToast(message, type = "success") {
        const toast = document.createElement("div");
        toast.style.position = "fixed";
        toast.style.bottom = "30px";
        toast.style.right = "30px";
        toast.style.backgroundColor = type === "success" ? "var(--color-green)" : "var(--color-red)";
        toast.style.color = "white";
        toast.style.padding = "14px 28px";
        toast.style.borderRadius = "12px";
        toast.style.boxShadow = "0 10px 25px rgba(0,0,0,0.3)";
        toast.style.zIndex = "10001";
        toast.style.fontWeight = "700";
        toast.style.fontFamily = "var(--font-main)";
        toast.style.animation = "slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards";
        
        let icon = type === "success" ? "circle-check" : "circle-exclamation";
        toast.innerHTML = `<i class="fas fa-${icon}" style="margin-right:10px;"></i> ${message}`;
        
        document.body.appendChild(toast);
        
        // Remove toast
        setTimeout(() => {
            toast.style.animation = "slideOutRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards";
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }

    // Inject Toast animations if they don't exist
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        @keyframes slideInRight {
            from { opacity: 0; transform: translateX(50px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutRight {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(50px); }
        }
    `;
    document.head.appendChild(styleSheet);
});
