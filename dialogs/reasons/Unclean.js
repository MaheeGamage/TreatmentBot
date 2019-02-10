
// Import required Bot Builder
const { ComponentDialog, WaterfallDialog, TextPrompt, ChoicePrompt } = require('botbuilder-dialogs');

// Dialog IDs
const WATERFALL_DIALOG_ID = 'unclean';

// Prompt IDs
const REASON_PROMPT = 'reason_prompt';

//Reason type
const REASON_TYPE='unclean'

class Unclean extends ComponentDialog {
    constructor(dialogId, userProfile) {
        super(dialogId);

        // validate what was passed in
        if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
        if (!userProfile) throw new Error('Missing parameter.  userProfile is required');

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG_ID, [
            this.promptReason1.bind(this),
            this.promptReason2.bind(this),
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

        return await step.prompt(REASON_PROMPT, 'ඔබට නිතර අධික ලෙස දහදිය දමනවාද?', ['ඔව්', 'නැත']);
    }

    async promptReason2(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'ඔව්') {
            user.reason[REASON_TYPE]++
            await this.userProfile.set(step.context, user);
        }

        return await step.prompt(REASON_PROMPT, 'ඔබ නිතර අපිරිසිදු ඇදුම් පැලදුම් අදිනවාද?', ['ඔව්', 'නැත']);
    }

    async promptReason2(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'ඔව්') {
            user.reason[REASON_TYPE]++
            await this.userProfile.set(step.context, user);
        }

        return await step.prompt(REASON_PROMPT, 'ඔබට දවසේ වැඩි කාලයක් අපිරිසිදු පරිසරයක සිටීමට සිදුවෙනවාද?', ['ඔව්', 'නැත']);
    }

    async captureReasonEnd(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'ඔව්') {
            user.reason[REASON_TYPE]++
            await this.userProfile.set(step.context, user);
        }
        
        user.reason[REASON_TYPE] /= 3
        user.reason.lastReason = 'unclean'
        await this.userProfile.set(step.context, user);
        return await step.endDialog();
    }

}

exports.ReasonUncleanDialog = Unclean;
