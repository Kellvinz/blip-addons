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

  private containsBlipVariable(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    const blipVariableRegex = /{{(.*?)}}/;
    return blipVariableRegex.test(value);
  }

  private manageEventTrackings = (): void => {
    console.log('[AutoTracking] manageEventTrackings: Função acionada.');
    setTimeout(() => {
      const block = getEditingBlock();
      if (!block) {
        console.log('[AutoTracking] manageEventTrackings: Bloco não encontrado.');
        return;
      }
      console.log('[AutoTracking] manageEventTrackings: Bloco encontrado:', block.$title);

      const isNewBlock =
        block.$enteringCustomActions.length === 0 &&
        block.$leavingCustomActions.length === 0;

      if (isNewBlock) {
        console.log('[AutoTracking] manageEventTrackings: Bloco novo, adicionando trackings padrão.');
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
    console.log('[AutoTracking] manageHttpRequestTracking: Iniciando sincronização de trackings HTTP.');
    // Sincroniza os trackings para as ações de entrada
    block.$enteringCustomActions = this._syncHttpTrackingsForScope(block.$enteringCustomActions, 'entrada');

    // Sincroniza os trackings para as ações de saída
    block.$leavingCustomActions = this._syncHttpTrackingsForScope(block.$leavingCustomActions, 'saída');
    
    // Atualiza as tags em ambos os casos (adição ou remoção)
    updateTags(block.id);
  }

  private _syncHttpTrackingsForScope(actions: BlipAction[], scope: string): BlipAction[] {
    console.log(`[AutoTracking] _syncHttpTrackingsForScope: Verificando escopo de ${scope}. Ações recebidas:`, actions);
    // Encontra a ação de requisição HTTP neste escopo
    const httpAction = actions.find(action => action.type === 'ProcessHttp');
    console.log(`[AutoTracking] _syncHttpTrackingsForScope: Ação HTTP encontrada no escopo de ${scope}?`, httpAction);

    // Filtra a lista para remover qualquer tracking de API existente neste escopo
    let updatedActions = actions.filter(
      (action) => !action.$title.startsWith('api|')
    );

    // Se uma ação HTTP existir neste escopo, cria e adiciona o tracking de volta
    if (httpAction) {
      console.log(`[AutoTracking] _syncHttpTrackingsForScope: Criando tracking para a ação HTTP no escopo de ${scope}.`);
      const newTracking = this._createHttpRequestTracking(httpAction);
      updatedActions.push(newTracking);
    }
    console.log(`[AutoTracking] _syncHttpTrackingsForScope: Ações atualizadas para o escopo de ${scope}:`, updatedActions);
    return updatedActions;
  }

  private _createHttpRequestTracking = (httpAction: BlipAction): BlipAction => {
    console.log('[AutoTracking] _createHttpRequestTracking: Criando objeto de tracking.');
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
      try {
        extras['body'] = JSON.parse(httpAction.settings.body);
      } catch (e) {
        extras['body'] = httpAction.settings.body;
      }
    }
    
    if (httpAction.settings.headers) {
      extras['headers'] = JSON.stringify(httpAction.settings.headers);
    }
    console.log('[AutoTracking] _createHttpRequestTracking: Objeto "extras" montado:', extras);

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
    console.log('[AutoTracking] _createHttpRequestTracking: Ação de tracking final criada:', newTrackingAction);
    return newTrackingAction;
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