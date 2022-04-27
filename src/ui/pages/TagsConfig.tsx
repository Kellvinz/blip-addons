import {
  BlipAccordion,
  BlipAccordionBody,
  BlipAccordionButton,
  BlipAccordionHeader,
  BlipAccordionItem,
  Block,
  Flex,
  Paragraph,
} from '@components';

import { SketchPicker } from 'react-color';
import * as React from 'react';
import { Tag } from '~/types';
import { PRESET_COLORS } from '@features/EditBlocks/Colors';

export const TagsConfig = (): JSX.Element => {
  const FIXED_TAGS: Tag[] = [
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


  const getAccorionItems = (defaultTags: Tag[]): JSX.Element[] => {
    const defaultTagsMapped = defaultTags.map((tag: Tag, index: number) => {
      return (
        <>
          <BlipAccordionItem borderTop={0} key={index}>
            <BlipAccordionHeader>
              <Flex className="justify-between">
                <BlipAccordionButton title={tag.name} />
                <span
                  style={{
                    width: '18px',
                    borderRadius: '50%',
                    height: '100%',
                    backgroundColor: tag.color,
                  }}
                >
                    teste
                </span>
              </Flex>
            </BlipAccordionHeader>
            <BlipAccordionBody>
              <div>
                <SketchPicker
                  color={tag.color}
                  presetColors={PRESET_COLORS}
                />
              </div>
            </BlipAccordionBody>
          </BlipAccordionItem>
        </>
      );
    });

    console.log('teste = ', defaultTagsMapped);

    return defaultTagsMapped;
  };

  return (
    <Block padding={0}>
      <Paragraph>Algum titulo legal sobre TAGS</Paragraph>

      <Block marginTop={2} marginBottom={2}>
        <Block width="100%">
          <BlipAccordion>{getAccorionItems(FIXED_TAGS)}</BlipAccordion>
        </Block>
      </Block>
    </Block>
  );
};
