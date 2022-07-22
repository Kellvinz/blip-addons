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
  personalTags: [
    {
      name: 'ExecuteScript',
      color: '#FF961E',
    },
    {
      name: 'TrackEvent',
      color: '#61D36F',
    },
    {
      name: 'ManageList',
      color: '#1EDEFF',
    },
    {
      name: 'Redirect',
      color: '#1EA1FF',
    },
    {
      name: 'MergeContact',
      color: '#FF1E90',
    },
    {
      name: 'ProcessHttp',
      color: '#7762E3',
    },
    {
      name: 'SetVariable',
      color: '#FF4A1E',
    },
    {
      name: 'ProcessCommand',
      color: '#FC91AE',
    },
    {
      name: 'ProcessContentAssistant',
      color: '#6B6B6B',
    }
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
