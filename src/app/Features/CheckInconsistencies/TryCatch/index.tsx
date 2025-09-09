import * as React from "react";
import { Paragraph } from "~/Components";
import { BdsButton } from "blip-ds/dist/blip-ds-react";
import {
  createConfirmationAlert,
  getBlocks,
  removeOverlay,
  showSuccessToast,
} from "~/Utils";
import { BlipAction, BlipFlowBlock, InconsistencyModel } from "~/types";
import { BaseFeature } from "@features/BaseFeature";

const SCRIPT_ACTION_NAME = "ExecuteScript";
const TRY_CATCH_REGEX = /try\s*{[\s\S]*?}\s*catch\s*\(/;

export class CheckScriptsTryCatch extends BaseFeature {
  public async handle(hasToSetVariable: boolean): Promise<InconsistencyModel> {
    const scriptsWithProblems = this.voidableScriptsHandle(
      hasToSetVariable
    );

    return {
      message: this.getScriptsMessage(scriptsWithProblems),
      hasInconsistencies: scriptsWithProblems.length > 0,
    };
  }

  private voidableScriptsHandle = (isToCorrect: boolean): BlipAction[] => {
    let scriptsWithProblems: BlipAction[] = [];
    const blocks = getBlocks();

    if (isToCorrect) {
      this.fixVoidableScripts(blocks);
    } else {
      scriptsWithProblems = this.getVoidableScripts(blocks);
    }

    return scriptsWithProblems;
  };

  private getVoidableScripts = (blocks: BlipFlowBlock[]): BlipAction[] => {
    
    let scriptActionsArray = [];
    const scriptsWithProblems = [];

    for (const block of blocks) {
      scriptActionsArray = this.getScriptActions(block);
      for (const scriptAction of scriptActionsArray) {
        const script = scriptAction?.settings?.source;
        if (!this.scriptHasTryCatch(script)) {
          scriptsWithProblems.push(scriptAction);
        }
      }
    }

    return scriptsWithProblems;
  };

  private fixVoidableScripts = (blocks: BlipFlowBlock[]): void => {
    for (const block of blocks) {
      const scriptActions = this.getScriptActions(block);
      for (const action of scriptActions) {
        const scriptContent = action.settings?.source;
        if (scriptContent && !this.scriptHasTryCatch(scriptContent)) {

          // Encontra o corpo da função 'run'
          const functionRegex = /function\s+run\s*\([^)]*\)\s*\{([\s\S]*)\}/;
          const arrowRegex = /const\s+run\s*=\s*\([^)]*\)\s*=>\s*\{([\s\S]*)\}/;
          
          let match = scriptContent.match(functionRegex);

          if (!match) {
            match = scriptContent.match(arrowRegex);
          }
          if (match) {
            const functionBody = match[1].trim();
            
            // Envolve o corpo da função com try/catch
            const newBody = `\n    try {\n        ${functionBody}\n    } catch (e) {\n        return "N/A";\n    }\n`;
            
            // Substitui o corpo antigo pelo novo
            const newScriptContent = scriptContent.replace(functionBody, newBody);
            
            action.settings.source = newScriptContent;
          }
        }
      }
    }
  };

  private handleSubmit = (): void => {
    createConfirmationAlert({
      onCancel: () => removeOverlay(),
      onConfirm: async () => {
        await this.handle(true);
        removeOverlay();
        showSuccessToast("Scripts Corrigidos!");
      },
    });
  };

  private getScriptsMessage = (
    scriptList: BlipAction[]
  ): React.ReactElement => {
    return (
      <>
        <h4>Scripts sem try/catch</h4>
        {scriptList.length > 0 ? (
          this.getScriptsErrorMessage(scriptList)
        ) : (
          <Paragraph>Nenhuma inconsistência encontrada.</Paragraph>
        )}
      </>
    );
  };

  private getScriptsErrorMessage = (
    scriptList: BlipAction[]
  ): React.ReactElement => {
    return (
      <>
        <ul
          style={{
            fontSize: "0.875rem",
            marginTop: "0.5rem",
            color: "#607b99",
          }}
        >
          {scriptList.map((script, index) => (
            <li key={index}>
              {script.blockName} - {script.$title}
            </li>
          ))}
        </ul>

        <Paragraph>
          * Você pode arrumar esses scripts automaticamente apertando no botão
          abaixo.
        </Paragraph>

        <BdsButton type="submit" variant="primary" onClick={this.handleSubmit}>
          Corrigir Scripts
        </BdsButton>
      </>
    );
  };

  private scriptHasTryCatch(script: string): boolean {
    if (!script || script.trim() === "") {
      return true; // Scripts vazios são considerados válidos
    }
    const hasTryCatch = TRY_CATCH_REGEX.test(script);
    return hasTryCatch;
  }

  private getScriptActions = (block: BlipFlowBlock): BlipAction[] => {
    return this.getAllActions(block).filter(this.isScript);
  };

  private getAllActions = (block: BlipFlowBlock): BlipAction[] => {
    const blockName = block.$title;

    return [
      ...block.$enteringCustomActions.map((action) =>
        this.insertBlockNameOnAction(action, blockName)
      ),
      ...block.$leavingCustomActions.map((action) =>
        this.insertBlockNameOnAction(action, blockName)
      ),
    ];
  };

  private insertBlockNameOnAction = (
    action: BlipAction,
    blockName: string
  ): BlipAction => {
    return { ...action, blockName: blockName };
  };

  private isScript = (action: BlipAction): boolean =>
    action?.type === SCRIPT_ACTION_NAME;
}
