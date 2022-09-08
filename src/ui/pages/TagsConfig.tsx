import * as React from 'react';
import {
  Flex,
  Block,
  Circle,
  Paragraph,
  BlipAccordion,
  HorizontalStack,
  BlipAccordionBody,
  BlipAccordionItem,
  BlipAccordionHeader,
  BlipAccordionButton
} from '@components';

import { Tag } from '~/types';
import { createToast } from '~/Utils';
import { setSettings, Settings } from '~/Settings';
import { BdsButton } from 'blip-ds/dist/blip-ds-react';
import { ColorPalette } from '@features/AutoTag/ColorPalette';

const DEFAULT_TAGS: Tag[] = [
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
  },
  {
    name: 'UserInput',
    color: '#000000',
  },
  {
    name: 'SendMessage',
    color: '#EE82EE',
  }
];

export const TagsConfig = (): JSX.Element => {
  const [colors, setColors] = React.useState(Settings.personalTags);

  React.useEffect(() => {
    chrome.storage.sync.get('settings', ({ settings }) => {
      setColors(settings.personalTags || []);
    });
  }, []);

  const updateSettings = (): void => {
    setSettings({
      personalTags: colors
    });

    createToast({
      toastText: 'Tags atualizadas com sucesso',
      toastTitle: 'Sucesso!',
      variant: 'success',
      duration: 2,
    });
  };

  const setDefaultTags = (): void => {
    setColors([...DEFAULT_TAGS]);

    setSettings({
      personalTags: DEFAULT_TAGS
    });

    createToast({
      toastText: 'Tags atualizadas com sucesso',
      toastTitle: 'Sucesso!',
      variant: 'success',
      duration: 2,
    });
  };

  const onColorChange = (color: any, index: string): void => {
    colors[index].color = color.hex;
    setColors([...colors]);
  };

  const getAccorionItems = (colors: Tag[]): JSX.Element[] => {
    const defaultTagsMapped = colors.map((tag: Tag, index: number) => {
      return (
        <>
          <BlipAccordionItem borderTop={0} key={index}>
            <BlipAccordionHeader key={index}>
              <Flex className="justify-between" alignItems="center">
                <BlipAccordionButton title={tag.name} />
                <Circle width={20} height={20} backgroundColor={tag.color} />
              </Flex>
            </BlipAccordionHeader>
            <BlipAccordionBody>
              <ColorPalette
                id={index.toString()}
                onColorChange={onColorChange}
                defaultColor={tag.color}
              />
            </BlipAccordionBody>
          </BlipAccordionItem>
        </>
      );
    });

    return defaultTagsMapped;
  };

  return (
    <Block padding={0}>
      <Paragraph>Modifique as suas tags e torne elas únicas!</Paragraph>

      <Block marginTop={2} marginBottom={2}>
        <Block width="100%">
          <BlipAccordion>{getAccorionItems(colors)}</BlipAccordion>
        </Block>
        <HorizontalStack marginTop={2}>
          <BdsButton variant="delete" onClick={setDefaultTags}>
            Voltar ao Padrão
          </BdsButton>
          <BdsButton type="submit" variant="primary" onClick={updateSettings}>
            Salvar
          </BdsButton>
        </HorizontalStack>
      </Block>
    </Block>
  );
};
