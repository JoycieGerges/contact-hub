const contactForm = document.getElementById("contactForm");
const contactsList = document.getElementById("contactsList");
const emptyState = document.getElementById("emptyState");

const totalCounter = document.querySelector("#quick-stats .col-6.col-md-4:nth-child(1) h3");
const favoritesCounter = document.querySelector("#quick-stats .col-6.col-md-4:nth-child(2) h3");
const emergencyCounter = document.querySelector("#quick-stats .col-6.col-md-4:nth-child(3) h3");

const favoritesSection = document.querySelector("#favorites-section .card-body");
const emergencySection = document.querySelector("#emergency-contacts .card-body");


let totalContacts = 0;
let totalFavorites = 0;
let totalEmergency = 0;

let editingContactCard = null;


// LOCAL STORAGE FUNCTIONS
function saveContactsToLocalStorage() {
    const contacts = [];
    const contactCards = document.querySelectorAll(".contact-card");

    for (let i = 0; i < contactCards.length; i++) {
        const card = contactCards[i];
        const contact = {
            id: card.dataset.contactId,
            name: card.querySelector("h6")?.textContent || "",
            phone: card.querySelector(".fa-phone")?.parentElement?.nextElementSibling?.textContent || "",
            email: card.querySelector(".fa-envelope")?.parentElement?.nextElementSibling?.textContent || "",
            address: card.querySelector(".fa-location-dot")?.closest(".icon-box")?.nextElementSibling?.textContent || "",
            group: card.querySelector(".badge")?.textContent.trim().toLowerCase() || "",
            isFavorite: !!card.querySelector(".fav-badge"),
            isEmergency: !!card.querySelector(".fav-badge2"),
            avatar: card.querySelector(".avatar-gradient")?.style.background || "",
            createdAt: card.dataset.createdAt || new Date(),
            notes: card.dataset.notes || ""
        };
        contacts.push(contact);
    }

    localStorage.setItem("contacts", JSON.stringify(contacts));
}

function loadContactsFromLocalStorage() {
    const savedContacts = localStorage.getItem("contacts");
    
    if (!savedContacts) return;
    
    const contacts = JSON.parse(savedContacts);
    
   for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];

    const contactData = {
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        address: contact.address,
        group: contact.group,
        favorite: contact.isFavorite,
        emergency: contact.isEmergency,
        gradient: contact.avatar,
        initials: getInitials(contact.name),
        id: contact.id,
        createdAt: contact.createdAt,
        notes: contact.notes || ""
    };

    createContactCard(contactData);
}

    
    updateAllCounters();
    
    if (totalContacts > 0) {
        contactsList.classList.remove("d-none");
        emptyState.classList.add("d-none");
    }
}

function getInitials(name) {
    const nameParts = name.trim().split(/\s+/);
    return nameParts[0][0].toUpperCase() +
      (nameParts.length > 1 ? nameParts[nameParts.length - 1][0].toUpperCase() : "");
}

function updateAllCounters() {
    totalContacts = document.querySelectorAll(".contact-card").length;
    totalFavorites = document.querySelectorAll(".fav-badge").length;
    totalEmergency = document.querySelectorAll(".fav-badge2").length;
    
    totalCounter.textContent = totalContacts;
    favoritesCounter.textContent = totalFavorites;
    emergencyCounter.textContent = totalEmergency;
    
    document.getElementById("contactsCounter").textContent = 
        `Manage and organize your ${totalContacts} contact`;
}


// VALIDATION FUNCTIONS
function validateEgyptianPhone(phone) {
    const egyptianPhoneRegex = /^(010|011|012|015)\d{8}$/;
    return egyptianPhoneRegex.test(phone);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(inputId, message) {
    const input = document.getElementById(inputId);
    let errorDiv = input.parentNode.querySelector('.error-message');
    
    if (errorDiv) {
        errorDiv.textContent = message;
    } else {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-danger small mt-1';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
    }
    
    input.classList.add('is-invalid');
}

function clearError(inputId) {
    const input = document.getElementById(inputId);
    const errorDiv = input.parentNode.querySelector('.error-message');
    
    if (errorDiv) {
        errorDiv.remove();
    }
    input.classList.remove('is-invalid');
}


document.getElementById("phoneInput").addEventListener("input", function() {
    const phone = this.value.trim();
    
    if (phone && !validateEgyptianPhone(phone)) {
        showError("phoneInput");
    } else {
        clearError("phoneInput");
    }
});

document.getElementById("emailInput").addEventListener("input", function() {
    const email = this.value.trim();
    
    if (email && !validateEmail(email)) {
        showError("emailInput");
    } else {
        clearError("emailInput");
    }
});


// SEARCH
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase().trim();
    const contactCards = document.querySelectorAll(".contact-card");
    let anyVisible = false;

    for (let i = 0; i < contactCards.length; i++) {
    const card = contactCards[i];

    const nameEl = card.querySelector("h6");
    const name = nameEl ? nameEl.textContent.toLowerCase() : "";

    const phoneEl = card.querySelector(".fa-phone");
    const phone = phoneEl ? phoneEl.parentElement.nextElementSibling.textContent.toLowerCase() : "";

    const emailEl = card.querySelector(".fa-envelope");
    const email = emailEl ? emailEl.parentElement.nextElementSibling.textContent.toLowerCase() : "";

    if (name.includes(query) || phone.includes(query) || email.includes(query)) {
        card.parentElement.classList.remove("d-none");
        anyVisible = true;
    } else {
        card.parentElement.classList.add("d-none");
    }
}


    if (!anyVisible) {
        emptyState.classList.remove("d-none");
    } else {
        emptyState.classList.add("d-none");
    }
});


// FUNCTIONS
function createFavoriteItem({ name, phone, initials, gradient }) {
    return `
    <div class="d-flex align-items-center gap-3 p-2 rounded-4 bg-light fav-item">
        <div class="flex-shrink-0">
            <div class="rounded-3 d-flex align-items-center justify-content-center text-white fw-semibold shadow-sm"
                 style="width:40px;height:40px;background:${gradient}">
                ${initials}
            </div>
        </div>
        <div class="flex-grow-1 overflow-hidden">
            <h6 class="mb-0 small fw-semibold text-truncate">${name}</h6>
            <small class="text-muted text-truncate d-block">${phone}</small>
        </div>
        <a href="tel:${phone}"
           class="flex-shrink-0 d-flex align-items-center justify-content-center rounded-3 text-success bg-success-subtle"
           style="width:32px;height:32px">
            <i class="fas fa-phone small"></i>
        </a>
    </div>
    `;
}

function createEmergencyItem({ name, phone, initials, gradient }) {
    return `
    <div class="d-flex align-items-start gap-3 p-2 rounded-4 bg-light emergency-item">
        <div class="flex-shrink-0">
            <div class="rounded-3 d-flex align-items-center justify-content-center text-white fw-semibold shadow-sm"
                 style="width:40px;height:40px;background:${gradient}">
                ${initials}
            </div>
        </div>
        <div class="flex-grow-1 overflow-hidden ">
            <h6 class="mb-1 small fw-semibold text-truncate">${name}</h6>
            <small class="ttext-muted text-truncate d-block">${phone}</small>
        </div>
        <a href="tel:${phone}"
           class="flex-shrink-0 d-flex align-items-center justify-content-center rounded-3 text-danger bg-danger-subtle"
           style="width:32px;height:32px">
            <i class="fas fa-phone small"></i>
        </a>
    </div>
    `;
}

function updateEmptyMessages() {
    const favoritesEmptyMsg = document.getElementById("favoritesEmpty");
    const emergencyEmptyMsg = document.getElementById("emergencyEmpty");

    favoritesEmptyMsg.classList.toggle("d-none", favoritesList.querySelectorAll(".fav-item").length > 0);
    emergencyEmptyMsg.classList.toggle("d-none", emergencyList.querySelectorAll(".emergency-item").length > 0);
}

function updateFavoritesAndEmergencyLists() {
    favoritesList.innerHTML = "";
    emergencyList.innerHTML = "";
    
    const cards = document.querySelectorAll(".contact-card");

for (let i = 0; i < cards.length; i++) {
    const card = cards[i];

    const nameEl = card.querySelector("h6");
    const name = nameEl ? nameEl.textContent : "";

    const phoneEl = card.querySelector(".fa-phone");
    const phone = phoneEl ? phoneEl.parentElement.nextElementSibling.textContent : "";

    const avatar = card.querySelector(".avatar-gradient");
    const initials = avatar ? avatar.textContent : "";
    const gradient = avatar ? avatar.style.background : "";

    const isFavorite = card.querySelector(".fav-badge") ? true : false;
    const isEmergency = card.querySelector(".fav-badge2") ? true : false;

    if (isFavorite) {
        favoritesList.insertAdjacentHTML("beforeend", createFavoriteItem({ name, phone, initials, gradient }));
    }

    if (isEmergency) {
        emergencyList.insertAdjacentHTML("beforeend", createEmergencyItem({ name, phone, initials, gradient }));
    }
}

    
    updateAllCounters();
    updateEmptyMessages();
}

const groupColors = {
    "Family": "bg-primary-subtle text-primary",
    "Friends": "bg-success-subtle text-success",
    "Work": "bg-violet-subtle text-violet",
    "School": "bg-warning-subtle text-warning",
    "Other": "bg-secondary-subtle text-secondary"
};


// CREATE CONTACT CARD
function createContactCard(contact) {
    const { name, phone, email, address, group, favorite, emergency, gradient, initials, id, createdAt, notes } = contact;
    
    const contactCard = document.createElement("div");
    contactCard.classList.add("col-12", "col-sm-6");
    

    const contactId = id;
    const contactCreatedAt = createdAt || new Date();
    const contactNotes = notes || "";
    
    contactCard.innerHTML = `
<div class="card h-100 border-0 shadow-sm contact-card rounded-4 d-flex flex-column" data-contact-id="${contactId}" data-created-at="${contactCreatedAt}" data-notes="${contactNotes}">
  <div class="card-body pb-3 flex-grow-1 d-flex flex-column">
    <div class="d-flex gap-3">
        <div class="position-relative flex-shrink-0">
        <div class="avatar-gradient rounded-4 d-flex align-items-center justify-content-center text-white fw-semibold"
          style="background: ${gradient};">
          ${initials}
        </div>
        ${favorite ? `
        <div class="fav-badge position-absolute d-flex align-items-center justify-content-center rounded-5">
          <i class="fas fa-star text-white"></i>
        </div>` : ``}
         ${emergency ? `
        <div class="fav-badge2 position-absolute d-flex align-items-center justify-content-center rounded-5">
          <i class="fa-solid fa-heart-pulse text-white"></i>
        </div>` : ``}
      </div>
      <div class="flex-grow-1 pt-1 overflow-hidden">
        <h6 class="fw-semibold mb-1 text-truncate">${name}</h6>
        <div class="d-flex align-items-center gap-2">
          <div class="icon-box d-flex align-items-center justify-content-center bg-primary-subtle text-primary">
            <i class="fas fa-phone"></i>
          </div>
          <span class="text-muted small text-truncate">${phone}</span>
        </div>
      </div>
    </div>
    <div class="mt-3 d-flex flex-column gap-2">
      ${email ? `
      <div class="d-flex align-items-center gap-2">
        <div class="icon-box d-flex align-items-center justify-content-center bg-violet-subtle text-violet">
          <i class="fas fa-envelope "></i>
        </div>
        <span class="text-muted small text-truncate">${email}</span>
      </div>` : ``}
      ${address ? `
      <div class="d-flex align-items-center gap-2">
        <div class="icon-box d-flex align-items-center justify-content-center bg-success-subtle text-success">
          <i class="fas fa-location-dot"></i>
        </div>
        <span class="text-secondry small text-truncate">${address}</span>
      </div>` : ``}
    </div>
  ${(group && group !== "Select a group") || emergency ? `
<div class="mt-3 d-flex align-items-center gap-2 flex-wrap group-emergency">
  ${group && group !== "Select a group" ? `
  <span class="badge ${groupColors[group] || groupColors[group.charAt(0).toUpperCase() + group.slice(1)] || "bg-secondary-subtle text-secondary"} text-lowercase">
    ${group}
  </span>
  ` : ``}
  ${emergency ? `
  <span class="d-inline-flex align-items-center gap-1 p-1 pinkstyle small fw-normal rounded-3">
    <i class="fa-solid fa-heart-pulse"></i>
    Emergency
  </span>
  ` : ``}
</div>
` : ``}
  </div> 
  <div class="card-footer bg-light border-0 d-flex justify-content-between p-3">
    <div class="d-flex gap-2">
      <a href="tel:${phone}" class="action-button text-success bg-success-subtle">
        <i class="fa-solid fa-phone"></i>
      </a>
      ${email ? `
      <button class="action-button text-violet bg-violet-subtle">
        <i class="fas fa-envelope yellowhover"></i>
      </button>` : ``}
    </div>
    <div class="d-flex ">
      <button class="action-btn d-flex align-items-center justify-content-center text-secondary toggle-favorite ${favorite ? 'active' : ''}">
        <i class="${favorite ? 'fas' : 'far'} fa-star d-flex align-items-center justify-content-center"></i>
      </button>
      <button class="action-btn me-2 text-secondary toggle-emergency ${emergency ? 'active' : ''}">
        <i class="${emergency ? 'fa-solid' : 'fa-solid'} fa-heart-pulse d-flex align-items-center justify-content-center"></i>
      </button>
     <button class="action-btn text-secondary me-2 ">
  <i class="fas fa-pen d-flex align-items-center justify-content-center"></i>
</button>
  <button class="action-btn text-secondary delete-btn" data-name="${name}">
  <i class="fas fa-trash d-flex align-items-center justify-content-center"></i>
</button>
    </div>
  </div> 
</div> 
`;

    contactsList.appendChild(contactCard);
    
    if (favorite) {
        favoritesList.insertAdjacentHTML("beforeend", createFavoriteItem({ name, phone, initials, gradient }));
    }
    
    if (emergency) {
        emergencyList.insertAdjacentHTML("beforeend", createEmergencyItem({ name, phone, initials, gradient }));
    }
    
    updateEmptyMessages();
}


// FORM SUBMIT
contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("nameInput").value.trim();
    const phone = document.getElementById("phoneInput").value.trim();
    const email = document.getElementById("emailInput").value.trim();
    const address = document.getElementById("addressInput").value.trim();
    const group = document.getElementById("groupInput").value;
    const favorite = document.getElementById("favorite").checked;
    const emergency = document.getElementById("emergency").checked;
    const notes = document.getElementById("notesInput").value.trim();

 
    if (!name) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Name',
            text: 'Please enter a name for the contact!',
            confirmButtonText: 'OK'
        });
        return;
    }

    if (!phone) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Phone',
            text: 'Please enter a phone number!',
            confirmButtonText: 'OK'
        });
        return;
    }

    if (!validateEgyptianPhone(phone)) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Phone Number',
            text: 'Please enter a valid Egyptian phone number (e.g., 01012345678 or +201012345678)',
            confirmButtonText: 'OK'
        });
        return;
    }

    if (email.length > 0 && !validateEmail(email)) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Email',
            text: 'Please enter a valid email address',
            confirmButtonText: 'OK'
        });
        return;
    }

    if (editingContactCard) {

        // UPDATE EXISTING CONTACT
        editingContactCard.querySelector("h6").textContent = name;
        
        editingContactCard.dataset.notes = notes;
        
        const avatarDiv = editingContactCard.querySelector(".avatar-gradient");
        if (avatarDiv) {
            const nameParts = name.trim().split(/\s+/);
            const initials = nameParts[0][0].toUpperCase() +
              (nameParts.length > 1 ? nameParts[nameParts.length - 1][0].toUpperCase() : "");
            avatarDiv.textContent = initials;
        }

        editingContactCard.querySelector(".fa-phone").parentElement.nextElementSibling.textContent = phone;

        const emailEl = editingContactCard.querySelector(".fa-envelope");
        if (emailEl) emailEl.parentElement.nextElementSibling.textContent = email;

        const favoriteBtn = editingContactCard.querySelector(".toggle-favorite");
        const emergencyBtn = editingContactCard.querySelector(".toggle-emergency");
        
        if (favorite) {
            if (!editingContactCard.querySelector(".fav-badge")) {
                const avatar = editingContactCard.querySelector(".avatar-gradient");
                const badge = document.createElement("div");
                badge.className = "fav-badge position-absolute d-flex align-items-center justify-content-center rounded-5";
                badge.innerHTML = `<i class="fas fa-star text-white"></i>`;
                avatar.parentElement.appendChild(badge);
            }
            favoriteBtn.classList.add("active");
            favoriteBtn.querySelector("i").classList.remove("far");
            favoriteBtn.querySelector("i").classList.add("fas");
        } else {
            const badge = editingContactCard.querySelector(".fav-badge");
            if (badge) badge.remove();
            favoriteBtn.classList.remove("active");
            favoriteBtn.querySelector("i").classList.remove("fas");
            favoriteBtn.querySelector("i").classList.add("far");
        }

        if (emergency) {
            if (!editingContactCard.querySelector(".fav-badge2")) {
                const avatar = editingContactCard.querySelector(".avatar-gradient");
                const badge2 = document.createElement("div");
                badge2.className = "fav-badge2 position-absolute d-flex align-items-center justify-content-center rounded-5";
                badge2.innerHTML = `<i class="fa-solid fa-heart-pulse text-white"></i>`;
                avatar.parentElement.appendChild(badge2);
            }
            emergencyBtn.classList.add("active");
            emergencyBtn.querySelector("i").classList.remove("far");
            emergencyBtn.querySelector("i").classList.add("fas");
        } else {
            const badge2 = editingContactCard.querySelector(".fav-badge2");
            if (badge2) badge2.remove();
            emergencyBtn.classList.remove("active");
            emergencyBtn.querySelector("i").classList.remove("fas");
            emergencyBtn.querySelector("i").classList.add("far");
        }

        const addressIcon = editingContactCard.querySelector(".fa-location-dot");
        if (address) {
            if (addressIcon) {
                const addressSpan = addressIcon.closest(".icon-box")?.nextElementSibling;
                if (addressSpan) addressSpan.textContent = address;
            } else {
                const addressHTML = `
                <div class="d-flex align-items-center gap-2">
                    <div class="icon-box d-flex align-items-center justify-content-center bg-success-subtle text-success">
                        <i class="fas fa-location-dot"></i>
                    </div>
                    <span class="text-muted small text-truncate">${address}</span>
                </div>`;
                editingContactCard.querySelector(".mt-3")?.insertAdjacentHTML("beforebegin", addressHTML);
            }
        } else {
            addressIcon?.closest(".d-flex")?.remove();
        }

        // Update Notes
       editingContactCard.dataset.notes = notes;


        let badgeContainer = editingContactCard.querySelector(".group-emergency");
        if (!badgeContainer) {
            badgeContainer = document.createElement("div");
            badgeContainer.className = "mt-3 d-flex align-items-center gap-2 flex-wrap group-emergency";
            editingContactCard.querySelector(".card-body").appendChild(badgeContainer);
        }
        badgeContainer.innerHTML = "";

        if (group && group !== "Select a group") {
            const badge = document.createElement("span");
            badge.className = `badge ${groupColors[group] || "bg-secondary-subtle text-secondary"} text-lowercase`;
            badge.textContent = group;
            badgeContainer.appendChild(badge);
        }

        if (emergency) {
            const emergencySpan = document.createElement("span");
            emergencySpan.className = "d-inline-flex align-items-center gap-1 p-1 pinkstyle small fw-normal rounded-3";
            emergencySpan.innerHTML = `<i class="fa-solid fa-heart-pulse"></i> Emergency`;
            badgeContainer.appendChild(emergencySpan);
        }

        if (!group && !emergency) {
            badgeContainer.remove();
        }

        updateFavoritesAndEmergencyLists();
        saveContactsToLocalStorage();
        
        Swal.fire('Updated!', 'Contact has been updated successfully.', 'success');

        editingContactCard = null;
        contactForm.reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('contactModal'));
        modal.hide();
        
        clearError("phoneInput");
        clearError("emailInput");
        return;
    }

    // ADD NEW CONTACT
    const existingContact = Array.from(document.querySelectorAll(".contact-card")).find(card => {
        const existingPhone = card.querySelector(".fa-phone")?.parentElement.nextElementSibling?.textContent.trim();
        return existingPhone === phone;
    });

    if (existingContact) {
        const existingName = existingContact.querySelector("h6").textContent;
        Swal.fire({
            icon: 'error',
            title: 'Duplicate Phone Number',
            text: `A contact with this phone number already exists: ${existingName}`,
            confirmButtonText: 'OK'
        });
        return;
    }

    const nameParts = name.trim().split(/\s+/);
    const initials = nameParts[0][0].toUpperCase() +
      (nameParts.length > 1 ? nameParts[nameParts.length - 1][0].toUpperCase() : "");

    const avatarGradients = [
        "linear-gradient(135deg, #FC1B5C, #E90072)",
        "linear-gradient(135deg, #FD8A00, #F75B00)",
        "linear-gradient(135deg, #2679FF, #1863FD)",
        "linear-gradient(135deg, #6857FF, #7B32FE)",
    ];

    const randomGradient = avatarGradients[Math.floor(Math.random() * avatarGradients.length)];

    const contactData = {
        name, 
        phone, 
        email, 
        address, 
        group, 
        favorite, 
        emergency, 
        gradient: randomGradient, 
        initials,
        id: `contact`,
        createdAt: new Date(),
        notes: notes
    };

    createContactCard(contactData);
    
    contactsList.classList.remove("d-none");
    emptyState.classList.add("d-none");

    updateAllCounters();
    saveContactsToLocalStorage();

    Swal.fire({
        title: 'Added!',
        text: 'Contact has been added successfully.',
        icon: 'success',
    });

    contactForm.reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById('contactModal'));
    modal.hide();
    
    clearError("phoneInput");
    clearError("emailInput");
});


// CONTACT ACTIONS (Edit, Delete, Toggle)
contactsList.addEventListener("click", (e) => {
    
    // Toggle Favorite
    const favoriteBtn = e.target.closest(".toggle-favorite");
    if (favoriteBtn) {
        const card = favoriteBtn.closest(".contact-card");
        const hasFavBadge = !!card.querySelector(".fav-badge");
        
        if (hasFavBadge) {
            card.querySelector(".fav-badge")?.remove();
            favoriteBtn.classList.remove("active");
            favoriteBtn.querySelector("i").classList.remove("fas");
            favoriteBtn.querySelector("i").classList.add("far");
        } else {
            const avatar = card.querySelector(".avatar-gradient");
            const badge = document.createElement("div");
            badge.className = "fav-badge position-absolute d-flex align-items-center justify-content-center rounded-5";
            badge.innerHTML = `<i class="fas fa-star text-white"></i>`;
            avatar.parentElement.appendChild(badge);
            favoriteBtn.classList.add("active");
            favoriteBtn.querySelector("i").classList.remove("far");
            favoriteBtn.querySelector("i").classList.add("fas");
        }
        
        updateFavoritesAndEmergencyLists();
        saveContactsToLocalStorage();
        return;
    }
    
    // Toggle Emergency
    const emergencyBtn = e.target.closest(".toggle-emergency");
    if (emergencyBtn) {
        const card = emergencyBtn.closest(".contact-card");
        const hasEmergencyBadge = !!card.querySelector(".fav-badge2");
        
        if (hasEmergencyBadge) {
            card.querySelector(".fav-badge2")?.remove();
            emergencyBtn.classList.remove("active");
            emergencyBtn.querySelector("i").classList.remove("fas");
            emergencyBtn.querySelector("i").classList.add("far");
            
            const groupEmergency = card.querySelector(".group-emergency");
            if (groupEmergency) {
                const emergencySpan = groupEmergency.querySelector(".pinkstyle");
                if (emergencySpan) {
                    emergencySpan.remove();
                    if (!groupEmergency.querySelector(".badge")) {
                        groupEmergency.remove();
                    }
                }
            }
        } else {
            const avatar = card.querySelector(".avatar-gradient");
            const badge2 = document.createElement("div");
            badge2.className = "fav-badge2 position-absolute d-flex align-items-center justify-content-center rounded-5";
            badge2.innerHTML = `<i class="fa-solid fa-heart-pulse text-white"></i>`;
            avatar.parentElement.appendChild(badge2);
            emergencyBtn.classList.add("active");
            emergencyBtn.querySelector("i").classList.remove("far");
            emergencyBtn.querySelector("i").classList.add("fas");
            
            let groupEmergency = card.querySelector(".group-emergency");
            if (!groupEmergency) {
                groupEmergency = document.createElement("div");
                groupEmergency.className = "mt-3 d-flex align-items-center gap-2 flex-wrap group-emergency";
                card.querySelector(".card-body").appendChild(groupEmergency);
            }
            
            if (!groupEmergency.querySelector(".pinkstyle")) {
                const emergencySpan = document.createElement("span");
                emergencySpan.className = "d-inline-flex align-items-center gap-1 p-1 pinkstyle small fw-normal rounded-3";
                emergencySpan.innerHTML = `<i class="fa-solid fa-heart-pulse"></i> Emergency`;
                groupEmergency.appendChild(emergencySpan);
            }
        }
        
        updateFavoritesAndEmergencyLists();
        saveContactsToLocalStorage();
        return;
    }
    
    // Edit Contact
    const editBtn = e.target.closest("button");
    if (editBtn && editBtn.querySelector(".fa-pen")) {
        const card = editBtn.closest(".contact-card");
        editingContactCard = card;

        const name = card.querySelector("h6")?.textContent || "";
        const phoneEl = card.querySelector(".fa-phone");
        const phone = phoneEl?.parentElement?.nextElementSibling?.textContent || "";
        const emailEl = card.querySelector(".fa-envelope");
        const email = emailEl?.parentElement?.nextElementSibling?.textContent || "";
        const addressIcon = card.querySelector(".fa-location-dot");
        const address = addressIcon ? addressIcon.closest(".icon-box")?.nextElementSibling?.textContent || "" : "";
       const notes = card.dataset.notes || "";
        const groupBadge = card.querySelector(".badge");
        const group = groupBadge ? groupBadge.textContent.trim() : "Select a group";
        const favorite = !!card.querySelector(".fav-badge");
        const emergency = !!card.querySelector(".fav-badge2");

        document.getElementById("nameInput").value = name;
        document.getElementById("phoneInput").value = phone;
        document.getElementById("emailInput").value = email;
        document.getElementById("addressInput").value = address;
        document.getElementById("notesInput").value = notes;
        document.getElementById("groupInput").value = group;
        document.getElementById("favorite").checked = favorite;
        document.getElementById("emergency").checked = emergency;

        const modal = new bootstrap.Modal(document.getElementById("contactModal"));
        modal.show();
        return;
    }

    // Delete Contact
    if (e.target.closest(".delete-btn")) {
        const btn = e.target.closest(".delete-btn");
        const contactName = btn.dataset.name;

        Swal.fire({
            title: 'Delete Contact?',
            text: `Are you sure you want to delete ${contactName}? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            customClass: {
                confirmButton: 'btn btn-danger',
                cancelButton: 'btn btn-secondary'
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.isConfirmed) {
                const contactCard = btn.closest(".col-12.col-sm-6");
                if (contactCard) contactCard.remove();


                const favItems = favoritesList.querySelectorAll(".fav-item");
                for (let i = 0; i < favItems.length; i++) {
                    const fav = favItems[i];
                    if (fav.querySelector("h6").textContent === contactName) {
                        fav.remove();
                        break; 
                    }
                }


                const emgItems = emergencyList.querySelectorAll(".emergency-item");
                for (let i = 0; i < emgItems.length; i++) {
                    const emg = emgItems[i];
                    if (emg.querySelector("h6").textContent === contactName) {
                        emg.remove();
                        break;
                    }
                }

                updateAllCounters();
                updateEmptyMessages();
                saveContactsToLocalStorage();

                Swal.fire('Deleted!', `Contact has been deleted.`, 'success');
            }
        });
    }
});


// MODAL MANAGEMENT
function closeModal() {
    const modalEl = document.getElementById('contactModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) {
        modal.hide();
    }
    contactForm.reset();
    editingContactCard = null;
    clearError("phoneInput");
    clearError("emailInput");
}


// LOAD ON PAGE LOAD
window.addEventListener("DOMContentLoaded", () => {
    loadContactsFromLocalStorage();
    
    const cancelButton = document.getElementById('cancelBtn');
    if (cancelButton) {
        cancelButton.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal();
        });
    }
    
 
    const modalEl = document.getElementById('contactModal');
    if (modalEl) {
        modalEl.addEventListener('show.bs.modal', function () {
            clearError("phoneInput");
            clearError("emailInput");
        });
        
        modalEl.addEventListener('hide.bs.modal', function () {
            contactForm.reset();
            editingContactCard = null;
            clearError("phoneInput");
            clearError("emailInput");
        });
    }
});