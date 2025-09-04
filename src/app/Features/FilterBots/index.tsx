import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { BaseFeature } from '../BaseFeature';
import * as Constants from './Constants';
import { Filter } from './Filter';
import { Settings } from '../../Settings';

const FILTER_ID = 'blip-addons-filter';
const FILTER_CONTAINER = '.chatbots-subheader .flex:last-child';

export class FilterBots extends BaseFeature {
  public static shouldAlwaysClean = true;
  public static hasRun = false;

  public static get canRun(): boolean {
    return true;
  }

  private getHeader(): HTMLElement {
    const container = document.querySelector(FILTER_CONTAINER) as HTMLElement;
    return container;
  }

  public get hasFilter(): boolean {
    return !!document.getElementById(FILTER_ID);
  }

  // 1. CORREÇÃO: Usando 'contact' como o seletor, conforme sua imagem do ng-repeat.
  public get allContacts(): HTMLElement[] {
    return Array.from(document.getElementsByTagName('contact')) as HTMLElement[];
  }

  private matchesAny(source: string, patterns: RegExp[]): boolean {
    return patterns.some((pattern) => pattern.test(source));
  }

  private getRegexes(environment: keyof typeof Constants): RegExp[] {
    const keywordsMap = {
      [Constants.ALL]: [''],
      [Constants.PRD]: Settings.prodKey,
      [Constants.HMG]: Settings.hmgKey,
      [Constants.DEV]: Settings.devKey,
      [Constants.BETA]: Settings.betaKey,
    };

    return keywordsMap[environment]
      .map((keyword) => keyword.trim())
      .filter(Boolean)
      .map((keyword) => new RegExp(`\\b${keyword}\\b`, 'i'));
  }

  private handleChange = (e: any): void => {
    const regexes = this.getRegexes(e.target.value);
    const contacts = this.allContacts;

    for (const contact of contacts) {
      // 2. CORREÇÃO: Revertendo para o seletor antigo, compatível com a estrutura AngularJS.
      const contactNameElement = contact.querySelector('.contact-name span') as HTMLElement;

      if (contactNameElement) {
        const contactName = contactNameElement.innerText;
        contact.style.display =
          !regexes.length || this.matchesAny(contactName, regexes)
            ? 'block'
            : 'none';
      }
    }
  };

  private paintRouters(): void {
    const color = '#E0F2F1';
    const contacts = this.allContacts;

    for (const contact of contacts) {
      // CORREÇÃO: Usando o seletor exato que você forneceu.
      const contactCategoryElement = contact.querySelector('.contact-data.mt2');

      if (contactCategoryElement) {
        // O conteúdo exato pode variar, então usamos .includes() que é mais seguro.
        const contactCategory = contactCategoryElement.innerHTML;
        const isRouter = contactCategory.includes('Router');

        if (isRouter) {
          const contactCard = contact.querySelector('.card') as HTMLElement;
          if (contactCard) {
            contactCard.style.backgroundColor = color;
          }
        }
      }
    }
  }

  public handle(): any {
    if (FilterBots.hasRun) {
      return;
    }

    const header = this.getHeader();
    this.paintRouters();

    if (header) {
      if (!this.hasFilter) {
        const filter = document.createElement('div');
        filter.id = FILTER_ID;

        ReactDOM.render(<Filter onFilter={this.handleChange} />, filter);
        header.appendChild(filter);
      }
      FilterBots.hasRun = true;
      return true;
    }
    return false;
  }

  public cleanup(): any {
    const filter = document.getElementById(FILTER_ID);
    if (filter) {
      filter.remove();
    }

    const contacts = this.allContacts;
    for (const contact of contacts) {
      contact.style.display = 'block';
    }
    FilterBots.hasRun = false;
  }
}
