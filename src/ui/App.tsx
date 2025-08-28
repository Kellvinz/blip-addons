import * as React from 'react';
import {
  BdsButton,
  BdsButtonIcon,
  BdsIcon,
  BdsTooltip,
} from 'blip-ds/dist/blip-ds-react';

import { Flex } from '@components/Flex';
import { ISSUES_URL } from '~/Constants';
import { setSettings } from '~/Settings';

import { KeywordsConfig } from './pages/KeywordConfig';
import { SnippetsConfig } from './pages/SnippetsConfig';
import { TagsConfig } from './pages/TagsConfig';
import { EventTrackingConfig } from './pages/EventTrackingConfig';

const Pages = {
  keywordConfig: {
    title: 'Configuração de palavra chave',
    component: <KeywordsConfig />,
    icon: 'filter',
  },

  snippetsConfig: {
    title: 'Configuração dos snippets',
    component: <SnippetsConfig />,
    icon: 'file-java-script',
  },

  tagConfig: {
    title: 'Configuração das tags',
    component: <TagsConfig />,
    icon: 'tag',
  },
  eventTrackingConfig: {
    title: 'Configuração de Event Tracking',
    component: <EventTrackingConfig />,
    icon: 'robot',
  },
};

type Page = keyof typeof Pages | 'home';

const openIssue = (): void =>
  chrome.tabs.create({
    active: true,
    url: ISSUES_URL,
  });

export const App = (): JSX.Element => {
  const [page, setPage] = React.useState('home' as Page);

  const goTo = (page: Page) => () => setPage(page);

  React.useEffect(() => {
    chrome.storage.sync.get('settings', (result) => {
      setSettings(result.settings);
    });
  }, []);

  if (page === 'home') {
    return (
      <div style={{ position: 'relative' }}>
        <div style={{ padding: 15 }}>
          <Flex alignItems="center" gap={8}>
            <BdsIcon color="black" name="settings-general" />
            <h2>Configurações do Blip Addons</h2>
          </Flex>

          <div style={{ width: '80%', textAlign: 'left' }}>
            <h3>Recursos</h3>

            {Object.keys(Pages).map((page, i) => (
              <div key={i} style={{ marginBottom: 5 }}>
                <BdsButton
                  icon={Pages[page].icon}
                  variant="secondary"
                  onClick={goTo(page as keyof typeof Pages)}
                >
                  {Pages[page].title}
                </BdsButton>
              </div>
            ))}

            <h3>Endereços externos</h3>

            <BdsButton icon="warning" variant="secondary" onClick={openIssue}>
              Reportar problema
            </BdsButton>
          </div>
        </div>
      </div>
    );
  }

  const currentPage = Pages[page];

  return (
    <div style={{ position: 'relative', padding: 15 }}>
      <div
        className="toast-container"
        style={{
          position: 'absolute',
        }}
      ></div>

      <Flex alignItems="center" gap={5}>
        <BdsTooltip position="right-center" tooltipText="Voltar">
          <BdsButtonIcon
            size="short"
            onClick={goTo('home')}
            variant="secondary"
            icon="arrow-left"
          />
        </BdsTooltip>

        <h2>{currentPage.title}</h2>
      </Flex>

      <div style={{ width: '80%', margin: '0 auto' }}>
        {currentPage.component}
      </div>
    </div>
  );
};
