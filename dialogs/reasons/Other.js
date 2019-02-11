
// Import required Bot Builder
const { ComponentDialog, WaterfallDialog, TextPrompt, ChoicePrompt } = require('botbuilder-dialogs');

// Dialog IDs
const WATERFALL_DIALOG_ID = 'other';

// Prompt IDs
const REASON_PROMPT = 'reason_prompt';

//Reason type
const REASON_TYPE='other'

class Other extends ComponentDialog {
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

        return await step.prompt(REASON_PROMPT, 'ඔබට වෙනත් රෝග තත්වයන් කිසිවක් තිබේද?', ['ඔව්', 'නැත']);
    }

    async promptReason2(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'ඔව්') {
            user.reason[REASON_TYPE]++
            await this.userProfile.set(step.context, user);
        }

        return await step.prompt(REASON_PROMPT, 'තිබේ නම් එය කුමක්ද?', ['ඔව්', 'නැත']);
    }

    async promptReason2(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'ඔව්') {
            user.reason[REASON_TYPE]++
            await this.userProfile.set(step.context, user);
        }

        return await step.prompt(REASON_PROMPT, 'ඔබ කල්පවත්නා රෝග තත්වයකට ගොදුරු වී සිටියාද? හෝ දැනට එවැනි රෝගී තත්වයක් පවතීද?', ['ඔව්', 'නැත']);
    }

    async captureReasonEnd(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'ඔව්') {
            user.reason[REASON_TYPE]++
            await this.userProfile.set(step.context, user);
        }
        
        user.reason[REASON_TYPE] /= 3
        user.reason.lastReason = 'other'
        await this.userProfile.set(step.context, user);
        return await step.endDialog();
    }

}

exports.ReasonOtherDialog = Other;
