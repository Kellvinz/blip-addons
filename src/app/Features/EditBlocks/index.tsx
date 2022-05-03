import * as React from 'react';
import * as ReactDOM from 'react-dom';
import pThrottle from 'p-throttle';

import { interceptFunction } from '~/Utils';
import { BaseFeature } from '../BaseFeature';
import { BlockStyleSidebar } from './BlockStyleSidebar';
import {
  getFlowBlockById,
  getAllFlowBlock,
  getBlockById,
  getContrastColor,
  hexToRgb,
} from '~/Utils';
import {
  colorBlockBackground,
  formatShapeBlock,
  Shapes,
  colorBlockText,
} from './BlipBlocksFunctions';
import { EditBlockOption } from './EditBlockOption';
import { ChangeBlockFormat } from './ChangeBlockFormat';
import { ChangeBlockColor } from './ChangeBlockColor';
import { ChangeTextBlockColor } from './ChangeTextColor';
import * as Constants from './Constants';

export class EditBlock extends BaseFeature {
  public static shouldRunOnce = true;
  private observer: MutationObserver;
  private id = '';

  private getSidebar(): HTMLElement {
    return document.getElementById(Constants.BLIPS_SIDEBAR_ID);
  }

  private restoreBlockStyle = (): void => {
    const block = getFlowBlockById(this.id);

    formatShapeBlock(Shapes.DEFAULT, block);
  };

  private openSidebar = (): void => {
    if (!this.getSidebar()) {
      // Creates and append the sidebar to the dom
      const blipsSidebar = document.createElement('div');

      blipsSidebar.setAttribute('id', Constants.BLIPS_SIDEBAR_ID);
      ReactDOM.render(
        <BlockStyleSidebar
          id={this.id}
          onEditBackgorundColor={this.onEditBackgorundColor}
          onEditTextColor={this.onEditTextColor}
          onEditShape={this.onEditShape}
          onClose={this.closeSidebar}
          onRestore={this.restoreBlockStyle}
        />,
        blipsSidebar
      );

      const mainArea = document.getElementById(Constants.MAIN_CONTENT_AREA);
      mainArea.appendChild(blipsSidebar);

      // Waits for a moment and then fades the sidebar in
      const customSidebar = this.getSidebar().children.item(0);
      interceptFunction('closeSidebar', this.closeSidebar);

      setTimeout(() => {
        customSidebar.classList.add('ng-enter-active');
      }, 200);
    } else {
      return this.closeSidebar();
    }
  };

  private closeSidebar = (): void => {
    const sidebar = this.getSidebar();

    if (sidebar) {
      sidebar.remove();
    }
  };

  private onEditBackgorundColor = (id: string, color: string): void => {
    const block = getBlockById(id);
    const flowBlock = getFlowBlockById(id);
    const currentTextColor = hexToRgb(color);
    const newTextColor = getContrastColor(currentTextColor);

    block.addonsSettings = { ...block.addonsSettings, backgroundColor: color };

    colorBlockBackground(color, flowBlock);
    colorBlockText(newTextColor, flowBlock);
  };

  private onEditTextColor = (id: string, color: string): void => {
    const block = getBlockById(id);
    const flowBlock = getFlowBlockById(id);

    block.addonsSettings = { ...block.addonsSettings, textColor: color };

    colorBlockText(color, flowBlock);
  };

  private onEditShape = (id: string, shape: Shapes): void => {
    const block = getBlockById(id);
    const flowBlock = getFlowBlockById(id);

    block.addonsSettings = { ...block.addonsSettings, shape };

    formatShapeBlock(shape, flowBlock);
  };

  private createBlockOptionsDiv(): any {
    const blipsDiv = document.createElement('div');
    blipsDiv.setAttribute('class', Constants.CONTEXT_MENU_OPTION_CLASSES);
    return blipsDiv;
  }

  public menuOptionElementHandle = (id: string): void => {
    this.id = id;
    this.openSidebar();
  };

  private addChangeFormatOptionOnBlockById(id: string): void {
    const menuOptionsList = document.querySelector(
      `${Constants.BUILDER_HTML_BLOCK_TAG}[id="${id}"]:not(.subflow-block) .${Constants.BUILDER_NODE_MENU} .${Constants.CONTEXT_MENU_CLASS}`
    );

    if (menuOptionsList) {
      const editOption = menuOptionsList.querySelector('.edit-block-option');

      if (!editOption) {
        const menuOptionElement = this.createBlockOptionsDiv();

        ReactDOM.render(
          <EditBlockOption id={id} onClick={this.menuOptionElementHandle} />,
          menuOptionElement
        );
        menuOptionsList.insertBefore(
          menuOptionElement,
          menuOptionsList.children[Constants.DELETE_OPTION_BLOCK_POSITION]
        );
      }
    }
  }

  private addEditOptionInAllBlocks = (): void => {
    const blocks = getAllFlowBlock();

    for (const block of blocks) {
      this.addChangeFormatOptionOnBlockById(block.id);
    }
  };

  public handle(): boolean {
    this.addEditOptionInAllBlocks();

    new ChangeBlockFormat().handle();
    new ChangeBlockColor().handle();
    new ChangeTextBlockColor().handle();

    const isObserverNotDefined = !this.observer;

    if (isObserverNotDefined) {
      this.watchChanges();
    }

    return true;
  }

  private hasNewBlock(mutations: MutationRecord[]): boolean {
    return !!mutations.find((mutation) => {
      return Array.from(mutation.addedNodes).find(
        (node) =>
          (node as HTMLElement).tagName == Constants.BUILDER_NODE_TAG_NAME
      );
    });
  }

  private watchChanges(): void {
    const throttle = pThrottle({
      interval: 500,
      limit: 1,
    });

    const applyChanges = throttle((mutations: MutationRecord[]) => {
      const hasNewBlock = this.hasNewBlock(mutations);

      if (hasNewBlock) {
        this.handle();
      }
    });

    this.observer = new MutationObserver(applyChanges);
    const diagramContainer = document.querySelector(
      Constants.DIAGRAM_CONTAINER
    );

    this.observer.observe(diagramContainer, {
      childList: true,
    });
  }

  /**
   * Removes the functionality to copy the block
   */
  public cleanup(): void {
    this.closeSidebar();
  }
}
