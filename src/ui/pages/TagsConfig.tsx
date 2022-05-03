import * as React from 'react';
import {
  Flex,
  Block,
  Circle,
  Paragraph,
  BlipAccordion,
  BlipAccordionBody,
  BlipAccordionItem,
  BlipAccordionHeader,
  BlipAccordionButton,
  HorizontalStack,
} from '@components';

import { Tag } from '~/types';
import { ColorPalette } from '@features/AutoTag/ColorPalette';
import { BdsButton } from 'blip-ds/dist/blip-ds-react';
import { createConfirmationAlert, removeOverlay } from '~/Utils';
import { Settings } from '~/Settings';

export const TagsConfig = (): JSX.Element => {
  const defaultTags: Tag[] = [
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
  ];

  const alertBody: JSX.Element = (
    <div>
      Você tem certeza que gostaria de executar esta ação? Isso irá alterar as tags 
      de forma definitiva e você terá que configurar elas novamente se necessário.
    </div>
  );

  const [colors, setColors] = React.useState(Settings.defaultTags);

  const updateSettings = (): void => {
    return;
  };

  const setDefaultTags = (): void => {
    createConfirmationAlert({
      bodyMessage: alertBody,
      onCancel: removeOverlay,
      onConfirm: () => {
        setColors([...defaultTags]);
        removeOverlay();
      },
    });
    return;
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
            <BlipAccordionHeader>
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
      <Paragraph>Algum titulo legal sobre TAGS</Paragraph>

      <Block marginTop={2} marginBottom={2}>
        <Block width="100%">
          <BlipAccordion>{getAccorionItems(colors)}</BlipAccordion>
        </Block>
        <HorizontalStack marginTop={2}>
          <BdsButton variant="delete" onClick={setDefaultTags}>
            Resetar
          </BdsButton>

          <BdsButton type="submit" variant="primary" onClick={updateSettings}>
            Salvar
          </BdsButton>
        </HorizontalStack>
      </Block>
    </Block>
  );
};
