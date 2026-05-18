import { writable } from "svelte/store";

// Tracks current station (0, 1, 2)
export const activeStation = writable(0);