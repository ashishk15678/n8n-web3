import { contextBridge, ipcRenderer } from "electron";

// Create a state management API for the renderer
const stateAPI = {
  // Get state value(s)
  getState: async (key) => {
    return await ipcRenderer.invoke("state:get", key);
  },

  // Update state
  setState: (key, value) => {
    ipcRenderer.send("state:update", { key, value });
  },

  // Subscribe to state changes
  subscribe: (callback) => {
    // Subscribe to state updates
    ipcRenderer.send("state:subscribe");

    // Set up listener for state updates
    const listener = (event, newState) => callback(newState);
    ipcRenderer.on("state:update", listener);

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener("state:update", listener);
      ipcRenderer.send("state:unsubscribe");
    };
  },
};

// Expose the state API to the renderer process
contextBridge.exposeInMainWorld("state", stateAPI);
