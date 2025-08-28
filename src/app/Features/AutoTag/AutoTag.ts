import { BaseFeature } from '@features/BaseFeature';
import { Settings } from '~/Settings';
import {
  switchBlipFunction,
  getController,
  interceptFunction,
  getEditingBlock
} from '~/Utils';

import { updateTags } from './tagsHandler';

const SIDEBAR_BLIP_SERVICE = 'SidebarContentService';
const OPEN_BUILDER_NODE_EVENT = 'debouncedEditState';
const CLOSE_OPEN_SIDEBAR_EVENT = 'closeSidebar';

export class AutoTag extends BaseFeature {
  public static shouldRunOnce = true;

  /**
   * Intercept the functions of close sidebar, and set the new tags of a given block
   */
  public handle(): boolean {
    if(Settings.isAutoTagActive) {
      interceptFunction(
        OPEN_BUILDER_NODE_EVENT,
        this.interceptCloseSidebarFunctions
      );
    }

    return true;
  }

  /**
   * Intercept the functions of close sidebar
   */
  private interceptCloseSidebarFunctions(): void {
    const block = getEditingBlock();

    if (!block) {
      return;
    }

    const blockId = block.id;

    const closeSidebarButton = document.querySelectorAll(
      "span[ng-click^='$ctrl.closeSidebar']"
    );
    closeSidebarButton.forEach((e: Element) => {
      e.addEventListener('click', () => updateTags(blockId));
    });

    switchBlipFunction(CLOSE_OPEN_SIDEBAR_EVENT, () =>
      closeSidebarWithTags(blockId)
    );
  }
}

/**
 * Set the new tags of a given block and close the sidebar
 *
 * @param blockId block that will have it's tags updated
 */
const closeSidebarWithTags = (blockId: string): void => {
  updateTags(blockId);

  const controller = getController();
  controller[SIDEBAR_BLIP_SERVICE].cleanAndClose();
};
