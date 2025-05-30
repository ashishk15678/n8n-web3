import { ipcMain, BrowserWindow } from "electron";

/**
 * StateStore - A simple state management system for Electron apps
 * Handles state updates and synchronization between main and renderer processes
 */
class StateStore {
  constructor(initialState = {}) {
    this.state = initialState;
    this.subscribers = new Set();
    this.setupIpcHandlers();
  }

  /**
   * Set up IPC handlers for state synchronization
   * @private
   */
  setupIpcHandlers() {
    // Handle state update requests from renderer
    ipcMain.on("state:update", (event, { key, value }) => {
      this.setState(key, value);
      // Notify all renderers about the state change
      this.notifySubscribers();
    });

    // Handle state get requests from renderer
    ipcMain.handle("state:get", (event, key) => {
      return key ? this.state[key] : this.state;
    });

    // Handle subscription requests
    ipcMain.on("state:subscribe", (event) => {
      const windowId = event.sender.id;
      this.subscribers.add(windowId);

      // Send initial state to new subscriber
      event.sender.send("state:update", this.state);
    });

    // Handle unsubscribe requests
    ipcMain.on("state:unsubscribe", (event) => {
      const windowId = event.sender.id;
      this.subscribers.delete(windowId);
    });
  }

  /**
   * Update state and notify all subscribers
   * @param {string} key - State key to update
   * @param {any} value - New value
   */
  setState(key, value) {
    this.state = {
      ...this.state,
      [key]: value,
    };
    this.notifySubscribers();
  }

  /**
   * Get current state or specific state key
   * @param {string} [key] - Optional key to get specific state value
   * @returns {any} State value(s)
   */
  getState(key) {
    return key ? this.state[key] : this.state;
  }

  /**
   * Notify all subscribed windows about state changes
   * @private
   */
  notifySubscribers() {
    for (const windowId of this.subscribers) {
      const window = BrowserWindow.fromId(windowId);
      if (window && !window.isDestroyed()) {
        window.webContents.send("state:update", this.state);
      } else {
        // Clean up destroyed windows
        this.subscribers.delete(windowId);
      }
    }
  }
}

// Create and export a singleton instance
export const stateStore = new StateStore({
  // Initial state
  count: 0,
  theme: "light",
  user: null,
  // Add more initial state as needed
});
