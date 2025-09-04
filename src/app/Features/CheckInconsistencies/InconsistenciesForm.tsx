import * as React from 'react';
import { BdsButton,BdsTypo } from 'blip-ds/dist/blip-ds-react';
import { Paragraph, Block, Switch, Flex } from '~/Components';
import { TrackingsInconsistencies } from '@features/CheckInconsistencies/Trackings';
import { CheckLoopsOnFlow } from '@features/CheckInconsistencies/LoopsAndMaxBlocks';
import { CheckScriptsTryCatch } from '@features/CheckInconsistencies/TryCatch';
import { showSuccessToast, showWarningToast } from '~/Utils';

const MAX_STATES_WITHOUT_INPUT = 35;

export const InconsistenciesForm = (): JSX.Element => {
  const [scriptInconsistenceMessage, setScriptInconsistenceMessage] = React.useState();
  const [loopBlocksMessage, setLoopBlocksMessage] = React.useState();
  const [trackingInconsistenceMessage, setTrackingInconsistenceMessage] = React.useState();
  const [isLoopCheckEnabled, setIsLoopCheckEnabled] = React.useState(true);
  const [isTrackingCheckEnabled, setIsTrackingCheckEnabled] = React.useState(true);
  const [isScriptCheckEnabled, setIsScriptCheckEnabled] = React.useState(true);

  /**
   * Runs the 'CheckInconsistencies' fature, thus check for Inconsistencies on the flow
   */
  const handleInconsistencies = async (): Promise<void> => {
    setLoopBlocksMessage(undefined);
    setTrackingInconsistenceMessage(undefined);
    setScriptInconsistenceMessage(undefined);

    let loopCheck: any = {
      hasInconsistencies: false,
      message: ''
    };

    let trackingCheck: any = {
      hasInconsistencies: false,
      message: ''
    };

    let scriptCheck: any = {
      hasInconsistencies: false,
      message: ''
    };

    if(isLoopCheckEnabled) {
      loopCheck = new CheckLoopsOnFlow().handle();
      setLoopBlocksMessage(loopCheck.message);
    }

    if(isTrackingCheckEnabled){
      trackingCheck = new TrackingsInconsistencies().handle(false);
      setTrackingInconsistenceMessage(trackingCheck.message);
    }

    if(isScriptCheckEnabled){
      scriptCheck = await new CheckScriptsTryCatch().handle(false);
      setScriptInconsistenceMessage(scriptCheck.message);
    }

    if (
      loopCheck?.hasInconsistencies ||
      trackingCheck?.hasInconsistencies ||
      scriptCheck?.hasInconsistencies
    ) {
      showWarningToast('Foi encontrada alguma inconsistência no fluxo.');
    } else {
      showSuccessToast('Não foi encontrada nenhuma inconsistência no fluxo.');
    }
  };

  /*
  Adicionar um checkbox com quais inconsistencias gostaria que fossem verificadas
  */
  return (
    <>
      <Paragraph>Este recurso irá procurar por</Paragraph>
      <ul
        style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#607b99' }}
      >
        <li>Registros de eventos que podem ter a action vazia</li>
        <li>Loops no fluxo</li>
        <li>
          Cascata de blocos com mais de {MAX_STATES_WITHOUT_INPUT} blocos sem
          entrada do usuário
        </li>
        <li>
          Scripts que não possuem tratamento de erro (try/catch)
        </li>
      </ul>

      <Flex marginTop={2}>
          <Switch
            isChecked={isLoopCheckEnabled}
            name="isLoopCheckEnabled"
            onChange={(e) => setIsLoopCheckEnabled(e.target.checked)}
          />

          <Block marginLeft={2}>
            <BdsTypo bold="extra-bold" variant="fs-14">
              Verificar a existência de loops
            </BdsTypo>
          </Block>
      </Flex>

      <Flex marginTop={2}>
          <Switch
            isChecked={isTrackingCheckEnabled}
            name="isTrackingCheckEnabled"
            onChange={(e) => setIsTrackingCheckEnabled(e.target.checked)}
          />

          <Block marginLeft={2}>
            <BdsTypo bold="extra-bold" variant="fs-14">
              Verificar trackings potencialmente nulas
            </BdsTypo>
          </Block>
      </Flex>

      <Flex marginTop={2}>
          <Switch
            isChecked={isScriptCheckEnabled}
            name="isScriptCheckEnabled"
            onChange={(e) => setIsScriptCheckEnabled(e.target.checked)}
          />

          <Block marginLeft={2}>
            <BdsTypo bold="extra-bold" variant="fs-14">
              Verificar scripts sem try/catch
            </BdsTypo>
          </Block>
      </Flex>

      <Block marginTop={2}>
        <BdsButton
          type="submit"
          variant="primary"
          onClick={handleInconsistencies}
        >
          Verificar
        </BdsButton>
      </Block>

      <Block paddingY={1}>{loopBlocksMessage}</Block>

      <Block paddingY={1}>{trackingInconsistenceMessage}</Block>

      <Block paddingY={1}>{scriptInconsistenceMessage}</Block>
    </>
  );
};
