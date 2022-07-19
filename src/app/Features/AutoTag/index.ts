import { Settings } from '~/Settings';
import { v4 as uuid } from 'uuid';
import { BaseFeature } from '@features/BaseFeature';
import { killBlipFunction, getBlockById, getController, interceptFunction } from '~/Utils';

export class AutoTag extends BaseFeature {
  public static shouldRunOnce = true;

  private handlerWithTags(): void {
    console.log("debouncedEditState");
    // const createActionsButtons = document.querySelectorAll(
    //   "li[ng-click^='$ctrl.onAddAction']"
    // );

    const controller = getController();
    // console.log("SidebarContentService", controller["SidebarContentService"].openSidebars)
    if (controller["SidebarContentService"].openSidebars.length > 0) {
      console.log("hehe");
      console.log("SidebarContentService", controller["SidebarContentService"].openSidebars)
      console.log("selectedNodes", controller["selectedNodes"])
    }

    const removeActionsButtons = document.querySelectorAll(
      "span[ng-click^='$ctrl.closeSidebar']"
    );

    console.log(removeActionsButtons, "removeActionsButtons");

    const blockId = getBlockId();

    removeActionsButtons.forEach((e: Element) => {
      e.addEventListener('click', () => addTags(blockId));
      
    });

    killBlipFunction('closeSidebar', () => closeSidebar(blockId));

  }

  public handle(): boolean {
    interceptFunction('debouncedEditState', this.handlerWithTags);

    return true;
  }
}

const addTags = (blockId: string): void => {
  console.log("blockId ", blockId)

  const block = getBlockById(blockId);
  block.$tags = [];
  
  const actions = getUniqActions(block);

  const actionsWithoutTags = actions.filter((action) => {
    const blockHasActionTag =
      block.$tags.filter((tag) => tag.label === action).length > 0;
    return !blockHasActionTag;
  });

  console.log('actionsWithoutTags ', actionsWithoutTags);
  actionsWithoutTags.forEach((action) => {
    const tagId = `blip-tag-${uuid()}`;
    const tagByAction = Settings.defaultTags.filter((tag) => tag.name === action)[0];
    const newTag = {
      id: tagId,
      label: action,
      background: tagByAction.color,
      canChangeBackground: false,
    };

    block.$tags.push(newTag);
  });
}

const closeSidebar = (blockId: string): void => {
  addTags(blockId);
  
  const controller = getController();
  controller["SidebarContentService"].cleanAndClose();
  // console.log("hehe")
}

const getAllActions = (block): any[] => {
  const enteringActions = block.$enteringCustomActions;
  const leavingActions = block.$leavingCustomActions;

  return [...enteringActions, ...leavingActions];
};

const getUniqActions = (block): any[] => {
  const allActions = getAllActions(block);
  const typeActions = allActions.map((action) => action.type);

  return [...new Set(typeActions)];
};

const getBlockId = (): string => {
  const builderController = getController();
  const sidebarSettings = builderController['SidebarContentService'];
  const blockId = sidebarSettings.openSidebars[0].sidebarId;

  return blockId;
};