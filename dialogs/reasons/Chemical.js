
// Import required Bot Builder
const { ComponentDialog, WaterfallDialog, TextPrompt, ChoicePrompt } = require('botbuilder-dialogs');

// Dialog IDs
const CHEMICAL = 'chemical';

// Prompt IDs
const REASON_PROMPT = 'reason_prompt';

//Reason type
REASON_TYPE='chemical'

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
class Chemical extends ComponentDialog {
    constructor(dialogId, userProfile) {
        super(dialogId);

        // validate what was passed in
        if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
        if (!userProfile) throw new Error('Missing parameter.  userProfile is required');

        // Add a water fall dialog with 4 steps.
        // The order of step function registration is importent
        // as a water fall dialog executes steps registered in order
        this.addDialog(new WaterfallDialog(CHEMICAL, [
            this.promptReason1.bind(this),
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
        user.reason[REASON_TYPE] = 0
        await this.userProfile.set(step.context, user);

        return await step.prompt(REASON_PROMPT, 'ඔබ කිසියම් රසායනික ආලේපනයක් හිසෙහි ගල්වනවාද?', ['yes', 'no']);
    }

    async captureReasonEnd(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'no') {
            user.reason[REASON_TYPE]++
            await this.userProfile.set(step.context, user);
        }
        user.reason.lastReason = REASON_TYPE
        await this.userProfile.set(step.context, user);
        return await step.endDialog();
    }

}

exports.ReasonChemicalDialog = Chemical;
