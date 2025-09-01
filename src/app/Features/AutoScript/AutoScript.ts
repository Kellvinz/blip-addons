import { v4 as uuid } from 'uuid';
import { BaseFeature } from '../BaseFeature';
import { Settings } from '../../Settings';
import { getEditingBlock, getController, interceptFunction } from '../../Utils';
import { AUTO_SCRIPT_ACTION } from './Constants';
import { BlipAction, BlipFlowBlock } from '../../types';
import { updateTags } from '../AutoTag/tagsHandler';

const OPEN_BUILDER_NODE_EVENT = 'debouncedEditState';
const SCRIPT_ID_PROPERTY = 'blipAddonsAutoScript';

export class AutoScript extends BaseFeature {
    public static shouldRunOnce = true;

    constructor() {
        super();
    }

    public handle(): boolean {
        if (Settings.isAutoScriptEnabled) {
            interceptFunction(OPEN_BUILDER_NODE_EVENT, this.manageAutoScript);
        }
        return true;
    }

    private hasQuickReplyOrMenu(block: BlipFlowBlock): boolean {
        if (!Array.isArray(block.$contentActions)) {
            return false;
        }

        return block.$contentActions.some((contentAction) => {
            const contentType = contentAction?.action?.$typeOfContent;
            return contentType === 'select' || contentType === 'select-immediate';
        });
    }

    private manageAutoScript = (): void => {
        try {
            setTimeout(() => {
                const block = getEditingBlock();
                if (!block) {
                    return;
                }

                const shouldHaveScript = this.hasQuickReplyOrMenu(block);
                
                const hasOurScript = block.$enteringCustomActions.some(
                    (action) => action[SCRIPT_ID_PROPERTY]
                );

                if (shouldHaveScript && !hasOurScript) {
                    this.addAutoScriptToAction(block);
                } else if (!shouldHaveScript && hasOurScript) {
                    this.removeAutoScriptFromAction(block);
                }
            }, 100);
        } catch (error) {
            console.error("Blip Addons - Error in AutoScript feature:", error);
        }
    };

    private addAutoScriptToAction(block: BlipFlowBlock): void {
        const newScriptAction: BlipAction = {
            $id: uuid(),
            $invalid: false,
            $title: AUTO_SCRIPT_ACTION.$title,
            $typeOfContent: 'text',
            type: 'ExecuteScript',
            conditions: [],
            settings: {
                ...AUTO_SCRIPT_ACTION.settings,
            },
            [SCRIPT_ID_PROPERTY]: true,
        };

        block.$enteringCustomActions.unshift(newScriptAction);
        updateTags(block.id);

        const controller = getController();
        if (controller) {
            controller.$timeout(() => { });
        }
    }

    private removeAutoScriptFromAction(block: BlipFlowBlock): void {
        block.$enteringCustomActions = block.$enteringCustomActions.filter(
            (action) => !action[SCRIPT_ID_PROPERTY]
        );
        updateTags(block.id);

        const controller = getController();
        if (controller) {
            controller.$timeout(() => { });
        }
    }
}