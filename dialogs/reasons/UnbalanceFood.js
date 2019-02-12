
// Import required Bot Builder
const { ComponentDialog, WaterfallDialog, TextPrompt, ChoicePrompt } = require('botbuilder-dialogs');

// Dialog IDs
const WATERFALL_DIALOG_ID = 'unbalance_food';

// Prompt IDs
const REASON_PROMPT = 'reason_prompt';

//Reason type
const REASON_TYPE='unbalance_food'

class UnbalanceFood extends ComponentDialog {
    constructor(dialogId, userProfile) {
        super(dialogId);

        // validate what was passed in
        if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
        if (!userProfile) throw new Error('Missing parameter.  userProfile is required');

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG_ID, [
            this.promptReason1.bind(this),
            this.promptReason2.bind(this),
            this.promptReason3.bind(this),
            this.promptReason4.bind(this),
            this.promptReason5.bind(this),
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

        return await step.prompt(REASON_PROMPT, 'ඔබ අධික මේදය සහිත ආහාර වර්ග නිතරම ආහාරgයට ගන්නවාද?', ['ඔව්', 'නැත']);
    }

    async promptReason2(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'ඔව්') {
            user.reason[REASON_TYPE]++
            await this.userProfile.set(step.context, user);
        }

        return await step.prompt(REASON_PROMPT, 'ඔබ දිනකට ආහාර වේල් කීයක් ලබා ගන්නවාද?', ['3ට අඩු', '3ට වැඩි']);
    }

    async promptReason3(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === '3ට වැඩි') {
            user.reason[REASON_TYPE]++
            await this.userProfile.set(step.context, user);
        }

        return await step.prompt(REASON_PROMPT, 'ඔබ ප්‍රධාන ආහාර වේල් වලට අමතරව ආහාර වේල් කීයක් ලබා ගන්නවාද?', ['3ට අඩු', '3ට වැඩි']);
    }

    async promptReason4(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === '3ට වැඩි') {
            user.reason[REASON_TYPE]++
            await this.userProfile.set(step.context, user);
        }

        return await step.prompt(REASON_PROMPT, 'ප්‍රධාන ආහාර වේල් සඳහා ඔබ වැඩි වශයෙන් පිටි සහිත ආහාර / ක්ශනික ආහාර ලබා ගන්නවාද?', ['ඔව්', 'නැත']);
    }

    async promptReason5(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'ඔව්') {
            user.reason[REASON_TYPE]++
            await this.userProfile.set(step.context, user);
        }

        return await step.prompt(REASON_PROMPT, 'ඔබ දිනකට කොපමණ වේලාවක් ව්‍යායාම් / දහදිය දමන ක්‍රියාවල නිරත වෙනවාද?', ['පැය 2ට අඩු', 'පැය2ට වැඩි']);
    }

    async captureReasonEnd(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'පැය 2ට අඩු') {
            user.reason[REASON_TYPE]++
            await this.userProfile.set(step.context, user);
        }
        
        user.reason[REASON_TYPE] /= 5
        user.reason.lastReason = 'unbalance_food'
        await this.userProfile.set(step.context, user);
        return await step.endDialog();
    }

}

exports.ReasonUnbalanceFoodDialog = UnbalanceFood;
