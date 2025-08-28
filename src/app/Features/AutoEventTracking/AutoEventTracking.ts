import { v4 as uuid } from 'uuid';
import { BaseFeature } from '../BaseFeature';
import { Settings } from '../../Settings';
import { getEditingBlock, interceptFunction } from '../../Utils';
import {
  ENTERING_TRACKING_ACTION,
  LEAVING_TRACKING_ACTIONS,
} from './Constants';
import { BlipAction } from '../../types';

const OPEN_BUILDER_NODE_EVENT = 'debouncedEditState';

export class AutoEventTracking extends BaseFeature {
  public static shouldRunOnce = true;

  public handle(): boolean {
    if (Settings.isAutoEventTrackingActive) {
      interceptFunction(OPEN_BUILDER_NODE_EVENT, this.addEventTrackingsToBlock);
    }

    return true;
  }

  private addEventTrackingsToBlock(): void {
    const block = getEditingBlock();

    const isNewBlock =
      block &&
      block.$enteringCustomActions.length === 0 &&
      block.$leavingCustomActions.length === 0;

    if (!isNewBlock) {
      return;
    }

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
        action: ENTERING_TRACKING_ACTION.settings.action.replace(
          '{{blockName}}',
          block.$title
        ),
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
        conditions: [],
        settings: {
          ...template.settings,
          action: template.settings.action.replace(
            '{{blockName}}',
            block.$title
          ),
        },
      };
      block.$leavingCustomActions.push(leavingAction);
    });
  }
}



