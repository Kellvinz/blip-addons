import { BaseFeature } from '@features/BaseFeature';
import { switchBlipFunction, getController, interceptFunction, getEditingBlock } from '~/Utils';

import { updateTags } from './utilsTags';

const OPEN_BUILDER_NODE_EVENT = 'debouncedEditState';
const CLOSE_OPEN_SIDEBAR_EVENT = 'closeSidebar';

const SIDEBAR_BLIP_SERVICE = 'SidebarContentService';

export class AutoTag extends BaseFeature {
  public static shouldRunOnce = true;

  public handle(): boolean {
    interceptFunction(OPEN_BUILDER_NODE_EVENT, this.handlerWithTags);

    return true;
  }

  private handlerWithTags(): void {
    const block = getEditingBlock();

    setEventCloseSidebarButton(block);
    switchBlipFunction(CLOSE_OPEN_SIDEBAR_EVENT, () => closeSidebarWithTags(block));
  }
}

const setEventCloseSidebarButton = (block): void => {
  const closeSidebarButton = document.querySelectorAll(
    "span[ng-click^='$ctrl.closeSidebar']"
  );

  closeSidebarButton.forEach((e: Element) => {
    e.addEventListener('click', () => updateTags(block));
  });
};

const closeSidebarWithTags = (block): void => {
  updateTags(block);

  const controller = getController();
  controller[SIDEBAR_BLIP_SERVICE].cleanAndClose();
};
