import { Settings } from '~/Settings';
import { v4 as uuid } from 'uuid';
import { BaseFeature } from '@features/BaseFeature';
import { getBlockById, getController, interceptFunction } from '~/Utils';

export class AutoTag extends BaseFeature {
  public static shouldRunOnce = true;

  private addTags(): void {
    const blockId = getBlockId();
    const block = getBlockById(blockId);

    const actions = getUniqActions(block);

    console.log('actions ', actions);
    console.log('tags ', block.$tags);

    const actionsWithoutTags = actions.filter((action) => {
      const blockHasActionTag =
        block.$tags.filter((tag) => tag.label === action).length > 0;
      return !blockHasActionTag;
    });

    console.log('actionsWithoutTags ', actionsWithoutTags);

    actionsWithoutTags.forEach((action) => {
      const tagId = `blip-tag-${uuid()}`;
      const tagByAction = Settings.defaultTags.filter(tag => tag.name === action)[0];
      const newTag = {
          id: tagId,
          label: action,
          background: tagByAction.color,
          canChangeBackground: false
      };
      const newTags = [...block.$tags, newTag]

      console.log("Settings", Settings.defaultTags);
      console.log("action", action)
      console.log("tagByAction", tagByAction);
      console.log("tagId", tagId);
      console.log("newTag", newTag);

      console.log("------------------------------------------------------------------------")
      console.log("oldTags", block.$tags);
      block.$tags.length = 0;
      // sleep(200);
      block.$tags = newTags;
      console.log("newTags varivael", newTags);
      console.log("newTags", block.$tags);
    //   const tab = document.getElementById('node-content-tab');

    //   const header = tab.getElementsByClassName('sidebar-content-header')[0];
    //   const tagMenuBtn = header.getElementsByTagName('img');

    //   if (tagMenuBtn.length > 0) {
    //     tagMenuBtn[0].click();
    //   }

    //   const tagMenu = header.getElementsByTagName('blip-tags')[0];

    //   const input = tagMenu.getElementsByTagName('input')[0];
    //   input.value = action;
    //   input.dispatchEvent(new Event("input"));
    });
    // console.log("------------------------------------------------------------------------")

    // const htmlBlock = document.getElementById(blockId);
    // console.log("html", htmlBlock)
    // htmlBlock.classList.add('ng-animate', 'invalid-node-add')
    // htmlBlock.setAttribute('data-ng-animate', '2')
    // console.log("htmlBlock classes", htmlBlock.classList);
    // htmlBlock.classList.remove("jtk-drag-selected")

    // htmlBlock.click();
    // this.sleep(30);ng-if="$ctrl.state.$tags.length > 0 || $ctrl.canAddTags"

    // <blip-tags ng-model="$ctrl.state.$tags" ng-if="$ctrl.state.$tags.length > 0 || $ctrl.canAddTags" datatest="state-tags" on-tag-added="$ctrl.onTagAdded($event)" on-tag-removed="$ctrl.onTagRemoved()" on-select-tag-color="$ctrl.onSelectTagColor($event)" can-change-background="true" can-add-options="true" prompt-text-creator="Criar tag" placeholder="Adicionar tag..." can-remove-tags="true" mode="full" options="$ctrl.TagsService.tags" class="builder-sidebar-tags ng-untouched ng-valid ng-not-empty ng-dirty ng-valid-parse" style=""><div id="blip-tags-a3986beb-9e8d-4e17-a3f1-e10005bc932b class=" blip-tags"=""></div><div class="blip-tags" id="ncid-91dd" data-nanocomponent="ncid-91dd" data-onloadid9qosubeyqxf="o83">
    // <div class="blip-tag-wrapper   blip-tag--can-remove" id="ncid-c744" data-nanocomponent="ncid-c744"><div tabindex="0" id="blip-tag-0b53fc73-e8f9-4f32-835f-b5210f7d6847" style="background: #FF1E90" class="blip-tag"><span class="blip-tag__label">MergeContact</span> <span class="blip-tag__remove">x</span></div></div><div class="blip-tag-wrapper   blip-tag--can-remove" id="ncid-7902" data-nanocomponent="ncid-7902"><div tabindex="0" id="blip-tag-82ad84b9-acfe-4ac8-93c7-f6d9ed605380" style="background: #FF961E" class="blip-tag"><span class="blip-tag__label">ExecuteScript</span> <span class="blip-tag__remove">x</span></div></div><div class="bp-input-wrapper blip-select small " id="ncid-5b52" data-nanocomponent="ncid-5b52"><div class="blip-select__shell"><div class="blip-select__content"><div class="blip-select__option__content"><div class="blip-select__content-input"><label class="bp-label bp-c-cloud bp-fw-bold bp-select-hide-label"></label><input placeholder="Adicionar tag..." value="" data-target="blip-select__options-085ddc35-592a-f014-c0f6-f9f74b0fdc4a" class="blip-select__input bp-c-rooftop "></div><div class="blip-select__content-option small hide"><div class="blip-select__content-option-tags"></div><span class="blip-select__content-option-label bp-fs-6"></span> <span class="blip-select__content-option-description bp-fs-8 bp-c-cloud"></span></div></div></div><div class="blip-select__arrow-down blip-select__show-arrow">
    //   <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.99994 13.1639C9.67248 13.1635 9.35568 13.0474 9.1055 12.8361L3.41105 8.05556C3.2768 7.93531 3.19456 7.76758 3.1817 7.58782C3.16884 7.40805 3.22638 7.23032 3.34215 7.0922C3.45791 6.95407 3.62285 6.86636 3.80209 6.8476C3.98134 6.82884 4.16086 6.8805 4.30272 6.99167L9.99994 11.7722L15.6972 7C15.7646 6.93014 15.846 6.87521 15.936 6.83876C16.0261 6.80231 16.1227 6.78515 16.2198 6.78838C16.3169 6.79161 16.4122 6.81517 16.4996 6.85753C16.587 6.89989 16.6645 6.96011 16.7272 7.03431C16.7898 7.1085 16.8363 7.19501 16.8634 7.28826C16.8906 7.38151 16.8979 7.47941 16.8848 7.57566C16.8718 7.6719 16.8387 7.76434 16.7877 7.847C16.7367 7.92966 16.669 8.00071 16.5888 8.05556L10.8944 12.8361C10.6442 13.0474 10.3274 13.1635 9.99994 13.1639Z" fill="#8CA0B3"></path></svg></div></div><div id="blip-select__options-085ddc35-592a-f014-c0f6-f9f74b0fdc4a" class="blip-select__options"><div id="ncid-d7c5" data-nanocomponent="ncid-d7c5"><ul>
    // <li tabindex="0" id="blip-tag-f5eb60d2-5df1-02f6-5eeb-ebeeff1bf9f5" class="blip-select__option" data-nanocomponent="ncid-d866"><span style="background: #FF6F1E" class="blip-tag__label-option">Executa Script</span></li><li tabindex="0" id="blip-tag-bb5f321f-4b13-d1e2-3eed-8022062b0a6e" class="blip-select__option" data-nanocomponent="ncid-a865"><span style="background: #EA4D9C" class="blip-tag__label-option">Process HTTP</span></li><li tabindex="0" id="blip-tag-5aacbd90-7f3b-67e3-f779-d1153ce70395" class="blip-select__option" data-nanocomponent="ncid-0858"><span style="background: #2cc3d5" class="blip-tag__label-option">SetVariable</span></li><li tabindex="0" id="blip-tag-5a8f2e00-fbf2-b144-3e7b-3f47c40783f9" class="blip-select__option" data-nanocomponent="ncid-eacd"><span style="background: #2cc3d5" class="blip-tag__label-option">Redirect</span></li><li tabindex="0" id="blip-tag-d270103b-d583-0905-a314-69bf91f60205" class="blip-select__option" data-nanocomponent="ncid-99d0"><span style="background: #61D36F" class="blip-tag__label-option">TrackEvent</span></li><li tabindex="0" id="blip-tag-5a396c28-73ff-dac4-f13e-dfd9d1e7f382" class="blip-select__option" data-nanocomponent="ncid-d988"><span style="background: #FF961E" class="blip-tag__label-option">sdksdaopkdsaopk</span></li></ul></div></div></div></div></blip-tags>

    // ['diagram-node', 'flex', 'flex-column', 'jtk-draggable', 'jtk-droppable', 'editing-node', 'ng-animate', 'invalid-node-add', value: 'diagram-node flex flex-column jtk-draggable jtk-droppable editing-node ng-animate invalid-node-add']
    // ['diagram-node', 'flex', 'flex-column', 'jtk-draggable', 'jtk-droppable', 'editing-node', 'invalid-node', value: 'diagram-node flex flex-column jtk-draggable jtk-droppable editing-node invalid-node']
    // ACTION FORMART
    // $id: "f4494a1c-80a1-409a-9d26-535004ebd6ec"
    // $invalid: true
    // $title: "Requisição HTTP"
    // $typeOfContent: ""
    // $validationError: Error: The HTTP method is required at new ValidationError (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:16:117156) at ProcessHttpActionSettingsValidator.validate (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:78:96042) at ActionValidator.validate (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:78:107296) at ActionViewModelValidator.validate (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:78:108820) at Validator.isValid (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:16:184830) at https://portal.blip.ai/portal.js?7ff936b1e614bd506990:78:114291 at Array.forEach (<anonymous>) at CommonStateViewModelValidator.validate (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:78:114240) at StateViewModelValidator.validate (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:71:367084) at BuilderController.validateState (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:30:344329) at BuilderController.<anonymous> (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:30:382382) at https://portal.blip.ai/portal.js?7ff936b1e614bd506990:16:3162 at Object.next (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:16:3278) at https://portal.blip.ai/portal.js?7ff936b1e614bd506990:16:2149 at new $Q (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:302:183911) at __awaiter (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:16:1713) at BuilderController.saveState (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:30:382185) at BuilderController.<anonymous> (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:30:347745) at https://portal.blip.ai/portal.js?7ff936b1e614bd506990:16:3162 at Object.next (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:16:3278) at https://portal.blip.ai/portal.js?7ff936b1e614bd506990:16:2149 at new $Q (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:302:183911) at __awaiter (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:16:1713) at BuilderSidebarController.$onStateChanged (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:30:347630) at BuilderSidebarController.<anonymous> (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:30:248957) at https://portal.blip.ai/portal.js?7ff936b1e614bd506990:16:3162 at Object.next (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:16:3278) at https://portal.blip.ai/portal.js?7ff936b1e614bd506990:16:2149 at new $Q (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:302:183911) at __awaiter (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:16:1713) at BuilderSidebarController.updateAndSaveState (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:30:248690) at AutoSaveService.<anonymous> (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:247:10200) at https://portal.blip.ai/portal.js?7ff936b1e614bd506990:262:2895 at Object.next (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:262:3011) at https://portal.blip.ai/portal.js?7ff936b1e614bd506990:262:1914 at new $Q (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:302:183911) at Object.__awaiter (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:262:1527) at https://portal.blip.ai/portal.js?7ff936b1e614bd506990:247:10054 at Scope.$emit (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:302:194886) at https://portal.blip.ai/portal.js?7ff936b1e614bd506990:262:87259 at https://portal.blip.ai/portal.js?7ff936b1e614bd506990:302:206878 at completeOutstandingRequest (https://portal.blip.ai/portal.js?7ff936b1e614bd506990:302:51173) at https://portal.blip.ai/portal.js?7ff936b1e614bd506990:302:54019
    // conditions: []
    // settings: {headers: {…}}
    // type: "ProcessHttp"

    // TIPOS DE TAGS A SEREM ADICIONADAS
    // type: 'ProcessHttp',
    // type: 'TrackEvent',
    // type: 'MergeContact'
    // type: 'Redirect'
    // type: 'ManageList'
    // type: 'ExecuteScript'
    // type: 'SetVariable',
    // type: 'ProcessContentAssistant',
    // type: 'ProcessCommand'

    //  TAG FORMART
    // background: "#FF4A1E"
    // canChangeBackground: false
    // id: "blip-tag-7b9f022e-0aa2-b4f1-592b-e7f5d9a2b64f"
    // label: "xxx"
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  // public sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  private handlerWithTags(): void {
    const htmlActions = document.querySelectorAll(
      "li[ng-click^='$ctrl.onAddAction'], i[ng-click^='$ctrl.onDeleteAction']"
    );

    htmlActions.forEach((e: Element) => {
      e.addEventListener('click', this.addTags);
    });
  }

  public teste(): void {
    console.log('sei laaaa', getController());
  }

  public handle(): boolean {
    interceptFunction('debouncedEditState', () => this.handlerWithTags());
    interceptFunction('closeSidebar', () => this.teste());
    return true;
  }
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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// <add-action add-action-text="+ Adicionar ação de entrada" on-action="$ctrl.onAddEnteringAction($action)" is-subflow-application="$ctrl.isSubflowApplication" state="$ctrl.state" is-disabled="$ctrl.enteringActionsExtras.addDisabled"><div class="ph4 flex flex-column justify-center add-action-button-div w-100" ng-class="{'disabled': $ctrl.isDisabled}">
//     <!---->
//     <span class="over-limit-icon">
//         <!---->
//     </span>
//     <dropdown-item item-title="<div class='add-action-button bp-btn bp-btn--bot bp-btn--dashed flex justify-center items-center h3-1 w-100 b'>+ Adicionar ação de entrada</div>" min-width="225" align="left" hide-icon="true"><div class="relative dropdown-container">
//     <div ng-class="{
//         'show-dropdown': $ctrl.isOpen,
//         'hide-dropdown': !$ctrl.isOpen
//         }" ng-style="{&quot;min-width&quot;:&quot;225px&quot;}" class="dropdown-item-content z-2 dropdown-direction-bottom dropdown-align-left hide-dropdown" ng-transclude="" style="min-width: 225px;">
//         <ul class="ma0 ph4 pt3">
//             <li ng-click="$ctrl.onAddAction('ProcessHttp')" translate="">Requisição HTTP</li>
//             <li ng-click="$ctrl.onAddAction('TrackEvent')" translate="">Registro de eventos</li>
//             <li ng-click="$ctrl.onAddAction('MergeContact')" translate="">Definir contato</li>
//             <!----><li ng-click="$ctrl.onAddAction('Redirect')" ng-if="!$ctrl.isSubflowApplication" translate="">Redirecionar a um serviço</li><!---->
//             <li ng-click="$ctrl.onAddAction('ManageList')" translate="">Gerenciar lista de distribuição</li>
//             <li ng-click="$ctrl.onAddAction('ExecuteScript')" translate="">Executar script</li>
//             <li ng-click="$ctrl.onAddAction('SetVariable')" translate="">Definir variável</li>
//             <!----><li ng-if="$ctrl.isActionProcessContentAssistantEnabled() &amp;&amp; !$ctrl.isSubflowApplication" ng-click="$ctrl.onAddAction('ProcessContentAssistant')" translate="">Consultar Assistente de conteúdo</li><!---->
//             <li ng-click="$ctrl.onAddAction('ProcessCommand')" translate="">Processar comando</li>
//         </ul>
//     </div>
//     <span ng-click="$ctrl.toggleOpen($event)" class=" flex">
//         <div bind-html-compile="$ctrl.itemTitle"><div class="add-action-button bp-btn bp-btn--bot bp-btn--dashed flex justify-center items-center h3-1 w-100 b">+ Adicionar ação de entrada</div></div>
//         <span ng-transclude="item-title"></span>
//         <!---->
//         <!----><icon-dpr ng-if="!$ctrl.customIcon" ng-hide="$ctrl.hideIcon" class="ng-hide"><i class="icon icon-material icon-s" ng-transclude=""><span></span></i></icon-dpr><!---->
//     </span>
// </div>
// </dropdown-item>
// </div></add-action>

// <add-action add-action-text="+ Adicionar ação de saída" on-action="$ctrl.onAddLeavingAction($action)" state="$ctrl.state" is-subflow-application="$ctrl.isSubflowApplication" is-disabled="$ctrl.leavingActionsExtras.addDisabled"><div class="ph4 flex flex-column justify-center add-action-button-div w-100" ng-class="{'disabled': $ctrl.isDisabled}">
//     <!---->
//     <span class="over-limit-icon">
//         <!---->
//     </span>
//     <dropdown-item item-title="<div class='add-action-button bp-btn bp-btn--bot bp-btn--dashed flex justify-center items-center h3-1 w-100 b'>+ Adicionar ação de saída</div>" min-width="225" align="left" hide-icon="true"><div class="relative dropdown-container">
//     <div ng-class="{
//         'show-dropdown': $ctrl.isOpen,
//         'hide-dropdown': !$ctrl.isOpen
//         }" ng-style="{&quot;min-width&quot;:&quot;225px&quot;}" class="dropdown-item-content z-2 dropdown-direction-bottom dropdown-align-left" ng-transclude="" style="min-width: 225px;">
//         <ul class="ma0 ph4 pt3">
//             <li ng-click="$ctrl.onAddAction('ProcessHttp')" translate="">Requisição HTTP</li>
//             <li ng-click="$ctrl.onAddAction('TrackEvent')" translate="">Registro de eventos</li>
//             <li ng-click="$ctrl.onAddAction('MergeContact')" translate="">Definir contato</li>
//             <!----><li ng-click="$ctrl.onAddAction('Redirect')" ng-if="!$ctrl.isSubflowApplication" translate="">Redirecionar a um serviço</li><!---->
//             <li ng-click="$ctrl.onAddAction('ManageList')" translate="">Gerenciar lista de distribuição</li>
//             <li ng-click="$ctrl.onAddAction('ExecuteScript')" translate="">Executar script</li>
//             <li ng-click="$ctrl.onAddAction('SetVariable')" translate="">Definir variável</li>
//             <!----><li ng-if="$ctrl.isActionProcessContentAssistantEnabled() &amp;&amp; !$ctrl.isSubflowApplication" ng-click="$ctrl.onAddAction('ProcessContentAssistant')" translate="">Consultar Assistente de conteúdo</li><!---->
//             <li ng-click="$ctrl.onAddAction('ProcessCommand')" translate="">Processar comando</li>
//         </ul>
//     </div>
//     <span ng-click="$ctrl.toggleOpen($event)" class=" flex">
//         <div bind-html-compile="$ctrl.itemTitle"><div class="add-action-button bp-btn bp-btn--bot bp-btn--dashed flex justify-center items-center h3-1 w-100 b">+ Adicionar ação de saída</div></div>
//         <span ng-transclude="item-title"></span>
//         <!---->
//         <!----><icon-dpr ng-if="!$ctrl.customIcon" ng-hide="$ctrl.hideIcon" class="ng-hide"><i class="icon icon-material icon-s" ng-transclude=""><span></span></i></icon-dpr><!---->
//     </span>
// </div>
// </dropdown-item>
// </div></add-action>

// <builder-node ng-repeat="state in $ctrl.flow track by state.id" id="c54b9361-1669-46a3-8ebb-d450475ba502" datatest="builder-block-c54b9361-1669-46a3-8ebb-d450475ba502" node-id="c54b9361-1669-46a3-8ebb-d450475ba502" node-title="Novo bloco" node-image-uri="" is-builder-improved-copy-paste-feature-enabled="true" node-tags="state.$tags" default-title="Novo bloco" ng-init="$ctrl.createStateNode(state)" on-edit="$ctrl.editState(state)" on-finish-render="$ctrl.createConnections()" on-delete="$ctrl.deleteSelectedState(state.id)" on-duplicate="$ctrl.duplicateUndoRedoStateId(state.id)" on-copy-selected-nodes="$ctrl.copySelectedNodes()" on-copy-node-id="$ctrl.copyNodeId(state.id)" on-enter-sub-flow="$ctrl.enterSubflow(state)" on-edit-sub-flow="$ctrl.editSubflow(state)" on-update-element="$ctrl.builderInstance.revalidate($node)" on-context-menu="$ctrl.onBuilderNodeContextMenu()" on-upgrade-state="$ctrl.upgradeSelectedState(state.id)" desk-state-version="" class="diagram-node flex flex-column jtk-draggable jtk-droppable" ng-class="{
//     'no-match-node': $ctrl.searchedStates.length > 0 &amp;&amp; !$ctrl.isSearched(state.id),
//     'on-search': $ctrl.searchedStates.length > 0,
//     'invalid-node': state.$invalid,
//     'upgrade-node': !state.$invalid &amp;&amp; $ctrl.checkOutdatedDeskVersion(state),
//     'editing-node': $ctrl.editingState &amp;&amp; state.id === $ctrl.editingState.id,
//     'default-node': $ctrl.isDefaultNode(state.id),
//     'subflow-block': state.id.includes('subflow')
// }" style="left: 122px; top: 203px;"><!----><div id="builder-node-context-c54b9361-1669-46a3-8ebb-d450475ba502" ng-if="!$ctrl.isDefaultNode($ctrl.nodeId)" class="builder-node-menu">
// <div class="builder-node-context-menu normal">
// <!----><div class="ph3 pv1 bp-fs-7 tc" ng-if="!$ctrl.isSubflowBlock">
// <span ng-click="$ctrl.$onDuplicate($ctrl.nodeId)" translate="">Duplicar</span>
// </div><!---->
// <!---->
// <!----><div ng-if="$ctrl.isBuilderImprovedCopyPasteFeatureEnabled" class="ph3 pv1 bp-fs-7 tc">
// <span ng-click="$ctrl.$onCopySelectedNodes()" translate="">Copiar</span>
// </div><!---->
// <div class="ph3 pv1 bp-fs-7 tc"><div class="edit-block-option"><span>Editar</span></div></div><div class="ph3 pv1 bp-fs-7 tc">
// <span ng-click="$ctrl.$onCopyNodeId($ctrl.nodeId)" translate="">Copiar Id</span>
// </div>
// <div class="ph3 pv1 bp-fs-7 tc">
// <span class="builder-node-delete" ng-click="$ctrl.$onDelete($ctrl.nodeId)" translate="">Excluir</span>
// </div>
// </div>
// </div><!---->

// <!-- Context menu -->
// <div context-menu="$ctrl.$onContextMenu()" data-target="builder-node-context-c54b9361-1669-46a3-8ebb-d450475ba502" ng-class="!$ctrl.isSubflowBlock ? 'builder-node-container' : 'builder-node-container-subflow'" class="builder-node-container">
// <!----><div ng-if="!$ctrl.isSubflowBlock">
// <span class="builder-node-title">
// Novo bloco
// </span>
// <!---->
// </div><!---->
// <!---->
// <!----><builder-node-tags ng-if="$ctrl.nodeTags" tags="$ctrl.nodeTags"><div id="blip-tags-ec3bb48d-f623-46f2-b12a-d705f4c1bad3 class=" blip-tags"=""></div><div class="blip-tags blip-tags--compact-mode" id="ncid-9284" data-nanocomponent="ncid-9284" data-onloadidh707nyqcumb="o14"></div></builder-node-tags><!---->
// <div class="diagram-node-endpoint" action="begin"></div>
// </div>
// </builder-node>

// const tab = document.getElementById("node-content-tab");

//         const header = tab.getElementsByClassName("sidebar-content-header")[0];
//         const tagMenuBtn = header.getElementsByTagName("img");
