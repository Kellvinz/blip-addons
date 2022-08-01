import {

  } from '../../Utils';
  import { BaseFeature } from '../BaseFeature';
  import {  } from '~/types';
  
  export class ReplaceVariable extends BaseFeature {
    public static isUserTriggered = true;
  
    /**
     * Sets the expiration time for all the bots
     *
     * @param expirationTime The expiration time
     */
    public handle(originalVariableName: string, newVariableName: string): boolean {
      return false;
    }

  }
  