
// Import required Bot Builder
const { ComponentDialog, WaterfallDialog, TextPrompt, ChoicePrompt } = require('botbuilder-dialogs');

// Dialog IDs
const DEPRESSION = 'depression';

// Prompt IDs
const REASON_PROMPT = 'reason_prompt';

// const VALIDATION_SUCCEEDED = true;
// const VALIDATION_FAILED = !VALIDATION_SUCCEEDED;

/**
 * Demonstrates the following concepts:
 *  Use a subclass of ComponentDialog to implement a multi-turn conversation
 *  Use a Waterfall dialog to model multi-turn conversation flow
 *  Use custom prompts to validate user input
 *  Store conversation and user state
 *
 * @param {String} dialogId unique identifier for this dialog instance
 * @param {PropertyStateAccessor} userProfile property accessor for user state
 */
class Depression extends ComponentDialog {
    constructor(dialogId, userProfile) {
        super(dialogId);

        // validate what was passed in
        if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
        if (!userProfile) throw new Error('Missing parameter.  userProfile is required');

        // Add a water fall dialog with 4 steps.
        // The order of step function registration is importent
        // as a water fall dialog executes steps registered in order
        this.addDialog(new WaterfallDialog(DEPRESSION, [
            this.promptDepressionSleep.bind(this),
            this.promptDepressionSad.bind(this),
            this.promptDepressionEnviroment.bind(this),
            this.promptDepressionAngry.bind(this),
            this.captureDpressionEnd.bind(this),
        ]));

        // Add text prompts for name and city
        this.addDialog(new ChoicePrompt(REASON_PROMPT));

        // Save off our state accessor for later use
        this.userProfile = userProfile;
    }

    async promptDepressionSleep(step) {
        const user = await this.userProfile.get(step.context, {});
        user.reason = user.reason ? {...user.reason} : {}
        user.reason.depression = 0
        await this.userProfile.set(step.context, user);
    
        return await step.prompt(REASON_PROMPT, 'ඔබ අවම වශයෙන් පැය 8ක රාත්‍රී නින්දක් ලබා ගන්නවද?', ['ඔව්', 'නැත']);
    }
    async promptDepressionSad(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'නැත') {
            user.reason.depression++
            await this.userProfile.set(step.context, user);
        }
        
        return await step.prompt(REASON_PROMPT, 'ඔබ මේ දිනවල කිසියම් ගැටලුවක් සම්බන්ධව සිත් තැවුලෙන් පසු වෙනවාද?', ['ඔව්', 'නැත']);
    }
    async promptDepressionEnviroment(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'නැත') {
            user.reason.depression++
            await this.userProfile.set(step.context, user);
        }
    
        return await step.prompt(REASON_PROMPT, 'ඔබ කිසියම් අසහනකාරී පරිසරයක ජීවත් වනවාද?', ['ඔව්', 'නැත']);
    }
    async promptDepressionAngry(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'නැත') {
            user.reason.depression++
            await this.userProfile.set(step.context, user);
        }
    
        return await step.prompt(REASON_PROMPT, 'මේ දිනවල ඔබට නිතර කේන්තියන ස්වභාවයක් තිබේද?', ['ඔව්', 'නැත']);
    }
    
    async captureDpressionEnd(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'නැත') {
            user.reason.depression++
            await this.userProfile.set(step.context, user);
        }
        user.reason.depression = user.reason.depression/4
        user.reason.lastReason = 'depression'
        await this.userProfile.set(step.context, user);
        return await step.endDialog();
    }
}

exports.ReasonDepressionDialog = Depression;
