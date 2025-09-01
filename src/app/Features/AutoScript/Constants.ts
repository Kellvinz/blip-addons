import { BlipAction } from '../../types';

export const AUTO_SCRIPT_ACTION: Partial<BlipAction> = {
    $title: 'Set userInput',
    type: 'ExecuteScript',
    settings: {
        function: 'run',
        source: `function run(input) {
    try {
        input = JSON.parse(input);
    } catch (e) {
        "N/A"
    }
    return input;
}`,
        inputVariables: ['input.content'],
        outputVariable: 'userInput',
    },
};
