export class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.sessionTimeout = null;
  }

  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async login(username, password) {
    try {
      const response = await fetch('/data/users.json');
      const data = await response.json();
      const hashedPassword = await this.hashPassword(password);

      const user = data.users.find(u =>
        u.username === username && u.password === hashedPassword
      );

      if (user) {
        this.currentUser = { ...user };
        delete this.currentUser.password;

        this.currentUser.status = 'online';
        this.currentUser.lastLogin = new Date().toISOString();

        sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.startSessionTimeout();

        return { success: true, user: this.currentUser };
      }

      return { success: false, error: 'Ungültige Anmeldedaten' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Systemfehler' };
    }
  }

  logout() {
    if (this.currentUser) {
      this.currentUser.status = 'offline';
    }

    this.currentUser = null;
    sessionStorage.removeItem('currentUser');

    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }
  }

  checkSession() {
    const stored = sessionStorage.getItem('currentUser');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      this.startSessionTimeout();
      return true;
    }
    return false;
  }

  startSessionTimeout() {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    this.sessionTimeout = setTimeout(() => {
      alert('Session abgelaufen. Bitte erneut anmelden.');
      this.logout();
      window.location.reload();
    }, 3600000);
  }

  hasPermission(requiredRole) {
    if (!this.currentUser) return false;

    const roleHierarchy = {
      'admin': 3,
      'supervisor': 2,
      'employee': 1
    };

    const userLevel = roleHierarchy[this.currentUser.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  }

  getCurrentUser() {
    return this.currentUser;
  }
}
