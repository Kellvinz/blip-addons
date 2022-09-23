import { getBlocks } from '~/Utils';
import { BaseFeature } from '@features/BaseFeature';

import { updateTags } from './tagsHandler';

export class InitializeTags extends BaseFeature {
  public static shouldRunOnce = true;

  /**
   * Updates the tags of all blocks
   */
  public handle(): boolean {
    const blocks = getBlocks();

    blocks.forEach((block) => {
      updateTags(block.id);
    });

    return true;
  }
}
