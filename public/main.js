// SEND EMAIL
document.getElementById("sendEmailForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(this);

  fetch("/send", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("status").innerText = data.message || "Email sent!";
      this.reset();
    })
    .catch(err => {
      document.getElementById("status").innerText = "Failed to send email.";
      console.error(err);
    });
});

// ADD CONTACT
document.getElementById("addContactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("contactEmail").value;

  fetch("/address-book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("contactStatus").innerText = data.message || "Contact added!";
      this.reset();
    })
    .catch(err => {
      document.getElementById("contactStatus").innerText = "Failed to add contact.";
      console.error(err);
    });
});

// Format ISO string to DD/MM/YYYY HH:MM
function formatDateString(iso) {
  const d = new Date(iso);
  if (!iso || isNaN(d.getTime())) return "N/A";
  return `${d.getDate().toString().padStart(2, '0')}/${
           (d.getMonth() + 1).toString().padStart(2, '0')}/${
           d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${
           d.getMinutes().toString().padStart(2, '0')}`;
}

// VIEW SENT EMAILS
function fetchEmails() {
  fetch("/sent")
    .then(res => res.json())
    .then(emails => {
      const list = document.getElementById("sentEmails");
      list.innerHTML = "";
      emails.forEach(email => {
        const to = Array.isArray(email.to) ? email.to.join(", ") : email.to;
        const cc = Array.isArray(email.cc) ? email.cc.join(", ") : email.cc;
        const ccDisplay = cc ? ` | CC: ${cc}` : "";
        const formatted = formatDateString(email.timestamp);
        const attachments = email.attachments?.length
          ? ` | Attachments: ${email.attachments.join(", ")}`
          : "";

        const li = document.createElement("li");
        li.textContent = `To: ${to}${ccDisplay} | Subject: ${email.subject} | Time: ${formatted}${attachments}`;
        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error("Failed to fetch sent emails:", err);
    });
}

// VIEW RECEIVED EMAILS
function fetchReceived() {
  fetch("/received")
    .then(res => res.json())
    .then(emails => {
      const list = document.getElementById("receivedEmails");
      list.innerHTML = "";
      emails.forEach(email => {
        const formatted = formatDateString(email.timestamp);
        const li = document.createElement("li");
        li.textContent = `From: ${email.from} | Subject: ${email.subject} | Time: ${formatted}`;
        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error("Failed to fetch received emails:", err);
    });
}

// VIEW ADDRESS BOOK
function fetchAddressBook() {
  fetch("/address-book")
    .then(res => res.json())
    .then(contacts => {
      const list = document.getElementById("addressBook");
      list.innerHTML = "";
      contacts.forEach(contact => {
        const li = document.createElement("li");
        li.textContent = `${contact.name} (${contact.email})`;
        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error("Failed to fetch address book:", err);
    });
}

// ===== POLLING + NOTIFICATIONS =====
let lastReceivedCount = 0;
let lastSentCount = 0;

function updateReceivedBadge(count) {
  const badge = document.getElementById("receivedBadge");
  if (!badge) return;
  if (count > 0) {
    badge.innerText = count;
    badge.style.display = "inline-block";
  } else {
    badge.innerText = "0";
    badge.style.display = "none";
  }
}

function pollNewEmails() {
  // RECEIVED
  fetch("/received")
    .then(res => res.json())
    .then(emails => {
      const newCount = emails.length - lastReceivedCount;
      if (newCount > 0) {
        showNotification(`📥 ${newCount} new received email(s)`);
        updateReceivedBadge(newCount);
        fetchReceived();
      }
      lastReceivedCount = emails.length;
    });

  // SENT
  fetch("/sent")
    .then(res => res.json())
    .then(emails => {
      const newCount = emails.length - lastSentCount;
      if (newCount > 0) {
        showNotification(`📤 ${newCount} new sent email(s)`);
        fetchEmails();
      }
      lastSentCount = emails.length;
    });
}

function showNotification(message) {
  if (Notification.permission === "granted") {
    new Notification("✉️ Email Dashboard", { body: message });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification("✉️ Email Dashboard", { body: message });
      }
    });
  }
}

function initializePolling() {
  if ("Notification" in window) {
    Notification.requestPermission();
  }

  fetch("/received")
    .then(res => res.json())
    .then(emails => { lastReceivedCount = emails.length; });

  fetch("/sent")
    .then(res => res.json())
    .then(emails => { lastSentCount = emails.length; });

  setInterval(pollNewEmails, 10000);
}

function initializeDashboard() {
  openSection('received');
  initializePolling();
}

function openSection(id) {
  document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
  document.getElementById(id).style.display = 'block';
  if (id === 'received') {
    updateReceivedBadge(0);
    fetchReceived();
  }
  if (id === 'sent') fetchEmails();
  if (id === 'addressBook') fetchAddressBook();
}
