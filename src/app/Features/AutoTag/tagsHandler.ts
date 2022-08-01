import { v4 as uuid } from 'uuid';
import { Settings } from '~/Settings';
import { BlipActionType, BlipTag } from '~/types';
import { getBlockById, getUniqActions } from '~/Utils';

/**
 * Updates the tags of a given block
 *
 * @param blockId block that will have it's tags updated
 */
export const updateTags = (blockId: string): void => {
  if (!blockId) return;

  const block = getBlockById(blockId);

  block.$tags = [];
  const actionsType = getUniqActions(block);

  actionsType.forEach((actionType: BlipActionType) => {
    const newTag = createTag(actionType);
    block.$tags.push(newTag);
  });
};

/**
 * Creates a new tag for the given action type
 *
 * @param actionType action that will have its tag created
 */
const createTag = (actionType: BlipActionType): BlipTag => {
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
const getTagColor = (actionType: BlipActionType): string => {
  const matchedAction = Settings.personalTags.filter(
    (tag) => tag.name === actionType
  )[0];

  return matchedAction.color;
};
