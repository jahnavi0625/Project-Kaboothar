document.getElementById('sendEmailForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const formData = new FormData(this);

  try {
    const response = await fetch('/send', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    document.getElementById('status').textContent = data.message || 'Email sent successfully!';
  } catch (error) {
    document.getElementById('status').textContent = 'Error sending email.';
    console.error('Error:', error);
  }
});

// Fetch Sent Emails
document.getElementById('fetchEmails').addEventListener('click', async () => {
  try {
    const response = await fetch('/sent');
    const emails = await response.json();
    const list = document.getElementById('sentEmails');
    list.innerHTML = '';
    emails.forEach(email => {
      const li = document.createElement('li');
      li.textContent = `${email.to} - ${email.subject}: ${email.message}`;
      list.appendChild(li);
    });
    showPopup('sentEmailsPopup');
  } catch (err) {
    alert('Failed to fetch sent emails.');
  }
});

// Fetch Received Emails (Mock)
document.getElementById('fetchReceived').addEventListener('click', async () => {
  try {
    const response = await fetch('/received');
    const emails = await response.json();
    const list = document.getElementById('receivedEmails');
    list.innerHTML = '';
    emails.forEach(email => {
      const li = document.createElement('li');
      li.textContent = `${email.from} - ${email.subject}: ${email.message}`;
      list.appendChild(li);
    });
    showPopup('receivedEmailsPopup');
  } catch (err) {
    alert('Failed to fetch received emails.');
  }
});

// Add to Address Book
document.getElementById('addContactForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('contactEmail').value;

  try {
    const response = await fetch('/address-book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    const data = await response.json();
    alert(data.message);
    this.reset();
  } catch (err) {
    alert('Failed to add contact.');
  }
});

// Fetch Address Book
document.getElementById('fetchAddressBook').addEventListener('click', async () => {
  try {
    const response = await fetch('/address-book');
    const contacts = await response.json();
    const list = document.getElementById('addressBook');
    list.innerHTML = '';
    contacts.forEach(contact => {
      const li = document.createElement('li');
      li.textContent = `${contact.name} - ${contact.email}`;
      list.appendChild(li);
    });
    showPopup('addressBookPopup');
  } catch (err) {
    alert('Failed to fetch address book.');
  }
});

// Popup Handlers
function showPopup(id) {
  document.getElementById(id).style.display = 'block';
}
function closePopup(id) {
  document.getElementById(id).style.display = 'none';
}
