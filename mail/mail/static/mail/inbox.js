document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#mail-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load and show all the mails
  let emailView = document.querySelector('#emails-view')

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(email => {

        // Sample output
        // {
        //   "id": 100,
        //   "sender": "foo@example.com",
        //   "recipients": ["bar@example.com"],
        //   "subject": "Hello!",
        //   "body": "Hello, world!",
        //   "timestamp": "Jan 2 2020, 12:00 AM",
        //   "read": false,
        //   "archived": false
        // },

        const mails = document.createElement('div');
        mails.classList.add('mail');
        mails.setAttribute('data-id', email.id)

        const reci = document.createElement('p');
        reci.classList.add('mail-recipients');
        reci.innerHTML = email.recipients;
        mails.appendChild(reci);

        const sub = document.createElement('p');
        sub.classList.add('mail-subject');
        sub.innerHTML = email.subject;
        mails.appendChild(sub);

        const time = document.createElement('p');
        time.classList.add('mail-time');
        time.innerHTML = email.timestamp;
        mails.appendChild(time);

        emailView.appendChild(mails)

      })

      document.querySelectorAll('.mail').forEach(function(mail) {
        mail.addEventListener('click', function(event) {
          const id = event.target.parentElement.dataset.id;
          mail_view(id)
        });
      });
  });
}

function send_email() {

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  console.log(recipients, subject, body)

  fetch('/emails', {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    })
  })
  .then(response => response.JSON())
  .then(result => {
    // TODO : display message
    let message = document.querySelector('#message');
    message.innerHTML =  result;

  });
}

function mail_view(id){

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'block';

  const mail_view = document.querySelector('#mail-view');
  mail_view.innerHTML = '';

  const mail = document.createElement('div');
  const from = document.createElement('p');
  const to = document.createElement('p');
  const subject = document.createElement('p');
  const timestamp = document.createElement('p');
  const body = document.createElement('p');

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      from.innerHTML = `From: ${email.sender}`;
      to.innerHTML = `To: ${email.recipients}`;
      subject.innerHTML = `Subject: ${email.subject}`;
      timestamp.innerHTML = `Timestamp: ${email.timestamp}`;
      body.innerHTML = email.body;

      console.log(body)
  });

  mail.appendChild(from);
  mail.appendChild(to);
  mail.appendChild(subject);
  mail.appendChild(timestamp);
  mail.appendChild(body);

  mail_view.appendChild(mail)

}