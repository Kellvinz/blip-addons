import React from 'react';
import ReactDOM from 'react-dom';
import { BaseFeature } from '../BaseFeature';
import { Filter } from './Filter';
import * as Constants from './Constants';
import { Settings } from '~/Settings';

const FILTER_ID = 'blip-addons-filter';
const FILTER_CONTAINER = '.chatbots-subheader .flex:last-child';

export class FilterBots extends BaseFeature {
  public static shouldAlwaysClean = true;

  private getHeader(): HTMLElement {
    return document.querySelector(FILTER_CONTAINER) as HTMLElement;
  }

  public handle(): void {
    const header = this.getHeader();
    if (header && !this.hasFilter) {
      const filterContainer = document.createElement('div');
      filterContainer.id = FILTER_ID;
      header.prepend(filterContainer);
      ReactDOM.render(
        <Filter
          onFilter={(
            environments: (keyof typeof Constants)[],
            search: string
          ) => {
            const searchPatterns = search
              .split(' ')
              .filter((s) => !!s)
              .map((s) => new RegExp(s, 'i'));

            const envPatterns = environments.flatMap((e) => this.getRegexes(e));

            this.allContacts.forEach((c) => {
              const name = c.querySelector('.contact-name').textContent;
              const shouldShow =
                (searchPatterns.length === 0 ||
                  this.matchesAny(name, searchPatterns)) &&
                (envPatterns.length === 0 || this.matchesAny(name, envPatterns));

              c.style.display = shouldShow ? 'flex' : 'none';
            });
          }}
        />,
        filterContainer
      );
    }
  }

  public cleanup(): void {
    const filter = document.getElementById(FILTER_ID);
    if (filter) {
      filter.remove();
    }
  }

  public get hasFilter(): boolean {
    return !!document.getElementById(FILTER_ID);
  }

  public get allContacts(): HTMLElement[] {
    return Array.from(
      document.querySelectorAll('a.contact-list-item.svelte-12hks0a')
    );
  }

  private matchesAny(source: string, patterns: RegExp[]): boolean {
    for (const p of patterns) {
      if (p.test(source)) {
        return true;
      }
    }
    return false;
  }

  private getRegexes(environment: keyof typeof Constants): RegExp[] {
    const keywordsMap = {
      [Constants.ALL]: [''],
      [Constants.PRD]: Settings.prodKey,
      [Constants.HMG]: Settings.hmgKey,
      [Constants.BETA]: Settings.betaKey,
      [Constants.DEV]: Settings.devKey,
    };
    return keywordsMap[environment].map((p) => new RegExp(p, 'i'));
  }
}
