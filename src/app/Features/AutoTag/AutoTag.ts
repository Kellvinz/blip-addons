import { BaseFeature } from '@features/BaseFeature';
import { switchBlipFunction, getController, interceptFunction, getEditingBlock } from '~/Utils';

import { updateTags } from './utilsTags';

const SIDEBAR_BLIP_SERVICE = 'SidebarContentService';
const OPEN_BUILDER_NODE_EVENT = 'debouncedEditState';
const CLOSE_OPEN_SIDEBAR_EVENT = 'closeSidebar';


export class AutoTag extends BaseFeature {
  public static shouldRunOnce = true;

  public handle(): boolean {
    interceptFunction(OPEN_BUILDER_NODE_EVENT, this.handlerWithTags);

    return true;
  }

  private handlerWithTags(): void {
    const blockId = getEditingBlock().id;
    
    const closeSidebarButton = document.querySelectorAll(
      "span[ng-click^='$ctrl.closeSidebar']"
    );
    closeSidebarButton.forEach((e: Element) => {
      e.addEventListener('click', () => updateTags(blockId));
    });

    switchBlipFunction(CLOSE_OPEN_SIDEBAR_EVENT, () => closeSidebarWithTags(blockId));
  }
}

const closeSidebarWithTags = (blockId: string): void => {
  updateTags(blockId);
  
  const controller = getController();
  controller[SIDEBAR_BLIP_SERVICE].cleanAndClose();
}