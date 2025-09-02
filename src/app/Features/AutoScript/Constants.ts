import { BlipAction } from '../../types';

export const AUTO_SCRIPT_ACTION: Partial<BlipAction> = {
    $title: 'set menuOptionSelected',
    type: 'ExecuteScript',
    settings: {
        function: 'run',
        source: `function run(userInput) {
    // Este padrão de regex será substituído dinamicamente
    const regex = new RegExp('__REGEX_PATTERN__', 'i');
    
    if (regex.test(userInput)) {
        return userInput;
    }
    
    return null;
}`,
        inputVariables: ['input.content'],
        outputVariable: 'menuOptionSelected',
    },
};
