const Events = {
  subscribers: {},
  publish(eventName, data) {
    if (this.subscribers[eventName]) {
      this.subscribers[eventName].forEach((callback) => {
        callback(data);
      });
    }
  },
  subscribe(eventName, callback) {
    if (!this.subscribers[eventName]) {
      this.subscribers[eventName] = [];
    }
    this.subscribers[eventName].push(callback);
  },
  unsubscribe(eventName, callback) {
    if (this.subscribers[eventName]) {
      for (let i = 0; i < this.subscribers[eventName].length; i++) {
        if (this.subscribers[eventName][i] === callback) {
          this.subscribers[eventName].splice(i, 1);
          break;
        }
      }
    }
  }
};

export default Events;