import { v4 as uuid } from 'uuid';
import { BaseFeature } from '../BaseFeature';
import { Settings } from '../../Settings';
import {
  getEditingBlock,
  interceptFunction,
  getController,
  getInputAction,
} from '../../Utils';
import {
  ENTERING_TRACKING_ACTION,
  LEAVING_TRACKING_ACTIONS,
} from './Constants';
import { updateTags } from '../AutoTag/tagsHandler';
import { BlipAction, BlipFlowBlock } from '../../types';

const OPEN_BUILDER_NODE_EVENT = 'debouncedEditState';

export class AutoEventTracking extends BaseFeature {
  public static shouldRunOnce = true;
  private previousBypassValue: boolean;

  constructor() {
    super();
    this.previousBypassValue = false;
  }

  public handle(): boolean {
    if (Settings.isAutoEventTrackingActive) {
      interceptFunction(OPEN_BUILDER_NODE_EVENT, this.manageEventTrackings);
    }
    return true;
  }

  private manageEventTrackings = (): void => {
    const block = getEditingBlock();
    if (!block) {
      return;
    }

    const isNewBlock =
      block.$enteringCustomActions.length === 0 &&
      block.$leavingCustomActions.length === 0;

    if (isNewBlock) {
      this.addEventTrackingsToBlock(block);
      return;
    }

    this.removeTrackingsOnInputRemoval(block);
  };

  private removeTrackingsOnInputRemoval = (block: BlipFlowBlock): void => {
    const inputAction = getInputAction(block);
    const hasInput = inputAction && !inputAction.input.bypass;

    if (this.previousBypassValue && !hasInput) {
      const trackingsToRemove = ['input', 'inesperado', 'inatividade'];

      block.$leavingCustomActions = block.$leavingCustomActions.filter(
        (action: BlipAction) => {
          const trackingName = action.$title.split('|')[0];
          return !trackingsToRemove.includes(trackingName);
        }
      );
    }

    this.previousBypassValue = hasInput;
  };

  private addEventTrackingsToBlock(block: BlipFlowBlock): void {
    // Add entering tracking
    const enteringAction: BlipAction = {
      $id: uuid(),
      $invalid: false,
      $title: ENTERING_TRACKING_ACTION.$title,
      $typeOfContent: 'text',
      type: 'TrackEvent',
      conditions: [],
      settings: {
        ...ENTERING_TRACKING_ACTION.settings,
        category: ENTERING_TRACKING_ACTION.settings.category
      },
    };
    block.$enteringCustomActions.push(enteringAction);

    // Add leaving trackings
    LEAVING_TRACKING_ACTIONS.forEach((template) => {
      const leavingAction: BlipAction = {
        $id: uuid(),
        $invalid: false,
        $title: template.$title,
        $typeOfContent: 'text',
        type: 'TrackEvent',
        conditions: template.settings.conditions,
        settings: {
          ...template.settings,
          category: template.settings.category,
          extras: template.settings.extras,
        },
      };
      block.$leavingCustomActions.push(leavingAction);
    });

    updateTags(block.id);

    const controller = getController();
    if (controller) {
      controller.$timeout(() => {});
    }
  }
}




