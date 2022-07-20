import { BaseFeature } from '@features/BaseFeature';
import { BaseCommand } from '@commands/BaseCommand';

export type Message<Type = unknown> = {
  data: Type;
};

export type BlipsRequest = {
  identifier: string;
  isBlipsRequest: boolean;
  commandCode: string;
  args: any[];
};

export type BlipsResponse = {
  isBlipsResponse: boolean;
  identifier: string;
  result: unknown;
};

export type Command = {
  new (): BaseCommand;
} & typeof BaseCommand;

export type Feature = {
  new (): BaseFeature;
} & typeof BaseFeature;

export type FeatureRequest = {
  code: string;
  type: 'run' | 'cleanup';
  isFeatureRequest: boolean;
  args: any[];
};

export type BlipsCopy = {
  isCopyFromBlips: boolean;
  blocksCode: string;
  originBot: string;
};

export type SettingsUpdate = {
  isSettingsUpdate: true;
  newSettings: Record<string, any>;
  isFromClient: boolean;
};

export type Handshake = {
  isHandshake: boolean;
};

export type Snippet = {
  label: string;
  kind: any;
  documentation: string;
  insertText: string;
};

export type ConditionViewModel = {
  comparison: string;
  source: string;
  values: any[];
  variable: string;
};

export type ConditionActionProblemDetail = {
  blockName: string;
  actionName?: string;
  variable: string;
};

export type BlipFlowBlock = {
  root: boolean;
  id: string;
  $title: string;
  $tags: BlipTags[];
  $position: BlipFlowBlockPosition;
  $enteringCustomActions: BlipAction[];
  $leavingCustomActions: BlipAction[];
  $invalid: boolean;
  $invalidContentActions: boolean;
  $invalidCustomActions: boolean;
  $invalidOutputs: boolean;
  $inputSuggestions: string[];
  $defaultOutput: BlipBlockOutputCondition;
  $conditionOutputs: BlipBlockOutputCondition[];
  $contentActions: BlipContentAction[];
};

export type BlipAction = {
  $id: string;
  $invalid: boolean;
  $title: string;
  $typeOfContent: BlipTypeOfContent;
  $cardContent?: any;
  $type: BlipActionType;
  settings: any;
  conditions: BlipCondiction[];
};

export type BlipContentAction = {
  $$hashKey?: string;
  $invalid: boolean;
  $validationError: any;
  $typeOfContent: string;
  action?: BlipAction;
  input?: BlipInput;
};

export type BlipCondiction = {
  comparison: BlipComparison;
  source: BlipSource;
  values: string[];
  $$hashKey?: string;
};

export type BlipBlockOutputCondition = {
  $id?: string;
  $invalid: boolean;
  $validationError: any;
  conditions?: BlipCondiction[];
  stateId: string;
  typeOfStateId?: string;
  $connId?: string;
  $$hashKey?: string;
};

export type BlipInput = {
  $cardContent?: any;
  $invalid: boolean;
  bypass: boolean;
  expiration?: string;
  validation?: BlipInputValidation;
  variable?: string;
  $$hashKey?: string;
};

export type BlipInputValidation = {
  rule: BlipBlipInputValidationRule;
  error: string;
  regex?: string;
  type?: string;
};

export type BlipTags = {
  background: string;
  canChangeBackground: boolean;
  id: string;
  label: string;
};

export type BlipFlowBlockPosition = {
  top: string;
  left: string;
};

export type BlipBlipInputValidationRule =
  | 'text'
  | 'date'
  | 'type'
  | 'regex'
  | 'number';

export type BlipComparison =
  | 'exists'
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'greaterThanOrEquals'
  | 'lessThanOrEquals'
  | 'approximateTo'
  | 'matches'
  | 'notExists';

export type BlipSource = 'context' | 'intent' | 'entity' | 'input';

export type BlipActionType =
  | 'TrackEvent'
  | 'ProcessHttp'
  | 'MergeContact'
  | 'Redirect'
  | 'ManageList'
  | 'ExecuteScript'
  | 'SetVariable'
  | 'ProcessContentAssistant'
  | 'ProcessCommand';

export type BlipTypeOfContent =
  | 'chat-state'
  | 'text'
  | 'select-immediate'
  | 'media'
  | 'document-select'
  | 'select'
  | 'media-audio'
  | 'media-video'
  | 'media-document'
  | 'send-location'
  | 'ask-location'
  | 'web-link'
  | 'http-content'
  | 'raw-content';
