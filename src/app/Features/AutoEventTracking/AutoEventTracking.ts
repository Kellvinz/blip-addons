import { v4 as uuid } from 'uuid';
import { BaseFeature } from '../BaseFeature';
import { Settings } from '../../Settings';
import {
  getEditingBlock,
  interceptFunction,
  getController,
  getInputAction,
  getAllActions,
} from '../../Utils';
import {
  ENTERING_TRACKING_ACTION,
  HTTP_REQUEST_TRACKING_ACTION,
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
    this.previousBypassValue = true;
  }

  public handle(): boolean {
    if (Settings.isAutoEventTrackingActive) {
      interceptFunction(OPEN_BUILDER_NODE_EVENT, this.manageEventTrackings);
    }
    return true;
  }

  private isBlipVariable(value: any): boolean {
    return typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}');
  }

  private manageEventTrackings = (): void => {
    setTimeout(() => {
      const block = getEditingBlock();
      if (!block) {
        return;
      }

      const isNewBlock =
        block.$enteringCustomActions.length === 0 &&
        block.$leavingCustomActions.length === 0;

      if (isNewBlock) {
        this.addEventTrackingsToBlock(block);
      }

      this.manageInputTrackings(block);
      this.manageHttpRequestTracking(block);
    }, 100);
  };

  private manageInputTrackings = (block: BlipFlowBlock): void => {
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

  private manageHttpRequestTracking = (block: BlipFlowBlock): void => {
    const allActions = getAllActions(block);
    const httpAction = allActions.find(action => action.type === 'ProcessHttp');

    // Primeiro, remove qualquer tracking de API existente para evitar duplicatas.
    block.$leavingCustomActions = block.$leavingCustomActions.filter(
      (action) => !action.$title.startsWith('api|')
    );

    // Se a ação HTTP existir, adiciona o tracking novamente.
    if (httpAction) {
      this._addHttpRequestTracking(block, httpAction);
    }
    
    // Atualiza as tags em ambos os casos (adição ou remoção)
    updateTags(block.id);
  }

  private _addHttpRequestTracking = (block: BlipFlowBlock, httpAction: BlipAction): void => {
    const extras = {};

    // Variáveis de resposta
    if (httpAction.settings.responseStatusVariable) {
      extras['status'] = `{{${httpAction.settings.responseStatusVariable}}}`;
    }
    if (httpAction.settings.responseBodyVariable) {
      extras['response'] = `{{${httpAction.settings.responseBodyVariable}}}`;
    }

    // Dados da requisição
    if (httpAction.settings.uri) {
      extras['uri'] = httpAction.settings.uri;
    }
    if (httpAction.settings.body) {
      extras['body'] = this.isBlipVariable(httpAction.settings.body)
        ? httpAction.settings.body
        : JSON.stringify(httpAction.settings.body);
    }
    if (httpAction.settings.headers) {
      extras['headers'] = JSON.stringify(httpAction.settings.headers);
    }

    const newTrackingAction: BlipAction = {
      $id: uuid(),
      $invalid: false,
      $title: HTTP_REQUEST_TRACKING_ACTION.$title,
      $typeOfContent: 'text',
      type: 'TrackEvent',
      conditions: [],
      settings: {
        ...HTTP_REQUEST_TRACKING_ACTION.settings,
        extras: extras
      }
    };

    block.$leavingCustomActions.push(newTrackingAction);
  };

  private addEventTrackingsToBlock(block: BlipFlowBlock): void {
    // Adiciona tracking de entrada
    const enteringAction: BlipAction = {
      $id: uuid(),
      $invalid: false,
      $title: ENTERING_TRACKING_ACTION.$title,
      $typeOfContent: 'text',
      type: 'TrackEvent',
      conditions: [],
      settings: {
        ...ENTERING_TRACKING_ACTION.settings,
      }
    };
    block.$enteringCustomActions.push(enteringAction);

    // Adiciona trackings de saída
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
          extras: template.settings.extras
        }
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




