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
  HTTP_REQUEST_TRACKING_ACTION,
  LEAVING_TRACKING_ACTIONS,
} from './Constants';
import { updateTags } from '../AutoTag/tagsHandler';
import { BlipAction, BlipComparison, BlipCondiction, BlipFlowBlock, BlipSource } from '../../types';
import { sources } from 'webpack';

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

  private containsBlipVariable(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    const blipVariableRegex = /{{(.*?)}}/;
    return blipVariableRegex.test(value);
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

    // Sincroniza os trackings para as ações de entrada
    block.$enteringCustomActions = this._syncHttpTrackingsForScope(block.$enteringCustomActions, 'entrada');

    // Sincroniza os trackings para as ações de saída
    block.$leavingCustomActions = this._syncHttpTrackingsForScope(block.$leavingCustomActions, 'saída');

    // Atualiza as tags em ambos os casos (adição ou remoção)
    updateTags(block.id);
  }

  private _syncHttpTrackingsForScope(actions: BlipAction[], scope: string): BlipAction[] {

    // Encontra a ação de requisição HTTP neste escopo
    const httpAction = actions.find(action => action.type === 'ProcessHttp');


    // Filtra a lista para remover qualquer tracking de API existente neste escopo
    let updatedActions = actions.filter(
      (action) => !action.$title.startsWith('api|')
    );

    // Se uma ação HTTP existir neste escopo, cria e adiciona o tracking de volta
    if (httpAction) {

      const newTracking = this._createHttpRequestTracking(httpAction);
      updatedActions.push(newTracking);
    }

    return updatedActions;
  }

  private _createHttpRequestTracking = (httpAction: BlipAction): BlipAction => {

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
      extras['body'] = this.containsBlipVariable(httpAction.settings.body)
        ? httpAction.settings.body
        : JSON.stringify(httpAction.settings.body);
    }
    if (httpAction.settings.headers) {
      extras['headers'] = this.containsBlipVariable(httpAction.settings.headers)
        ? httpAction.settings.headers
        : JSON.stringify(httpAction.settings.headers);
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

    return newTrackingAction;
  };

  private getMenuOptions(block: BlipFlowBlock): string[] {
    if (!Array.isArray(block.$contentActions)) {
      return [];
    }

    const options: string[] = [];
    for (const contentAction of block.$contentActions) {
      const action = contentAction?.action;
      if (!action) continue;

      const isMenu =
        action.$typeOfContent === 'select' ||
        action.$typeOfContent === 'select-immediate';

      if (isMenu) {
        const content = action.settings?.content;
        if (content?.options) {
          for (const option of content.options) {
            // Handle both menu ({ text: '...' }) and quick reply ({ label: { value: '...' }})
            const optionText = option?.text || option?.label?.value;
            if (optionText) {
              options.push(optionText);
            }
          }
        }
      }
    }

    return options;
  }

  private addEventTrackingsToBlock(block: BlipFlowBlock): void {

    const menuOptions = this.getMenuOptions(block);
    const inputConditions: BlipCondiction[] = menuOptions.length > 0
      ? [{
        comparison: 'equals' as BlipComparison,
        source: 'input' as BlipSource,
        values: menuOptions
      }]
      : [];
    const unexpectedConditions = menuOptions.length > 0
      ? menuOptions.map(opt => ({ comparison: 'notEquals' as BlipComparison, source: 'input' as BlipSource, values: [opt] }))
      : [{ comparison: 'notExists' as BlipComparison, source: 'input' as BlipSource, values: [] }];

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

    // Adiciona trackings de saída com condições específicas
    LEAVING_TRACKING_ACTIONS.forEach((template) => {
      let conditions: BlipCondiction[] = [];
      if (template.$title?.startsWith('input|')) {
        conditions = inputConditions;
      } else if (template.$title?.startsWith('inesperado|')) {
        conditions = unexpectedConditions;
      } else if (template.$title?.startsWith('inatividade|')) {
        conditions = [{ comparison: 'notExists' as BlipComparison, source: 'input' as BlipSource, values: [] }];
      }

      const leavingAction: BlipAction = {
        $id: uuid(),
        $invalid: false,
        $title: template.$title,
        $typeOfContent: 'text',
        type: 'TrackEvent',
        conditions,
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
      controller.$timeout(() => { });
    }
  }
}