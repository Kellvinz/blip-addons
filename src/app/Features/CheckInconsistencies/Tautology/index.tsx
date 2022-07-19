import { BaseFeature } from '../../BaseFeature';
import {
  createConfirmationAlert,
  getBlocks,
  removeOverlay,
  showSuccessToast,
} from '~/Utils';
import { ConditionActionProblemDetail } from '~/types';
import { Paragraph } from '@components';
import { BdsButton } from 'blip-ds/dist/blip-ds-react';
import * as React from 'react';

const NOT_EQUAL_CONDITION = 'notEquals';
const DEFAULT_CONDITION_SOURCE = 'context';

export class TautologyInconsistencies extends BaseFeature {
  /**
   * Check for Tautology inconsistencies on the flow
   */
  public handle(isToCorrect: boolean): any {
    const blocks = getBlocks();

    const actionsWithTautology = this.actionsConditionsWithTautologyHandle(
      blocks,
      isToCorrect
    );
    const outputConditionsWithTautology =
      this.outputConditionsWithTautologyHandle(blocks, isToCorrect);

    const hasTautology =
      actionsWithTautology.length > 0 ||
      outputConditionsWithTautology.length > 0;

    return {
      hasTautology: hasTautology,
      tautologyMessage: this.getTautologyMessage(
        actionsWithTautology,
        outputConditionsWithTautology
      ),
    };
  }

  private actionsConditionsWithTautologyHandle = (
    blocks: any,
    isToCorrect: boolean
  ): ConditionActionProblemDetail[] => {
    let actionsWithExecuteConditions = [];
    let actionsWithProblems = [];

    for (const block of blocks) {
      actionsWithExecuteConditions = getActionsWithExecuteConditions(block);

      for (const action of actionsWithExecuteConditions) {
        if (isToCorrect) {
          fixActionsCondictionsWithTautology(action);
        } else {
          const condictionsWithTautology =
            getActionsCondictionsWithTautologyDetail(action);
          actionsWithProblems = actionsWithProblems.concat(
            condictionsWithTautology
          );
        }
      }
    }

    return actionsWithProblems;
  };

  private outputConditionsWithTautologyHandle = (
    blocks: any,
    isToCorrect: boolean
  ): any[] => {
    let outputConditionsWithProblems = [];

    for (const block of blocks) {
      for (const outputCondition of block.$conditionOutputs) {
        if (isToCorrect) {
          fixOutputCondictionsWithTautology(outputCondition);
        } else {
          outputConditionsWithProblems = outputConditionsWithProblems.concat(
            getOutputCondictionsWithTautology(outputCondition, block.$title)
          );
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
          <Paragraph>Nenhuma tautologia identificada</Paragraph>
        )}

        <h4>Condições de saída com tautologia</h4>
        {outputConditionsWithTautology.length > 0 ? (
          this.getProblemOutputConditionsHtmlList(outputConditionsWithTautology)
        ) : (
          <Paragraph>Nenhuma tautologia identificada</Paragraph>
        )}

        {actionsWithTautology.length > 0 ||
        outputConditionsWithTautology.length > 0 ? (
          <>
            <Paragraph>
              * Você deve alterar as condições de execução destas ações, pois
              atualmente estas condições sempre serã verdadeiras.
              <br />
              Você pode corrigir estas tautologiasautomaticamente apertando no
              botão abaixo.
            </Paragraph>

            <BdsButton
              type="submit"
              variant="primary"
              onClick={this.handleSubmit}
            >
              Corrigir Tautologias
            </BdsButton>
          </>
        ) : (
          <></>
        )}
      </>
    );
  };

  private handleSubmit = (): void => {
    createConfirmationAlert({
      onCancel: () => removeOverlay(),
      onConfirm: () => {
        this.handle(true);
        removeOverlay();
        showSuccessToast('Tautologias Corrigidas!');
      },
      mainMessage: `A correção automática irá corrigir a tautologia trocando a condição "ou" por "e". Entretanto, recomendamos que você verifique a sua lógica para confirmar se ela realmente está correta. Deseja continuar?`,
      footnote:
        'Para desfazer esta ação recarregue a última versão publicada do fluxo.',
    });
  };

  private getProblemActionsHtmlList = (actionsCondictions: any[]): any => {
    return (
      <ul
        style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#607b99' }}
      >
        {actionsCondictions.map((ac, index) => (
          <li key={index}>
            {ac.blockName} - {ac.actionName} - {ac.variable}
          </li>
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
          <li key={index}>
            {oc.blockName} - {oc.variable}
          </li>
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
  condition.comparison === NOT_EQUAL_CONDITION && condition.values.length > 1;

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

const fixActionsCondictionsWithTautology = (action: any): void => {
  let newConditionsArray = [];

  for (const condition of action.conditions) {
    if (hasTautologyOnCondition(condition)) {
      newConditionsArray = newConditionsArray.concat(
        condition.values.map((c) => getNotEqualCondition(condition.variable, c))
      );
    } else {
      newConditionsArray.push(condition);
    }
  }

  action.conditions.splice(0, action.conditions.length, ...newConditionsArray);
};

const fixOutputCondictionsWithTautology = (outputCondition: any): void => {
  let newConditionsArray = [];

  for (const condition of outputCondition.conditions) {
    if (hasTautologyOnCondition(condition)) {
      newConditionsArray = newConditionsArray.concat(
        condition.values.map((c) => getNotEqualCondition(condition.variable, c))
      );
    } else {
      newConditionsArray.push(condition);
    }
  }

  outputCondition.conditions.splice(
    0,
    outputCondition.conditions.length,
    ...newConditionsArray
  );
};

const getOutputCondictionsWithTautology = (
  outputCondition: any,
  blockName: string
): ConditionActionProblemDetail[] => {
  const outputConditionsWithProblems = [];

  for (const condition of outputCondition.conditions) {
    if (hasTautologyOnCondition(condition)) {
      outputConditionsWithProblems.push({
        blockName: blockName,
        variable: condition.variable,
      });
    }
  }

  return outputConditionsWithProblems;
};

const getNotEqualCondition = (variable: string, value: string): any => {
  return {
    source: DEFAULT_CONDITION_SOURCE,
    comparison: NOT_EQUAL_CONDITION,
    values: [value],
    variable: variable,
  };
};
