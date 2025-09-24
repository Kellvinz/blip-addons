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

    private manageAutoScript = (): void => {
        try {
            setTimeout(() => {
                const block = getEditingBlock();
                if (!block) {
                    return;
                }

                if (!block.addonsSettings) {
                    block.addonsSettings = {};
                }

                const menuOptions = this.getMenuOptions(block);
                const hasAutoScript = block.$enteringCustomActions.some(
                    (action) => action[SCRIPT_ID_PROPERTY]
                );

                if (menuOptions.length > 0) {
                    if (block.addonsSettings.autoScriptDeleted) {
                        return;
                    }
                    if (!hasAutoScript) {
                        this.addAutoScriptToAction(block, menuOptions);
                        updateTags(block.id);
                        const controller = getController();
                        if (controller) {
                            controller.$timeout(() => { });
                        }
                    }
                } else {
                    if (hasAutoScript) {
                        block.$enteringCustomActions = block.$enteringCustomActions.filter(
                            (action) => !action[SCRIPT_ID_PROPERTY]
                        );
                        delete block.addonsSettings.autoScriptDeleted; 
                        updateTags(block.id);
                        const controller = getController();
                        if (controller) {
                            controller.$timeout(() => { });
                        }
                    }
                }

                if (hasAutoScript && menuOptions.length === 0) {
                    block.addonsSettings.autoScriptDeleted = true;
                }

            }, 100);
        } catch (error) {
            console.error("Blip Addons - Error in AutoScript feature:", error);
        }
    };

    private addAutoScriptToAction(block: BlipFlowBlock, menuOptions: string[]): void {
        const regexPattern = `^(${menuOptions.map(o => o.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`;
        
        const scriptSource = AUTO_SCRIPT_ACTION.settings.source.replace(
            '__REGEX_PATTERN__',
            regexPattern
        );

        const newScriptAction: BlipAction = {
            $id: uuid(),
            $invalid: false,
            $title: AUTO_SCRIPT_ACTION.$title,
            $typeOfContent: 'text',
            type: 'ExecuteScript',
            conditions: [],
            settings: {
                ...AUTO_SCRIPT_ACTION.settings,
                source: scriptSource,
            },
            [SCRIPT_ID_PROPERTY]: true,
        };

        block.$enteringCustomActions.unshift(newScriptAction);
    }
}