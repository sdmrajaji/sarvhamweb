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
    
    // Drag & Drop Elements
    const dropZone = document.getElementById("image-drop-zone");
    const fileInput = document.getElementById("file-upload-input");
    const removeSelectedImgBtn = document.getElementById("remove-selected-img-btn");
    let uploadedImageBase64 = null;
    
    // Stats Form Elements
    const statsForm = document.getElementById("stats-counters-form");
    const statsMealsInput = document.getElementById("stats-meals-input");
    const statsTreesInput = document.getElementById("stats-trees-input");
    const statsBloodInput = document.getElementById("stats-blood-input");

    // Contact Info Form Elements
    const contactInfoForm = document.getElementById("contact-info-form");
    const contactAddressInput = document.getElementById("contact-address-input");
    const contactPhoneInput = document.getElementById("contact-phone-input");
    const contactEmailInput = document.getElementById("contact-email-input");

    // WhatsApp Settings Elements
    const whatsappSettingsForm = document.getElementById("whatsapp-settings-form");
    const whatsappPhoneInput = document.getElementById("whatsapp-phone-input");
    const whatsappTextInput = document.getElementById("whatsapp-text-input");

    // Local state variables
    let token = localStorage.getItem("sarvham_admin_token") || null;
    let contactsList = [];
    let volunteersList = [];
    let galleryList = [];
    let bloodList = [];
    let activeVolunteerId = null;
    let activeBloodId = null;

    // Blood Modal elements
    const bloodModal = document.getElementById("blood-modal");
    const closeBloodModalBtn = document.getElementById("close-blood-modal");
    const closeBloodModalBtn2 = document.getElementById("close-blood-modal-btn");
    const bloodModalContent = document.getElementById("blood-modal-content");
    const saveBloodProfileBtn = document.getElementById("save-blood-profile-btn");

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
            case "blood":
                workspaceTitle.textContent = "Blood Inquiries";
                workspaceSubtitle.textContent = "Coordinate and verify urgent emergency blood requests.";
                loadBloodEnquiries();
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
        loadStatsCounters();
        
        // Populate standard table arrays in background
        loadContacts(true);
        loadBloodEnquiries(true);
        loadVolunteers(true);
        loadGallery(true);
    }

    async function loadStatsCounters() {
        if (!token) return;
        try {
            const res = await fetch("/api/stats");
            const data = await res.json();
            if (data) {
                statsMealsInput.value = data.mealsDonated || "5,000+";
                statsTreesInput.value = data.treesPlanted || "500+";
                statsBloodInput.value = data.bloodBridges || "400+";
                
                if (contactAddressInput) contactAddressInput.value = data.address || "Coimbatore, Tamil Nadu, India";
                if (contactPhoneInput) contactPhoneInput.value = data.phone || "+91 6385842829";
                if (contactEmailInput) contactEmailInput.value = data.email || "sarvhamhelp@gmail.com";
                if (whatsappPhoneInput) whatsappPhoneInput.value = data.whatsappPhone || "916385842829";
                if (whatsappTextInput) whatsappTextInput.value = data.whatsappText || "Hello Sarvham Foundation, I have successfully submitted my volunteer application. Looking forward to joining!";
            }
        } catch (err) {
            console.error("Failed to load counters stats:", err);
        }
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

            // Fetch blood enquiries
            let bloodRes = await fetch("/api/blood-enquiry", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            let bloodReqs = await bloodRes.json();
            const statBloodEl = document.getElementById("stat-blood-count");
            if (statBloodEl) statBloodEl.textContent = Array.isArray(bloodReqs) ? bloodReqs.length : 0;

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
            applyContactsFiltersAndSort();
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

    // Dynamic Filter & Sort Handler for Contacts
    function applyContactsFiltersAndSort() {
        const searchInput = document.getElementById("search-contacts");
        const sortInput = document.getElementById("sort-contacts");
        if (!searchInput || !sortInput) return;

        const query = searchInput.value.toLowerCase().trim();
        const sortVal = sortInput.value;
        
        let filtered = contactsList.filter(item => 
            item.name.toLowerCase().includes(query) ||
            item.email.toLowerCase().includes(query) ||
            item.phone.includes(query) ||
            item.message.toLowerCase().includes(query)
        );

        // Apply Sorting
        if (sortVal === "newest") {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortVal === "oldest") {
            filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortVal === "name-asc") {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortVal === "name-desc") {
            filtered.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sortVal === "email-asc") {
            filtered.sort((a, b) => a.email.localeCompare(b.email));
        } else if (sortVal === "email-desc") {
            filtered.sort((a, b) => b.email.localeCompare(a.email));
        }

        renderContacts(filtered);
    }

    // Dynamic Search & Sort Listeners for Contacts
    const searchContactsEl = document.getElementById("search-contacts");
    const sortContactsEl = document.getElementById("sort-contacts");
    if (searchContactsEl) searchContactsEl.addEventListener("input", applyContactsFiltersAndSort);
    if (sortContactsEl) sortContactsEl.addEventListener("change", applyContactsFiltersAndSort);


    // ==================== BLOOD INQUIRIES HANDLING ====================

    async function loadBloodEnquiries(silent = false) {
        if (!token) return;
        const tbody = document.getElementById("blood-tbody");
        
        if (!silent) {
            tbody.innerHTML = `<tr><td colspan="8" class="table-loader-row"><i class="fas fa-spinner"></i><p>Loading blood inquiries...</p></td></tr>`;
        }

        try {
            const res = await fetch("/api/blood-enquiry", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.status === 401) { showLogin(); return; }
            bloodList = await res.json();
            applyBloodFiltersAndSort();
        } catch (err) {
            handleApiError(err);
        }
    }

    function renderBloodEnquiries(data) {
        const tbody = document.getElementById("blood-tbody");
        tbody.innerHTML = "";

        if (!Array.isArray(data)) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger" style="padding:40px; font-weight:700;"><i class="fas fa-triangle-exclamation" style="margin-right:8px;"></i>Database Connection Error: Ensure server is running.</td></tr>`;
            return;
        }

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding:40px;">No blood inquiries found.</td></tr>`;
            return;
        }

        data.forEach(item => {
            let formattedDate = "N/A";
            try {
                if (item.requiredDate) {
                    const d = new Date(item.requiredDate);
                    if (!isNaN(d.getTime())) {
                        formattedDate = d.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        });
                    }
                }
            } catch (dateErr) {
                console.error("Date formatting error for item:", item, dateErr);
            }

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="font-weight:700;">${escapeHTML(item.patientName)}</td>
                <td>
                    <span style="display:block; font-weight:600; color:var(--text-primary);">${escapeHTML(item.contactName)}</span>
                    <a href="tel:${escapeHTML(item.phone)}" style="font-size:0.85rem; color:var(--text-secondary); text-decoration:none;">${escapeHTML(item.phone)}</a>
                </td>
                <td><span class="badge-blood">${escapeHTML(item.bloodGroup)}</span></td>
                <td style="font-weight:700; color:var(--color-orange);">${escapeHTML(item.unitsRequired)} Units</td>
                <td>${formattedDate}</td>
                <td>
                    <span style="display:block; font-weight:600;">${escapeHTML(item.hospitalName)}</span>
                    <span style="font-size:0.85rem; color:var(--text-secondary);">${escapeHTML(item.hospitalLocation)}</span>
                </td>
                <td class="text-center">
                    <span class="badge-status status-${item.status || 'pending'}">${escapeHTML(item.status ? (item.status === 'verified' ? 'Verified' : item.status === 'resolved' ? 'Resolved' : item.status === 'cancelled' ? 'Cancelled' : 'Pending') : 'Pending')}</span>
                </td>
                <td class="text-center">
                    <div class="action-btns">
                        <button class="action-btn btn-view view-blood-btn" data-id="${item._id}" title="View Details">
                            <i class="fas fa-comment-medical"></i>
                        </button>
                        <button class="action-btn btn-delete delete-blood-btn" data-id="${item._id}" title="Delete request">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Attach actions
        document.querySelectorAll(".view-blood-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const id = this.getAttribute("data-id");
                const profile = bloodList.find(b => b._id === id);
                if (profile) {
                    showBloodDossierModal(profile);
                }
            });
        });

        document.querySelectorAll(".delete-blood-btn").forEach(btn => {
            btn.addEventListener("click", async function () {
                const id = this.getAttribute("data-id");
                if (confirm("Are you sure you want to permanently delete this blood enquiry request?")) {
                    await deleteBloodEnquiry(id);
                }
            });
        });
    }

    async function deleteBloodEnquiry(id) {
        try {
            const res = await fetch(`/api/blood-enquiry/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                showToast("Blood enquiry deleted successfully.", "success");
                loadBloodEnquiries();
                fetchCounters();
            } else {
                const result = await res.json();
                showToast(result.error || "Failed to delete blood enquiry.", "error");
            }
        } catch (err) {
            handleApiError(err);
        }
    }

    function applyBloodFiltersAndSort() {
        const searchInput = document.getElementById("search-blood");
        const sortInput = document.getElementById("sort-blood");
        if (!searchInput || !sortInput) return;

        const query = searchInput.value.toLowerCase().trim();
        const sortVal = sortInput.value;
        
        let filtered = bloodList.filter(item => 
            item.patientName.toLowerCase().includes(query) ||
            item.contactName.toLowerCase().includes(query) ||
            item.bloodGroup.toLowerCase().includes(query) ||
            item.hospitalName.toLowerCase().includes(query) ||
            item.hospitalLocation.toLowerCase().includes(query) ||
            (item.phone || '').includes(query) ||
            (item.message || '').toLowerCase().includes(query) ||
            (item.status || 'pending').toLowerCase().includes(query)
        );

        // Apply Sorting
        if (sortVal === "newest") {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortVal === "oldest") {
            filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortVal === "patient-asc") {
            filtered.sort((a, b) => a.patientName.localeCompare(b.patientName));
        } else if (sortVal === "patient-desc") {
            filtered.sort((a, b) => b.patientName.localeCompare(a.patientName));
        } else if (sortVal === "units-desc") {
            filtered.sort((a, b) => b.unitsRequired - a.unitsRequired);
        } else if (sortVal === "units-asc") {
            filtered.sort((a, b) => a.unitsRequired - b.unitsRequired);
        } else if (sortVal === "status") {
            const statusWeight = { resolved: 1, verified: 2, pending: 3, cancelled: 4 };
            filtered.sort((a, b) => {
                const weightA = statusWeight[a.status || 'pending'] || 3;
                const weightB = statusWeight[b.status || 'pending'] || 3;
                return weightA - weightB;
            });
        }

        renderBloodEnquiries(filtered);
    }

    // Dynamic Search & Sort Listeners for Blood Inquiries
    const searchBloodEl = document.getElementById("search-blood");
    const sortBloodEl = document.getElementById("sort-blood");
    if (searchBloodEl) searchBloodEl.addEventListener("input", applyBloodFiltersAndSort);
    if (sortBloodEl) sortBloodEl.addEventListener("change", applyBloodFiltersAndSort);

    // Refresh Button Handling for Blood
    const refreshBloodBtn = document.getElementById("refresh-blood-btn");
    if (refreshBloodBtn) {
        refreshBloodBtn.addEventListener("click", function () {
            const icon = this.querySelector("i");
            icon.classList.add("fa-spin");
            loadBloodEnquiries().finally(() => {
                setTimeout(() => icon.classList.remove("fa-spin"), 800);
            });
        });
    }

    function showBloodDossierModal(b) {
        activeBloodId = b._id;
        let formattedDate = "N/A";
        try {
            if (b.createdAt) {
                const d = new Date(b.createdAt);
                if (!isNaN(d.getTime())) {
                    formattedDate = d.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    });
                }
            }
        } catch (err) {
            console.error("Date formatting failed for createdAt:", b.createdAt, err);
        }

        let requiredByDate = "";
        try {
            if (b.requiredDate) {
                const d = new Date(b.requiredDate);
                if (!isNaN(d.getTime())) {
                    requiredByDate = d.toISOString().split('T')[0];
                }
            }
        } catch (err) {
            console.error("ISO conversion failed for requiredDate:", b.requiredDate, err);
        }

        bloodModalContent.innerHTML = `
            <div class="dossier-grid">
                <!-- Section 1: Patient & Request Profile -->
                <div class="dossier-section">
                    <h4>Request Profile</h4>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Patient Name:</span>
                            <input type="text" id="edit-blood-patientName" value="${escapeHTML(b.patientName)}" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Required Blood Group:</span>
                            <input type="text" id="edit-blood-group" value="${escapeHTML(b.bloodGroup)}" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Units Required:</span>
                            <input type="number" id="edit-blood-units" value="${b.unitsRequired}" min="1" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Required By Date:</span>
                            <input type="date" id="edit-blood-date" value="${requiredByDate}" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                    </div>
                </div>

                <!-- Section 2: Contact & Status -->
                <div class="dossier-section">
                    <h4>Contact & Coordination</h4>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Contact Person:</span>
                            <input type="text" id="edit-blood-contactName" value="${escapeHTML(b.contactName)}" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Phone Number:</span>
                            <input type="text" id="edit-blood-phone" value="${escapeHTML(b.phone)}" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Email Address:</span>
                            <input type="email" id="edit-blood-email" value="${escapeHTML(b.email)}" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Inquiry Status:</span>
                            <select id="edit-blood-status" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit; cursor: pointer;">
                                <option value="pending" ${b.status === 'pending' || !b.status ? 'selected' : ''}>Pending</option>
                                <option value="verified" ${b.status === 'verified' ? 'selected' : ''}>Verified</option>
                                <option value="resolved" ${b.status === 'resolved' ? 'selected' : ''}>Resolved (Success)</option>
                                <option value="cancelled" ${b.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Section 3: Hospital Information -->
                <div class="dossier-section dossier-full-section">
                    <h4>Clinical Target Location</h4>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px;">
                        <div style="display: flex; flex-direction: column; gap: 4px; grid-column: span 2;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Hospital Name:</span>
                            <input type="text" id="edit-blood-hospitalName" value="${escapeHTML(b.hospitalName)}" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px; grid-column: span 2;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Hospital Location:</span>
                            <input type="text" id="edit-blood-hospitalLocation" value="${escapeHTML(b.hospitalLocation)}" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                    </div>
                </div>

                <!-- Section 4: Clinical Notes -->
                <div class="dossier-section dossier-full-section">
                    <h4>Clinical / Emergency Notes</h4>
                    <textarea id="edit-blood-message" rows="3" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.95rem; font-family: inherit; resize: vertical;">${escapeHTML(b.message || '')}</textarea>
                </div>
            </div>
        `;
        bloodModal.style.display = "flex";
    }


    // ==================== VOLUNTEERS APPLICATIONS HANDLING ====================

    async function loadVolunteers(silent = false) {
        if (!token) return;
        const tbody = document.getElementById("volunteers-tbody");
        
        if (!silent) {
            tbody.innerHTML = `<tr><td colspan="9" class="table-loader-row"><i class="fas fa-spinner"></i><p>Loading applications...</p></td></tr>`;
        }

        try {
            const res = await fetch("/api/join", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.status === 401) { showLogin(); return; }
            volunteersList = await res.json();
            applyFiltersAndSort();
        } catch (err) {
            handleApiError(err);
        }
    }

    function renderVolunteers(data) {
        const tbody = document.getElementById("volunteers-tbody");
        tbody.innerHTML = "";

        if (!Array.isArray(data)) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger" style="padding:40px; font-weight:700;"><i class="fas fa-triangle-exclamation" style="margin-right:8px;"></i>Database Connection Error: Ensure MONGO_URI is set on your server.</td></tr>`;
            return;
        }

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted" style="padding:40px;">No volunteer applications found.</td></tr>`;
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
                    <span class="badge-status status-${item.status || 'pending'}">${escapeHTML(item.status ? (item.status === 'verified' ? 'Verified' : item.status === 'rejected' ? 'Rejected' : 'Pending') : 'Pending')}</span>
                </td>
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

    // Dynamic Filter & Sort Handler
    function applyFiltersAndSort() {
        const query = document.getElementById("search-volunteers").value.toLowerCase().trim();
        const sortVal = document.getElementById("sort-volunteers").value;
        
        let filtered = volunteersList.filter(item => 
            item.fullName.toLowerCase().includes(query) ||
            item.fatherName.toLowerCase().includes(query) ||
            item.email.toLowerCase().includes(query) ||
            item.phone.includes(query) ||
            item.bloodGroup.toLowerCase().includes(query) ||
            item.district.toLowerCase().includes(query) ||
            item.state.toLowerCase().includes(query) ||
            (item.status || "pending").toLowerCase().includes(query)
        );

        // Apply Sorting
        if (sortVal === "newest") {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortVal === "oldest") {
            filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortVal === "name-asc") {
            filtered.sort((a, b) => a.fullName.localeCompare(b.fullName));
        } else if (sortVal === "name-desc") {
            filtered.sort((a, b) => b.fullName.localeCompare(a.fullName));
        } else if (sortVal === "status") {
            const statusWeight = { verified: 1, pending: 2, rejected: 3 };
            filtered.sort((a, b) => {
                const weightA = statusWeight[a.status || 'pending'] || 2;
                const weightB = statusWeight[b.status || 'pending'] || 2;
                return weightA - weightB;
            });
        }

        renderVolunteers(filtered);
    }

    // Dynamic Search & Sort Listeners
    document.getElementById("search-volunteers").addEventListener("input", applyFiltersAndSort);
    document.getElementById("sort-volunteers").addEventListener("change", applyFiltersAndSort);

    // Dossier Modal Generator
    function showDossierModal(v) {
        activeVolunteerId = v._id;
        const formattedDate = new Date(v.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

        volModalContent.innerHTML = `
            <div class="dossier-grid">
                <!-- Section 1: Personal Details -->
                <div class="dossier-section">
                    <h4>Personal Profile</h4>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Full Name:</span>
                            <input type="text" id="edit-vol-fullName" value="${escapeHTML(v.fullName)}" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Father's Name:</span>
                            <input type="text" id="edit-vol-fatherName" value="${escapeHTML(v.fatherName)}" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Date of Birth:</span>
                            <input type="text" id="edit-vol-dob" value="${escapeHTML(v.dob)}" placeholder="DD/MM/YYYY" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Gender:</span>
                            <input type="text" id="edit-vol-gender" value="${escapeHTML(v.gender)}" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Blood Group:</span>
                            <input type="text" id="edit-vol-bloodGroup" value="${escapeHTML(v.bloodGroup)}" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Aadhar ID:</span>
                            <input type="text" id="edit-vol-aadhar" value="${escapeHTML(v.aadhar)}" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                    </div>
                </div>

                <!-- Section 2: Contact Info -->
                <div class="dossier-section">
                    <h4>Contact Channels</h4>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Email Address:</span>
                            <input type="email" id="edit-vol-email" value="${escapeHTML(v.email)}" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Phone Number:</span>
                            <input type="text" id="edit-vol-phone" value="${escapeHTML(v.phone)}" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">WhatsApp:</span>
                            <input type="text" id="edit-vol-whatsapp" value="${escapeHTML(v.whatsapp)}" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px; padding-top: 5px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Application Status:</span>
                            <select id="edit-vol-status" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit; cursor: pointer;">
                                <option value="pending" ${v.status === 'pending' || !v.status ? 'selected' : ''}>Pending</option>
                                <option value="verified" ${v.status === 'verified' ? 'selected' : ''}>Verified (Approved)</option>
                                <option value="rejected" ${v.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                            </select>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px; padding-top: 5px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Joined Timestamp:</span>
                            <span style="font-size: 0.9rem; color: var(--text-secondary); font-weight: 600; padding: 4px 4px;">${formattedDate}</span>
                        </div>
                    </div>
                </div>

                <!-- Section 3: Residential Address -->
                <div class="dossier-section dossier-full-section">
                    <h4>Residential Address</h4>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px;">
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Street:</span>
                            <input type="text" id="edit-vol-street" value="${escapeHTML(v.street)}" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Area/Place:</span>
                            <input type="text" id="edit-vol-place" value="${escapeHTML(v.place)}" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">District:</span>
                            <input type="text" id="edit-vol-district" value="${escapeHTML(v.district)}" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">Pincode:</span>
                            <input type="text" id="edit-vol-pincode" value="${escapeHTML(v.pincode)}" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px; grid-column: span 2;">
                            <span class="d-lbl" style="font-size: 0.8rem; font-weight: 700;">State:</span>
                            <input type="text" id="edit-vol-state" value="${escapeHTML(v.state)}" style="width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; outline: none; font-size: 0.9rem; font-family: inherit;">
                        </div>
                    </div>
                </div>

                <!-- Section 4: Statement of Intent -->
                <div class="dossier-section dossier-full-section">
                    <h4>Why do you want to join Sarvham Foundation?</h4>
                    <div class="dossier-essay" style="background-color: rgba(0,0,0,0.15); border: 1px dashed rgba(255,255,255,0.08); color: var(--text-secondary); cursor: not-allowed; user-select: none;">${escapeHTML(v.message)}</div>
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

    // Save Volunteer Profile Changes
    document.getElementById("save-volunteer-profile-btn").addEventListener("click", async function () {
        if (!activeVolunteerId) return;

        const fullName = document.getElementById("edit-vol-fullName").value.trim();
        const fatherName = document.getElementById("edit-vol-fatherName").value.trim();
        const dob = document.getElementById("edit-vol-dob").value.trim();
        const gender = document.getElementById("edit-vol-gender").value.trim();
        const bloodGroup = document.getElementById("edit-vol-bloodGroup").value.trim();
        const aadhar = document.getElementById("edit-vol-aadhar").value.trim();
        const email = document.getElementById("edit-vol-email").value.trim();
        const phone = document.getElementById("edit-vol-phone").value.trim();
        const whatsapp = document.getElementById("edit-vol-whatsapp").value.trim();
        const street = document.getElementById("edit-vol-street").value.trim();
        const place = document.getElementById("edit-vol-place").value.trim();
        const district = document.getElementById("edit-vol-district").value.trim();
        const pincode = document.getElementById("edit-vol-pincode").value.trim();
        const state = document.getElementById("edit-vol-state").value.trim();
        const status = document.getElementById("edit-vol-status").value;

        if (!fullName || !fatherName || !email || !phone || !whatsapp || !aadhar || !dob || !gender ||
            !bloodGroup || !street || !place || !district || !pincode || !state || !status) {
            showToast("All profile fields are required.", "error");
            return;
        }

        const saveBtn = this;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        try {
            const res = await fetch(`/api/join/${activeVolunteerId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    fullName, fatherName, dob, gender, bloodGroup, aadhar,
                    email, phone, whatsapp, street, place, district, pincode, state, status
                })
            });

            if (res.ok) {
                showToast("Volunteer profile updated successfully!", "success");
                volunteerModal.style.display = "none";
                loadVolunteers(); // Refresh table
                fetchCounters(); // Refresh stats
            } else {
                const errResult = await res.json();
                showToast(errResult.error || "Failed to update profile.", "error");
            }
        } catch (err) {
            handleApiError(err);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        }
    });

    // Blood Modal Close Triggers
    closeBloodModalBtn.addEventListener("click", () => bloodModal.style.display = "none");
    closeBloodModalBtn2.addEventListener("click", () => bloodModal.style.display = "none");
    bloodModal.addEventListener("click", (e) => {
        if (e.target === bloodModal) bloodModal.style.display = "none";
    });

    // Save Blood Profile changes
    document.getElementById("save-blood-profile-btn").addEventListener("click", async function () {
        if (!activeBloodId) return;

        const patientName = document.getElementById("edit-blood-patientName").value.trim();
        const bloodGroup = document.getElementById("edit-blood-group").value.trim();
        const unitsRequired = parseInt(document.getElementById("edit-blood-units").value.trim(), 10);
        const requiredDate = document.getElementById("edit-blood-date").value.trim();
        const contactName = document.getElementById("edit-blood-contactName").value.trim();
        const phone = document.getElementById("edit-blood-phone").value.trim();
        const email = document.getElementById("edit-blood-email").value.trim();
        const status = document.getElementById("edit-blood-status").value;
        const hospitalName = document.getElementById("edit-blood-hospitalName").value.trim();
        const hospitalLocation = document.getElementById("edit-blood-hospitalLocation").value.trim();
        const message = document.getElementById("edit-blood-message").value.trim();

        if (!patientName || !bloodGroup || !unitsRequired || !requiredDate || !contactName || !phone || !email || !status || !hospitalName || !hospitalLocation) {
            showToast("All coordination fields are required.", "error");
            return;
        }

        const saveBtn = this;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        try {
            const res = await fetch(`/api/blood-enquiry/${activeBloodId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    patientName, bloodGroup, unitsRequired, requiredDate,
                    contactName, phone, email, status, hospitalName, hospitalLocation, message
                })
            });

            if (res.ok) {
                showToast("Blood inquiry updated successfully!", "success");
                bloodModal.style.display = "none";
                loadBloodEnquiries(); // Refresh table
                fetchCounters(); // Refresh overview count
            } else {
                const errResult = await res.json();
                showToast(errResult.error || "Failed to update profile.", "error");
            }
        } catch (err) {
            handleApiError(err);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        }
    });

    // Contact Modal Close Triggers
    closeContactModalBtn.addEventListener("click", () => contactModal.style.display = "none");
    closeContactModalBtn2.addEventListener("click", () => contactModal.style.display = "none");
    contactModal.addEventListener("click", (e) => {
        if (e.target === contactModal) contactModal.style.display = "none";
    });

    // Refresh Buttons Handling
    document.getElementById("refresh-contacts-btn").addEventListener("click", function () {
        const icon = this.querySelector("i");
        icon.classList.add("fa-spin");
        loadContacts().finally(() => {
            setTimeout(() => icon.classList.remove("fa-spin"), 800);
        });
    });

    document.getElementById("refresh-volunteers-btn").addEventListener("click", function () {
        const icon = this.querySelector("i");
        icon.classList.add("fa-spin");
        loadVolunteers().finally(() => {
            setTimeout(() => icon.classList.remove("fa-spin"), 800);
        });
    });

    function showContactModal(name, email, phone, date, msg) {
        contactModalName.textContent = `Inquiry from ${name}`;
        contactModalDetails.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; width: 100%;">
                <div style="background: rgba(248, 167, 47, 0.04); border: 1px solid rgba(248, 167, 47, 0.08); border-radius: 14px; padding: 16px; display: flex; align-items: center; gap: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(248, 167, 47, 0.12); display: flex; align-items: center; justify-content: center; color: var(--color-orange); font-size: 1.25rem;">
                        <i class="fas fa-envelope"></i>
                    </div>
                    <div>
                        <span style="font-size: 0.75rem; color: var(--text-muted); display: block; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2px;">Email Address</span>
                        <a href="mailto:${escapeHTML(email)}" style="font-size: 0.95rem; color: var(--text-primary); font-weight: 600; text-decoration: none; transition: color 0.2s ease;" onmouseover="this.style.color='var(--color-orange)'" onmouseout="this.style.color='var(--text-primary)'">${escapeHTML(email)}</a>
                    </div>
                </div>
                <div style="background: rgba(248, 167, 47, 0.04); border: 1px solid rgba(248, 167, 47, 0.08); border-radius: 14px; padding: 16px; display: flex; align-items: center; gap: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(248, 167, 47, 0.12); display: flex; align-items: center; justify-content: center; color: var(--color-orange); font-size: 1.25rem;">
                        <i class="fas fa-phone"></i>
                    </div>
                    <div>
                        <span style="font-size: 0.75rem; color: var(--text-muted); display: block; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2px;">Phone Number</span>
                        <a href="tel:${escapeHTML(phone)}" style="font-size: 0.95rem; color: var(--text-primary); font-weight: 600; text-decoration: none; transition: color 0.2s ease;" onmouseover="this.style.color='var(--color-orange)'" onmouseout="this.style.color='var(--text-primary)'">${escapeHTML(phone)}</a>
                    </div>
                </div>
                <div style="background: rgba(248, 167, 47, 0.04); border: 1px solid rgba(248, 167, 47, 0.08); border-radius: 14px; padding: 16px; display: flex; align-items: center; gap: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); grid-column: 1 / -1;">
                    <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(248, 167, 47, 0.12); display: flex; align-items: center; justify-content: center; color: var(--color-orange); font-size: 1.25rem;">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div>
                        <span style="font-size: 0.75rem; color: var(--text-muted); display: block; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2px;">Inquiry Date</span>
                        <span style="font-size: 0.95rem; color: var(--text-primary); font-weight: 600;">${escapeHTML(date)}</span>
                    </div>
                </div>
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
            card.setAttribute("draggable", "true");
            card.setAttribute("data-id", item._id);
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

        // Drag and Drop Listeners
        let dragSourceId = null;
        const cards = grid.querySelectorAll(".gallery-admin-card");
        cards.forEach(card => {
            card.addEventListener("dragstart", function (e) {
                dragSourceId = this.getAttribute("data-id");
                this.classList.add("dragging");
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", dragSourceId);
            });

            card.addEventListener("dragend", function () {
                this.classList.remove("dragging");
                cards.forEach(c => c.classList.remove("drag-over"));
            });

            card.addEventListener("dragover", function (e) {
                e.preventDefault();
                return false;
            });

            card.addEventListener("dragenter", function () {
                if (this.getAttribute("data-id") !== dragSourceId) {
                    this.classList.add("drag-over");
                }
            });

            card.addEventListener("dragleave", function () {
                this.classList.remove("drag-over");
            });

            card.addEventListener("drop", async function (e) {
                e.preventDefault();
                this.classList.remove("drag-over");
                
                const targetId = this.getAttribute("data-id");
                if (dragSourceId && dragSourceId !== targetId) {
                    const dragIndex = galleryList.findIndex(item => item._id === dragSourceId);
                    const targetIndex = galleryList.findIndex(item => item._id === targetId);
                    
                    if (dragIndex !== -1 && targetIndex !== -1) {
                        const [draggedItem] = galleryList.splice(dragIndex, 1);
                        galleryList.splice(targetIndex, 0, draggedItem);
                        
                        renderGallery(galleryList);
                        
                        try {
                            const orders = galleryList.map((item, idx) => ({
                                id: item._id,
                                position: idx
                            }));
                            
                            const res = await fetch("/api/gallery/reorder", {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${token}`
                                },
                                body: JSON.stringify({ orders })
                            });
                            
                            if (res.ok) {
                                showToast("Gallery order saved successfully!", "success");
                            } else {
                                const err = await res.json();
                                showToast(err.error || "Failed to save reorder", "error");
                            }
                        } catch (err) {
                            console.error("Reorder failed:", err);
                            showToast("Failed to save reorder", "error");
                        }
                    }
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
        imgPreviewPlaceholder.innerHTML = `<i class="fas fa-image"></i><p>Insert an image to see a preview here.</p>`;
        
        uploadedImageBase64 = null;
        if (imgUrlInput) {
            imgUrlInput.disabled = false;
            imgUrlInput.placeholder = "e.g. images/pho7.png or absolute URL";
            imgUrlInput.value = "";
        }
        if (removeSelectedImgBtn) {
            removeSelectedImgBtn.style.display = "none";
        }
    }

    // Drag & Drop File Upload Bindings
    if (dropZone && fileInput) {
        // Clicking on drop zone triggers file input click
        dropZone.addEventListener("click", () => fileInput.click());

        // File input changed (user browsed and chose a file)
        fileInput.addEventListener("change", function () {
            const file = this.files[0];
            if (file) handleImageUpload(file);
        });

        // Drag and Drop Event listeners
        dropZone.addEventListener("dragover", function (e) {
            e.preventDefault();
            this.style.borderColor = "var(--color-orange)";
            this.style.background = "rgba(248, 167, 47, 0.08)";
        });

        dropZone.addEventListener("dragenter", function (e) {
            e.preventDefault();
            this.style.borderColor = "var(--color-orange)";
            this.style.background = "rgba(248, 167, 47, 0.08)";
        });

        dropZone.addEventListener("dragleave", function () {
            this.style.borderColor = "rgba(248, 167, 47, 0.2)";
            this.style.background = "rgba(248, 167, 47, 0.02)";
        });

        dropZone.addEventListener("drop", function (e) {
            e.preventDefault();
            this.style.borderColor = "rgba(248, 167, 47, 0.2)";
            this.style.background = "rgba(248, 167, 47, 0.02)";

            const file = e.dataTransfer.files[0];
            if (file) handleImageUpload(file);
        });
    }

    function handleImageUpload(file) {
        if (!file.type.match("image.*")) {
            showToast("Invalid file type. Please upload an image.", "error");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            uploadedImageBase64 = event.target.result;

            imgPreview.src = uploadedImageBase64;
            imgPreview.style.display = "block";
            imgPreviewPlaceholder.style.display = "none";
            removeSelectedImgBtn.style.display = "flex";

            imgUrlInput.value = "";
            imgUrlInput.disabled = true;
            imgUrlInput.placeholder = `[Local Upload: ${file.name}]`;
        };
        reader.readAsDataURL(file);
    }

    if (removeSelectedImgBtn) {
        removeSelectedImgBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            resetImagePreview();
        });
    }

    // Modal submit action
    galleryForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        
        const title = document.getElementById("img-title").value.trim();
        const imageUrl = uploadedImageBase64 ? uploadedImageBase64 : imgUrlInput.value.trim();
        const description = document.getElementById("img-desc").value.trim();
        const submitBtn = galleryForm.querySelector("button[type='submit']");

        if (!title || !imageUrl) {
            showToast("Required fields are missing (Title or Image).", "error");
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
        if (str === null || str === undefined) return "";
        const s = String(str);
        return s.replace(/[&<>'"]/g, 
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
        toast.style.backgroundColor = type === "success" ? "var(--color-green)" : "var(--color-orange)";
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

    if (statsForm) {
        statsForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            
            const mealsDonated = statsMealsInput.value.trim();
            const treesPlanted = statsTreesInput.value.trim();
            const bloodBridges = statsBloodInput.value.trim();
            
            if (!mealsDonated || !treesPlanted || !bloodBridges) {
                showToast("All counter stats fields are required.", "error");
                return;
            }

            const saveBtn = statsForm.querySelector("button");
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            try {
                const res = await fetch("/api/stats", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ mealsDonated, treesPlanted, bloodBridges })
                });

                if (res.ok) {
                    showToast("Public counters saved successfully!", "success");
                } else {
                    const err = await res.json();
                    showToast(err.error || "Failed to save counters", "error");
                }
            } catch (err) {
                handleApiError(err);
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Counters';
            }
        });
    }

    if (contactInfoForm) {
        contactInfoForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            
            const address = contactAddressInput.value.trim();
            const phone = contactPhoneInput.value.trim();
            const email = contactEmailInput.value.trim();
            
            if (!address || !phone || !email) {
                showToast("All contact info fields are required.", "error");
                return;
            }

            const saveBtn = contactInfoForm.querySelector("button");
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            try {
                const res = await fetch("/api/stats", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ address, phone, email })
                });

                if (res.ok) {
                    showToast("Public contact info saved successfully!", "success");
                } else {
                    const err = await res.json();
                    showToast(err.error || "Failed to save contact info", "error");
                }
            } catch (err) {
                handleApiError(err);
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Contact Info';
            }
        });
    }

    if (whatsappSettingsForm) {
        whatsappSettingsForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            
            const whatsappPhone = whatsappPhoneInput.value.trim();
            const whatsappText = whatsappTextInput.value.trim();
            
            if (!whatsappPhone || !whatsappText) {
                showToast("All WhatsApp redirection settings fields are required.", "error");
                return;
            }

            const saveBtn = whatsappSettingsForm.querySelector("button");
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            try {
                const res = await fetch("/api/stats", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ whatsappPhone, whatsappText })
                });

                if (res.ok) {
                    showToast("WhatsApp redirection settings saved successfully!", "success");
                } else {
                    const err = await res.json();
                    showToast(err.error || "Failed to save WhatsApp settings", "error");
                }
            } catch (err) {
                handleApiError(err);
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Save WhatsApp Settings';
            }
        });
    }

    // Inject Toast and Drag animations
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
        .gallery-admin-card {
            cursor: grab;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .gallery-admin-card:active {
            cursor: grabbing;
        }
        .gallery-admin-card.dragging {
            opacity: 0.5;
            border: 2px dashed rgba(255, 255, 255, 0.2) !important;
        }
        .gallery-admin-card.drag-over {
            border: 2px dashed var(--color-orange) !important;
            transform: scale(1.02);
            box-shadow: 0 12px 30px var(--glow-orange);
        }
    `;
    document.head.appendChild(styleSheet);
});
