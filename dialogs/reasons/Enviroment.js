
// Import required Bot Builder
const { ComponentDialog, WaterfallDialog, TextPrompt, ChoicePrompt } = require('botbuilder-dialogs');

// Dialog IDs
const ENVIROMENT = 'enviroment';

// Prompt IDs
const REASON_PROMPT = 'reason_prompt';

//Reason type
REASON_TYPE='enviroment'

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
class Enviroment extends ComponentDialog {
    constructor(dialogId, userProfile) {
        super(dialogId);

        // validate what was passed in
        if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
        if (!userProfile) throw new Error('Missing parameter.  userProfile is required');

        // Add a water fall dialog with 4 steps.
        // The order of step function registration is importent
        // as a water fall dialog executes steps registered in order
        this.addDialog(new WaterfallDialog(ENVIROMENT, [
            this.promptReason1.bind(this),
            this.promptReason2.bind(this),
            this.promptReason3.bind(this),
            this.promptReason4.bind(this),
            this.promptReason5.bind(this),
            this.promptReason6.bind(this),
            this.promptReason7.bind(this),
            this.captureReasonEnd.bind(this),
        ]));

        // Add text prompts for name and city
        this.addDialog(new ChoicePrompt(REASON_PROMPT));

        // Save off our state accessor for later use
        this.userProfile = userProfile;
    }

    async promptReason1(step) {
        const user = await this.userProfile.get(step.context, {});
        user.reason = user.reason ? { ...user.reason } : {}
        user.reason['enviroment'] = 0
        await this.userProfile.set(step.context, user);

        return await step.prompt(REASON_PROMPT, 'ඔබ නිතර දූවිලි සහිත පරිසරයක ගැවසෙනවාද?', ['yes', 'no']);
    }

    async promptReason2(step) {
        const user = await this.userProfile.get(step.context, {});
        if (step.result && step.result.value === 'no') {
            user.reason['enviroment']++
            await this.userProfile.set(step.context, user);
        }

        return await step.prompt(REASON_PROMPT, 'එහිදී ඔබ හිස් ආවරනයක් පලදිනවාද?', ['yes', 'no']);
    }

    async promptReason3(step) {
        const user = await this.userProfile.get(step.context, {});
        if (step.result && step.result.value === 'no') {
            user.reason['enviroment']++
            await this.userProfile.set(step.context, user);
        }

        return await step.prompt(REASON_PROMPT, 'ඔබ සාමාන්යෙන් දිනකට පැය 4කට වැඩි කාලයක් හිස් ආවරණයක් පැලද සිටිනවාද?', ['yes', 'no']);
    }

    async promptReason4(step) {
        const user = await this.userProfile.get(step.context, {});
        if (step.result && step.result.value === 'no') {
            user.reason['enviroment']++
            await this.userProfile.set(step.context, user);
        }

        return await step.prompt(REASON_PROMPT, 'ඔබ දිනපතා කොන්ඩය පිරිසිදු කරනවාද?', ['yes', 'no']);
    }

    async promptReason5(step) {
        const user = await this.userProfile.get(step.context, {});
        if (step.result && step.result.value === 'no') {
            user.reason['enviroment']++
            await this.userProfile.set(step.context, user);
        }

        return await step.prompt(REASON_PROMPT, 'ඔබ අධික ලෙස ක්ලෝරීන් හෝ වෙනත් රසායනික ද්‍රව්‍ය අඩංගු ජලයෙන් හිස සෝදනවාද?', ['yes', 'no']);
    }

    async promptReason6(step) {
        const user = await this.userProfile.get(step.context, {});
        if (step.result && step.result.value === 'no') {
            user.reason['enviroment']++
            await this.userProfile.set(step.context, user);
        }

        return await step.prompt(REASON_PROMPT, 'ඔබ කොන්ඩය තෙත් සහිතව තිබියදී තදින් බැඳ තබා ගෙන සිටිනවාද?', ['yes', 'no']);
    }

    async promptReason7(step) {
        const user = await this.userProfile.get(step.context, {});
        if (step.result && step.result.value === 'no') {
            user.reason['enviroment']++
            await this.userProfile.set(step.context, user);
        }

        return await step.prompt(REASON_PROMPT, 'කොන්ඩය තෙත් සහිතව තිබියදී හිස පීරනවාද?', ['yes', 'no']);
    }

    async captureReasonEnd(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'no') {
            user.reason['enviroment']++
            await this.userProfile.set(step.context, user);
        }
        user.reason.enviroment = user.reason.enviroment/7
        user.reason.lastReason = 'enviroment'
        await this.userProfile.set(step.context, user);
        return await step.endDialog();
    }

}

exports.ReasonEnviromentDialog = Enviroment;
