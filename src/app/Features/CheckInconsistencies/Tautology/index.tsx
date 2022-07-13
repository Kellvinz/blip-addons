import { BaseFeature } from '../../BaseFeature';
import { getBlocks } from '~/Utils';
import { ConditionActionProblemDetail } from '~/types';
import { Paragraph } from '@components';
import * as React from 'react';

const NOT_EQUAL_CONDITION = 'notEquals';
const EMPTY_REACT_TEMPLATE = <></>;

export class TautologyInconsistencies extends BaseFeature {
  /**
   * Check for Tautology inconsistencies on the flow
   */
  public handle(): any {
    const blocks = getBlocks();

    const actionsWithTautology = this.getActionsConditionsWithTautology(blocks);
    const outputConditionsWithTautology =
      this.getOutputConditionsWithTautology(blocks);

    console.log('> actionsWithTautology');
    console.log(actionsWithTautology);
    console.log('> outputConditionsWithTautology');
    console.log(outputConditionsWithTautology);

    const hasTautology =
      actionsWithTautology.length > 0 ||
      outputConditionsWithTautology.length > 0;

      console.log(this.getTautologyMessage(
        actionsWithTautology,
        outputConditionsWithTautology
      ))

    return {
      hasTautology: hasTautology,
      tautologyMessage: hasTautology
        ? this.getTautologyMessage(
            actionsWithTautology,
            outputConditionsWithTautology
          )
        : EMPTY_REACT_TEMPLATE,
    };
  }

  private getActionsConditionsWithTautology = (
    blocks: any
  ): ConditionActionProblemDetail[] => {
    let actionsWithExecuteConditions = [];
    let actionsWithProblems = [];

    for (const block of blocks) {
      actionsWithExecuteConditions = getActionsWithExecuteConditions(block);
      for (const action of actionsWithExecuteConditions) {
        const condictionsWithTautology =
          getActionsCondictionsWithTautologyDetail(action);
        actionsWithProblems = actionsWithProblems.concat(
          condictionsWithTautology
        );
      }
    }

    return actionsWithProblems;
  };

  private getOutputConditionsWithTautology = (blocks: any): any[] => {
    const outputConditionsWithProblems = [];

    for (const block of blocks) {
      for (const outputCondition of block.$conditionOutputs) {
        for (const condition of outputCondition.conditions) {
          if (hasTautologyOnCondition(condition)) {
            outputConditionsWithProblems.push({
              blockName: block.$title,
              variable: condition.variable,
            });
          }
        }
      }
    }

    return outputConditionsWithProblems;
  };

  private getTautologyMessage = (
    actionsWithTautology: any[],
    outputConditionsWithTautology: any[]
  ): any => {
    return (
      <>
        <h4>Ações com tautologia</h4>
        {actionsWithTautology.length > 0 ? (
          this.getProblemActionsHtmlList(actionsWithTautology)
        ) : (
          <p>Nenhuma tautologia identificada</p>
        )}

        <h4>Condições de saída com tautologia</h4>
        {actionsWithTautology.length > 0 ? (
          this.getProblemOutputConditionsHtmlList(outputConditionsWithTautology)
        ) : (
          <p>Nenhuma tautologia identificada</p>
        )}

        <Paragraph>
          * Você deve alterar as condições de execução destas ações, pois
          atualmente estas condições sempre serã verdadeiras.
          <br />
        </Paragraph>
      </>
    );
  };

  private getProblemActionsHtmlList = (actionsCondictions: any[]): any => {
    return (
      <ul
        style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#607b99' }}
      >
        {actionsCondictions.map((ac, index) => (
          <li key={index}>{ac.blockName} - {ac.actionName} - {ac.variable}</li>
        ))}
      </ul>
    );
  };

  private getProblemOutputConditionsHtmlList = (
    outputCondictions: any[]
  ): any => {
    return (
      <ul
        style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#607b99' }}
      >
        {outputCondictions.map((oc, index) => (
          <li key={index}>{oc.blockName} - {oc.variable}</li>
        ))}
      </ul>
    );
  };
}

const getActionsWithExecuteConditions = (block: any): any => {
  return getAllActions(block).filter(hasExecuteCondition);
};

const getAllActions = (block: any): any => {
  const blockName = block.$title;

  return [
    ...block.$enteringCustomActions.map((action) =>
      insertBlockNameOnAction(action, blockName)
    ),
    ...block.$leavingCustomActions.map((action) =>
      insertBlockNameOnAction(action, blockName)
    ),
  ];
};

const insertBlockNameOnAction = (action: any, blockName: string): any => {
  return { ...action, blockName: blockName };
};

const hasExecuteCondition = (action: any): boolean =>
  action.conditions.length > 0;

const hasTautologyOnCondition = (condition: any): boolean =>
  condition.comparison === NOT_EQUAL_CONDITION && condition.values.length > 0;

const getActionsCondictionsWithTautologyDetail = (
  action: any
): ConditionActionProblemDetail[] => {
  const condictionsWithTautology = [];
  for (const condition of action.conditions) {
    if (hasTautologyOnCondition(condition)) {
      condictionsWithTautology.push({
        blockName: action.blockName,
        actionName: action.$title,
        variable: condition.variable,
      });
    }
  }
  return condictionsWithTautology;
};
