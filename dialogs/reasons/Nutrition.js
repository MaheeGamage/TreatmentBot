
// Import required Bot Builder
const { ComponentDialog, WaterfallDialog, TextPrompt, ChoicePrompt } = require('botbuilder-dialogs');

// Dialog IDs
const NUTRITION = 'nutrition';

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
class Nutrition extends ComponentDialog {
    constructor(dialogId, userProfile) {
        super(dialogId);

        // validate what was passed in
        if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
        if (!userProfile) throw new Error('Missing parameter.  userProfile is required');

        // Add a water fall dialog with 4 steps.
        // The order of step function registration is importent
        // as a water fall dialog executes steps registered in order
        this.addDialog(new WaterfallDialog(NUTRITION, [
            this.promptNutritionFruit.bind(this),
            this.promptNutritionKola.bind(this),
            this.promptNutritionSuppliment.bind(this),
            this.captureNutritionEnd.bind(this),
        ]));

        // Add text prompts for name and city
        this.addDialog(new ChoicePrompt(REASON_PROMPT));

        // Save off our state accessor for later use
        this.userProfile = userProfile;
    }

    async promptNutritionFruit(step) {
        const user = await this.userProfile.get(step.context, {});
        user.reason = {}
        user.reason.nutrition = 0
        await this.userProfile.set(step.context, user);

        return await step.prompt(REASON_PROMPT, 'ඔබ දිනපතා ආහාර වේලට එළවළුවක්, පලා වර්ගයක් හෝ පලතුරු වර්ගයක් අතුලත් කරගන්නවාද?', ['yes', 'no']);
    }
    async promptNutritionKola(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'no') {
            user.reason.nutrition++
            await this.userProfile.set(step.context, user);
        }
        
        return await step.prompt(REASON_PROMPT, 'ඔබ අවම වශයෙන් සතියකට ආහාර වේල් 5ක් සඳහා වත් පලා වර්ග එක්කර ගන්නවාද?', ['yes', 'no']);
    }
    async promptNutritionSuppliment(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'no') {
            user.reason.nutrition++
            await this.userProfile.set(step.context, user);
        }

        return await step.prompt(REASON_PROMPT, 'ඔබ බාහිර පෝශණ සත්කාරයක් ලබා ගන්නවාද?', ['yes', 'no']);
    }

    async captureNutritionEnd(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'no') {
            user.reason.nutrition++
            await this.userProfile.set(step.context, user);
        }
        user.reason.nutrition /= 3
        user.reason.lastReason = 'nutrition'
        await this.userProfile.set(step.context, user);
        return await step.endDialog();
    }
}

exports.ReasonNutritionDialog = Nutrition;
