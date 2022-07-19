import { BaseFeature } from '../../BaseFeature';
import {
  createConfirmationAlert,
  getBlocks,
  removeOverlay,
  showSuccessToast,
} from '~/Utils';
import { Paragraph } from '@components';
import * as React from 'react';
import { BdsButton } from 'blip-ds/dist/blip-ds-react';

const TRACKING_ACTION_NAME = 'TrackEvent';
const EMPTY_STRING = '';
const NOT_EQUAL_CONDITION = 'notEquals';
const NOT_EXISTS_CONDITION = 'notExists';
const DEFAULT_USER_INPUT_VARIABLE = 'input.content';
const DEFAULT_USER_INPUT_SOURCE = 'input';
const DEFAULT_COMPARISON = 'exists';
const DEFAULT_CONDITION_SOURCE = 'context';

export class TrackingsInconsistencies extends BaseFeature {
  // public static isUserTriggered = true
  // public static shouldRunOnce = true;
  /**
   * Check for Inconsistencies on the flow
   */
  public handle(hasToSetVariable: boolean): any {
    const trackingsWithProblems =
      this.voidableTrackingsHandle(hasToSetVariable);

    return {
      trackingMessage: this.getTrackingMessage(trackingsWithProblems),
      hasTrackings: trackingsWithProblems.length > 0,
    };
  }

  private voidableTrackingsHandle = (isToCorrect: boolean): any[] => {
    let trackingsWithProblems = [];
    const blocks = getBlocks();

    if (isToCorrect) {
      this.fixVoidableTrackings(blocks);
    } else {
      trackingsWithProblems = this.getVoidableTrackings(blocks);
    }

    return trackingsWithProblems;
  };

  private getVoidableTrackings = (blocks: any): any[] => {
    let trackingActionsArray = [];
    const trackingsWithProblems = [];

    for (const block of blocks) {
      trackingActionsArray = getTrackingEventActions(block);
      for (const trackingAction of trackingActionsArray) {
        if (actionCanBeNull(trackingAction)) {
          trackingsWithProblems.push(trackingAction);
        }
      }
    }

    return trackingsWithProblems;
  };

  private fixVoidableTrackings = (blocks: any): void => {
    let trackingActionsArray = [];

    for (const block of blocks) {
      trackingActionsArray = getTrackingEventActions(block);
      for (const trackingAction of trackingActionsArray) {
        if (actionCanBeNull(trackingAction)) {
          setVariableExistingCondition(trackingAction);
        }
      }
    }
  };

  private handleSubmit = (): void => {
    createConfirmationAlert({
      onCancel: () => removeOverlay(),
      onConfirm: () => {
        this.handle(true);
        removeOverlay();
        showSuccessToast('Trackings Corrigidas!');
      },
    });
  };

  private getTrackingMessage = (list: string[]): any => {
    return (
      <>
        <h4>Trackings</h4>

        {list.length > 0 ? (
          this.getTrackingsErrorMessage(list)
        ) : (
          <Paragraph>
            Nenhuma tracking com ação potencialmente nula identificada
          </Paragraph>
        )}
      </>
    );
  };

  private getTrackingsErrorMessage = (list: any[]): any => {
    return (
      <>
        <ul
          style={{
            fontSize: '0.875rem',
            marginTop: '0.5rem',
            color: '#607b99',
          }}
        >
          {list.map((ta, index) => (
            <li key={index}>
              {ta.blockName} - {ta.$title}
            </li>
          ))}
        </ul>

        <Paragraph>
          * Você deve alterar as condições de execução de trackings destes
          blocos para evitar o possíveis erros.
          <br />
          Você pode arrumar esses fluxos automaticamente apertando no botão
          abaixo.
        </Paragraph>

        <BdsButton type="submit" variant="primary" onClick={this.handleSubmit}>
          Corrigir Trackings
        </BdsButton>
      </>
    );
  };
}

const actionCanBeNull = (trackingAction: any): boolean => {
  const conditionVariable = getTrackingActionVariable(trackingAction);

  if (hasConditionVariable(conditionVariable)) {
    const processedConditionVariable = conditionVariable
      .replace('}}', '')
      .replace('{{', '');

    if (
      processedConditionVariable === DEFAULT_USER_INPUT_VARIABLE &&
      !!trackingAction.conditions.find(
        (x) =>
          x.source === DEFAULT_USER_INPUT_SOURCE &&
          x.comparison !== NOT_EQUAL_CONDITION &&
          x.comparison !== NOT_EXISTS_CONDITION
      )
    ) {
      return false;
    }

    return !trackingAction.conditions.find(
      (c) =>
        c.comparison !== NOT_EQUAL_CONDITION &&
        c.comparison !== NOT_EXISTS_CONDITION &&
        c.variable === processedConditionVariable
    );
  } else {
    return false;
  }
};

const setVariableExistingCondition = (trackingAction: any): void => {
  const conditionVariable = getTrackingActionVariable(trackingAction);

  const trackingVariable = conditionVariable
    .replace('{{', '')
    .replace('}}', '');

  const trackingCondition = {
    comparison: DEFAULT_COMPARISON,
    source: DEFAULT_CONDITION_SOURCE,
    values: [],
    variable: trackingVariable,
  };

  trackingAction.conditions.push(trackingCondition);
};

const getTrackingEventActions = (block: any): any => {
  return getAllActions(block).filter(isTracking);
};

const getAllActions = (block: any): any => {
  const blockName = block.$title;

  return [
    ...block.$enteringCustomActions.map((action) =>
      insertBlockNameOnAction(action, blockName)
    ),
    ...block.$leavingCustomActions.map((action) =>
      insertBlockNameOnAction(action, blockName)
    ),
  ];
};

const insertBlockNameOnAction = (action: any, blockName: string): any => {
  return { ...action, blockName: blockName };
};

const getTrackingActionVariable = (trackingAction: any): string => {
  const onlyVariableRegex = /^({{[\w@.]+}})$/i;
  const trackingActionVariable = onlyVariableRegex.exec(
    trackingAction.settings.action
  );

  if (trackingActionVariable) {
    return trackingActionVariable[0];
  }

  return EMPTY_STRING;
};

const isTracking = (action: any): boolean =>
  action.type === TRACKING_ACTION_NAME;

const hasConditionVariable = (conditionVariable: string): boolean =>
  conditionVariable !== EMPTY_STRING;
