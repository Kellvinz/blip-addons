import * as React from 'react';
import { BdsButton } from 'blip-ds/dist/blip-ds-react';

import { Paragraph, Block } from '~/Components';

import { TrackingsInconsistencies } from '@features/CheckInconsistencies/Trackings';
import { CheckLoopsOnFlow } from '@features/CheckInconsistencies/LoopsAndMaxBlocks';
import { TautologyInconsistencies } from '@features/CheckInconsistencies/Tautology';
import { showSuccessToast, showWarningToast } from '~/Utils';

const MAX_STATES_WITHOUT_INPUT = 35;

export const InconsistenciesForm = (): JSX.Element => {
  const [tautologyInconsistenceMessage, setTautologyMessage] = React.useState();
  const [loopBlocksMessage, setLoopBlocksMessage] = React.useState();
  const [trackingInconsistenceMessage, setTrackingInconsistenceMessage] =
    React.useState();

  /**
   * Runs the 'CheckInconsistencies' fature, thus check for Inconsistencies on the flow
   */
  const handleInconsistencies = (): void => {
    const loopCheck: any = new CheckLoopsOnFlow().handle();
    const trackingCheck: any = new TrackingsInconsistencies().handle(false);
    const tautologyCheck: any = new TautologyInconsistencies().handle(false);

    setLoopBlocksMessage(loopCheck.message);
    setTrackingInconsistenceMessage(trackingCheck.message);
    setTautologyMessage(tautologyCheck.message);

    if (
      loopCheck.hasInconsistencies ||
      trackingCheck.hasInconsistencies ||
      tautologyCheck.hasInconsistencies
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
          Condições de saída de blocos ou de execução de ações com tautologia
        </li>
      </ul>

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

      <Block paddingY={1}>{tautologyInconsistenceMessage}</Block>
    </>
  );
};
