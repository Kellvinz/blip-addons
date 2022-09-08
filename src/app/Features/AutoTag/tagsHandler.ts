import { v4 as uuid } from 'uuid';
import { Settings } from '~/Settings';
import {
  BlipActionType,
  BlipContentAction,
  BlipFlowBlock,
  BlipTag,
  BlipTypeTags,
} from '~/types';
import { getBlockById, getUniqActions } from '~/Utils';

/**
 * Updates the tags of a given block
 *
 * @param blockId block that will have it's tags updated
 */
export const updateTags = (blockId: string): void => {
  if (!blockId) return;

  const block = getBlockById(blockId);
  const customTags = block.$tags.filter(isDifferentOfActionTag);
  block.$tags = customTags;

  setTagsForBlockActions(block);
  setTagForBlockMessages(block);
  setTagForUserInput(block);
};

/**
 * Creates a new tag for the given action type
 *
 * @param actionType action that will have its tag created
 */
const createTag = (actionType: BlipTypeTags): BlipTag => {
  const tagId = `blip-tag-${uuid()}`;
  const tagColor = getTagColor(actionType);

  return {
    id: tagId,
    label: actionType,
    background: tagColor,
    canChangeBackground: false,
  };
};

/**
 * Returns a color for a tag given the action type
 *
 * @param actionType action that will get the color
 */
const getTagColor = (actionType: BlipTypeTags): string => {
  const matchedAction = Settings.personalTags.filter(
    (tag) => tag.name === actionType
  )[0];

  return matchedAction ? matchedAction?.color : '';
};

const isDifferentOfActionTag = (tag: BlipTag): boolean => {
  return !(
    Settings.personalTags.filter(
      (personalTags) => personalTags.name === tag.label
    ).length > 0
  );
};

const setTagsForBlockActions = (block: BlipFlowBlock): void => {
  const actionsType = getUniqActions(block);

  actionsType.forEach((actionType: BlipActionType) => {
    setTag(block, actionType);
  });
};

const setTagForUserInput = (block: BlipFlowBlock): void => {
  const inputAction = getInputAction(block);
  const hasInputOnBlock = !inputAction.input.bypass;

  if (hasInputOnBlock) {
    setTag(block, 'UserInput');
  }
};

const setTagForBlockMessages = (block: BlipFlowBlock): void => {
  const blockAction = getActionsFromBlock(block);

  if (blockAction) {
    const blockHasMessage = blockAction.action.type === 'SendMessage';

    if (blockHasMessage) {
      setTag(block, 'SendMessage');
    }
  }
};

const getInputAction = (block: BlipFlowBlock): BlipContentAction =>
  block.$contentActions.find((contentAction) => contentAction['input']);

const getActionsFromBlock = (block: BlipFlowBlock): BlipContentAction =>
  block.$contentActions.find((contentAction) => contentAction['action']);

const setTag = (block: BlipFlowBlock, actionType: BlipTypeTags): void => {
  const newTag = createTag(actionType);
  if (newTag) {
    block.$tags.push(newTag);
  }
};
