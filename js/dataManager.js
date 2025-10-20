export class DataManager {
  constructor() {
    this.cache = {
      users: null,
      vehicles: null,
      patrols: null,
      incidents: null,
      messages: null,
      config: null
    };
  }

  async loadData(type) {
    try {
      const response = await fetch(`/data/${type}.json`);
      const data = await response.json();
      this.cache[type] = data;
      return data;
    } catch (error) {
      console.error(`Error loading ${type}:`, error);
      return null;
    }
  }

  async getUsers() {
    if (!this.cache.users) {
      await this.loadData('users');
    }
    return this.cache.users?.users || [];
  }

  async getVehicles() {
    if (!this.cache.vehicles) {
      await this.loadData('vehicles');
    }
    return this.cache.vehicles?.vehicles || [];
  }

  async getPatrols() {
    if (!this.cache.patrols) {
      await this.loadData('patrols');
    }
    return this.cache.patrols?.patrols || [];
  }

  async getIncidents() {
    if (!this.cache.incidents) {
      await this.loadData('incidents');
    }
    return this.cache.incidents?.incidents || [];
  }

  async getMessages() {
    if (!this.cache.messages) {
      await this.loadData('messages');
    }
    return this.cache.messages?.messages || [];
  }

  async getConfig() {
    if (!this.cache.config) {
      await this.loadData('config');
    }
    return this.cache.config;
  }

  updateLocalUser(userId, updates) {
    if (this.cache.users && this.cache.users.users) {
      const userIndex = this.cache.users.users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        this.cache.users.users[userIndex] = {
          ...this.cache.users.users[userIndex],
          ...updates
        };
      }
    }
  }

  updateLocalVehicle(vehicleId, updates) {
    if (this.cache.vehicles && this.cache.vehicles.vehicles) {
      const vehicleIndex = this.cache.vehicles.vehicles.findIndex(v => v.id === vehicleId);
      if (vehicleIndex !== -1) {
        this.cache.vehicles.vehicles[vehicleIndex] = {
          ...this.cache.vehicles.vehicles[vehicleIndex],
          ...updates
        };
      }
    }
  }

  addPatrol(patrol) {
    if (this.cache.patrols) {
      this.cache.patrols.patrols.push(patrol);
    }
  }

  updatePatrol(patrolId, updates) {
    if (this.cache.patrols && this.cache.patrols.patrols) {
      const patrolIndex = this.cache.patrols.patrols.findIndex(p => p.id === patrolId);
      if (patrolIndex !== -1) {
        this.cache.patrols.patrols[patrolIndex] = {
          ...this.cache.patrols.patrols[patrolIndex],
          ...updates
        };
      }
    }
  }

  removePatrol(patrolId) {
    if (this.cache.patrols && this.cache.patrols.patrols) {
      this.cache.patrols.patrols = this.cache.patrols.patrols.filter(p => p.id !== patrolId);
    }
  }

  addIncident(incident) {
    if (this.cache.incidents) {
      this.cache.incidents.incidents.push(incident);
    }
  }

  addMessage(message) {
    if (this.cache.messages) {
      this.cache.messages.messages.unshift(message);
    }
  }

  clearCache() {
    this.cache = {
      users: null,
      vehicles: null,
      patrols: null,
      incidents: null,
      messages: null,
      config: null
    };
  }
}
