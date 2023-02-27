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

        const mails = document.createElement('div');
        mails.classList.add('mail');
        mails.setAttribute('data-id', email.id);

        if (!email.read && mailbox==='inbox'){
          mails.classList.add('unread')
        }
        const reci = document.createElement('p');
        if (mailbox === 'sent') {
          reci.innerHTML = email.recipients;
        }
        else {
          reci.innerHTML = email.sender;
        }
        reci.classList.add('mail-sender');
        mails.appendChild(reci);

        const sub = document.createElement('p');
        sub.classList.add('mail-subject');
        sub.innerHTML = email.subject;
        mails.appendChild(sub);

        // If user in inbox create archive button 
        // Else Unarchive button
        const archive = document.createElement('button');
        archive.classList.add('btn', 'btn-sm', 'btn-outline-primary');
        if (mailbox === 'inbox'){
          archive.innerText = 'Archive';
          archive.classList.add('archive')
          mails.appendChild(archive);

        } else if (mailbox === 'archive') {
          archive.innerText = 'Unarchive';
          archive.classList.add('unarchive')
          mails.appendChild(archive);
        }
        

        const time = document.createElement('p');
        time.classList.add('mail-time');
        time.innerHTML = email.timestamp;
        mails.appendChild(time);

        emailView.appendChild(mails)

      })

      // Action for User click
      const archive = document.querySelector('.archive');
      const unarchive = document.querySelector('.unarchive');

      document.querySelectorAll('.mail').forEach(function(mail) {
        mail.addEventListener('click', function(event) {

          const id = event.target.parentElement.dataset.id;

          //If user clicks archive button then archive the email
          if (event.target === archive){
            fetch(`/emails/${id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: true
              })
            });
            location.reload(true);
          // Clicks unarchive button the unarchive email
          } else if (event.target === unarchive) {
            fetch(`/emails/${id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: false
              })
            });
            load_mailbox('inbox');
            // Reload the current data
            location.reload(true);
          // else show the email
          } else {
            mail_view(id);
          }

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

  // Change mails: read to true
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'block';

  // Select all elements
  const from = document.querySelector('.from')
  const to = document.querySelector('.to');
  const subject = document.querySelector('.subject');
  const timestamp = document.querySelector('.timestamp');
  const body = document.querySelector('.body');

  // Get the mail data
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Put values in elements
      from.innerHTML = `<b>From: </b>${email.sender}`;
      to.innerHTML = `<b>To: </b>${email.recipients}`;
      subject.innerHTML = `<b>Subject: </b>${email.subject}`;
      timestamp.innerHTML = `<b>Timestamp: </b>${email.timestamp}`;

      body.innerHTML = email.body.replace(/\n/g, '<br>');

      // Reply button action
      document.querySelector('.reply').addEventListener('click', () => reply_mail(id));
  });
}



function reply_mail(id) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#mail-view').style.display = 'none';


  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    
    let subject = email.subject;
    if (!subject.startsWith('Re:')) {
        subject = `Re: ${subject}`;
    }

    let body = `On ${email.timestamp} ${email.sender} wrote: ${email.body}\n`

    document.querySelector('#compose-recipients').value = email.sender;

    document.querySelector('#compose-subject').value = subject;

    document.querySelector('#compose-body').value = body;

  });
}