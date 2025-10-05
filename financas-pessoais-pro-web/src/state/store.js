// Estado global simples com Pub/Sub
class Store {
  constructor() {
    this.state = new Map();
    this.listeners = new Map();
  }

  get(key) {
    return this.state.get(key);
  }

  set(key, value) {
    const previous = this.state.get(key);
    this.state.set(key, value);
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach((callback) => callback(value, previous));
    }
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }
}

const store = new Store();

export default store;
