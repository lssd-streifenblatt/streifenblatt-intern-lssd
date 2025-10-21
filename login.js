const WEBHOOKS = {
    login: 'https://discord.com/api/webhooks/1430135460214214737/XmaITkS8ZirsO14a19ka884SyKHhzGQUKiEnmlptz6sjCGlliVXyQtCMUX_Pm_CDFZi0',
    logout: 'https://discord.com/api/webhooks/1430135526513578076/3daUUMAz4AT-7wnVrCbhdq_VQPitWgWGmVqnZ22wNdFlywYDllS1xxjHkWfChylRYeCU'
};

async function sendWebhook(url, data) {
    try {
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error('Webhook error:', error);
    }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    try {
        const response = await fetch('data.json');
        const data = await response.json();

        const user = data.users.find(u => u.username === username && u.password === password);

        if (user) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));

            await sendWebhook(WEBHOOKS.login, {
                embeds: [{
                    title: 'Benutzer Anmeldung',
                    color: 65445,
                    fields: [
                        {
                            name: 'Benutzername',
                            value: user.username,
                            inline: true
                        },
                        {
                            name: 'Dienummer',
                            value: user.dienummer,
                            inline: true
                        },
                        {
                            name: 'Rang',
                            value: user.rank,
                            inline: true
                        },
                        {
                            name: 'Rolle',
                            value: user.role === 'admin' ? 'Administrator' : 'Mitarbeiter',
                            inline: true
                        }
                    ],
                    timestamp: new Date().toISOString()
                }]
            });

            window.location.href = 'dashboard.html';
        } else {
            errorMsg.textContent = 'UNGÜLTIGE ANMELDEDATEN';
            errorMsg.classList.add('show');
            setTimeout(() => {
                errorMsg.classList.remove('show');
            }, 3000);
        }
    } catch (error) {
        errorMsg.textContent = 'SYSTEMFEHLER';
        errorMsg.classList.add('show');
    }
});
