/**
 * @file src/config/events.ts
 * @description Centralized, typed DOM CustomEvent names for Hidaya inter-component communication.
 */

export const HIDAYA_EVENTS = {
  PLAYBACK_STATE: 'hidaya-playback-state',
  PLAYBACK_OWNER: 'hidaya-playback-owner',
  GLOBAL_TOGGLE_PLAY: 'hidaya-global-toggle-play',
  OFFLINE_CACHE_UPDATED: 'hidaya-offline-cache-updated',
  PREFERENCES_UPDATED: 'hidaya-preferences-updated',
  MUTE_STATE: 'hidaya-mute-state',
} as const;

export type HidayaEventType = typeof HIDAYA_EVENTS[keyof typeof HIDAYA_EVENTS];
