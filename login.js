document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    if (sessionStorage.getItem('currentUser')) {
        window.location.href = 'dashboard.html';
        return;
    }

    const inputs = document.querySelectorAll('.input-wrapper input');
    inputs.forEach(input => {
        input.addEventListener('focus', (e) => {
            e.target.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', (e) => {
            if (!e.target.value) {
                e.target.parentElement.classList.remove('focused');
            }
        });
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            showError('Please enter both username and password');
            return;
        }

        try {
            const response = await fetch('users.json');
            const data = await response.json();

            const user = data.users.find(u =>
                u.username.toLowerCase() === username.toLowerCase() &&
                u.password === password
            );

            if (user) {
                const userSession = {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    rank: user.rank,
                    badgeNumber: user.badgeNumber,
                    loginTime: new Date().toISOString(),
                    onDuty: false
                };

                sessionStorage.setItem('currentUser', JSON.stringify(userSession));

                loginForm.classList.add('success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 800);
            } else {
                showError('Invalid credentials. Access denied.');
                shakeForm();
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('System Fehler bitte erneut Probieren');
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.classList.add('show');
        }, 10);
    }

    function shakeForm() {
        loginForm.classList.add('shake');
        setTimeout(() => {
            loginForm.classList.remove('shake');
        }, 500);
    }

    createStars();
});

function createStars() {
    const starsContainer = document.querySelector('.stars');
    const twinklingContainer = document.querySelector('.twinkling');

    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        starsContainer.appendChild(star);
    }

    for (let i = 0; i < 50; i++) {
        const twinkle = document.createElement('div');
        twinkle.className = 'twinkle';
        twinkle.style.left = `${Math.random() * 100}%`;
        twinkle.style.top = `${Math.random() * 100}%`;
        twinkle.style.animationDelay = `${Math.random() * 5}s`;
        twinklingContainer.appendChild(twinkle);
    }
}
