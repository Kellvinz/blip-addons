import { BaseFeature } from "@features/BaseFeature";
import { getBlockById, getController, interceptFunction } from "~/Utils";

export class AutoTag extends BaseFeature {
    public static shouldRunOnce = true;

    private addTags(): void {
        const blockId = getBlockId();
        const block = getBlockById(blockId);
    
        const actions = getAllActions(block);

        console.log(actions);
    }

    private handlerWithTags(): void {
        const htmlActions = document.querySelectorAll("li[ng-click^='$ctrl.onAddAction'], i[ng-click^='$ctrl.onDeleteAction']");
        
        htmlActions.forEach((e: Element) => {
            e.addEventListener("click", this.addTags);
        });
    }

    public handle(): boolean {
        interceptFunction('debouncedEditState', () => this.handlerWithTags());
        return true;
    }

}

const getAllActions = (block): any[] => {
    const enteringActions = block.$enteringCustomActions;
    const leavingActions = block.$leavingCustomActions;

    return [...enteringActions, ...leavingActions];
}

const getBlockId = (): string => {
    const builderController = getController();
    const sidebarSettings = builderController["SidebarContentService"];
    const blockId = sidebarSettings.openSidebars[0].sidebarId;

    return blockId;
}

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