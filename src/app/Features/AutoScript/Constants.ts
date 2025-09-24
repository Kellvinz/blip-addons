import { BlipAction } from '../../types';

export const AUTO_SCRIPT_ACTION: Partial<BlipAction> = {
    $title: 'set menuChoice',
    type: 'ExecuteScript',
    settings: {
        function: 'run',
        source: `function run(userInput) {
    const regex = new RegExp('__REGEX_PATTERN__', 'i');
    
    if (regex.test(userInput)) {
        return userInput;
    }
    
    return null;
}`,
        inputVariables: ['input.content'],
        outputVariable: 'menuChoice',
    },
};
