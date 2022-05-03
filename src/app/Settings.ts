import { SettingsUpdate } from './types';

export const Settings = {
  lastGlobalInactivityTime: '5',
  lastGlobalTrackings: [],
  lastRemovedGlobalTrackings: [],
  isCleanEnviroment: false,
  prodKey: ['prd', 'prod'],
  hmgKey: ['hmg'],
  betaKey: ['beta'],
  devKey: ['dev'],
  personalSnippets: [],
  defaultTags: [
    {
      name: 'Execute script',
      color: '#FF961E',
    },
    {
      name: 'Event Tracking',
      color: '#61D36F',
    },
    {
      name: 'Manage distribution list',
      color: '#1EDEFF',
    },
    {
      name: 'Redirect to service',
      color: '#1EA1FF',
    },
    {
      name: 'Set contact',
      color: '#FF1E90',
    },
    {
      name: 'Process HTTP',
      color: '#7762E3',
    },
    {
      name: 'Set variable',
      color: '#FF4A1E',
    },
    {
      name: 'Process command',
      color: '#FC91AE',
    },
  ]
};

export const mergeSettings = (newSettings: Partial<typeof Settings>): void => {
  Object.assign(Settings, newSettings);
};

export const setSettings = (newSettings: Partial<typeof Settings>): void => {
  mergeSettings(newSettings);

  const isFromServer = Boolean(chrome && chrome.storage);

  const settingsUpdate: SettingsUpdate = {
    isSettingsUpdate: true,
    newSettings: Settings,
    isFromClient: !isFromServer,
  };

  if (isFromServer) {
    chrome.storage.sync.set({ settings: Settings });
  }

  window.postMessage(settingsUpdate, '*');
};
