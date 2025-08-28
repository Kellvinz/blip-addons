import { BlipAction } from '../../types';

export const AUTO_EVENT_TRACKING_ID = 'auto-event-tracking';

export const ENTERING_TRACKING_ACTION: Partial<BlipAction> = {
    $title: 'exibicao|{{state.name}}',
    type: 'TrackEvent',
    settings: {
        category: 'exibicao|{{state.name}}',
        action: 'exibicao',
    },
};

export const LEAVING_TRACKING_ACTIONS: Partial<BlipAction>[] = [
    {
        $title: 'input|{{state.name}}',
        type: 'TrackEvent',
        settings: {
            category: 'input|{{state.name}}',
            action: 'selecao',
            extras: {
                input: '{{input.content}}',
            },
        },
    },
    {
        $title: 'inesperado|{{state.name}}',
        type: 'TrackEvent',
        settings: {
            category: 'inesperado|{{state.name}}',
            action: 'inesperado',
            extras: {
                input: '{{input.content}}',
            },
        },
    },
    {
        $title: 'inatividade|{{state.name}}',
        type: 'TrackEvent',
        settings: {
            category: 'Inatividade|{{state.name}}',
            action: 'inatividade',
            conditions: {
                comparision: 'notExists',
                source: 'input',
            },
        },
    },
];

