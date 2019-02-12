
// Import required Bot Builder
const { ComponentDialog, WaterfallDialog, TextPrompt, ChoicePrompt } = require('botbuilder-dialogs');

// Dialog IDs
const WATERFALL_DIALOG_ID = 'dry_hair';

// Prompt IDs
const REASON_PROMPT = 'reason_prompt';

//Reason type
const REASON_TYPE='dry_hair'

class DryHair extends ComponentDialog {
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
        user.reason['dry_hair'] = 0
        await this.userProfile.set(step.context, user);

        return await step.prompt(REASON_PROMPT, 'ඔබගේ හිස කෙස්වල වියලි ස්වභාවයක් තිබේද?', ['ඔව්', 'නැත']);
    }

    async promptReason2(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'ඔව්') {
            user.reason['dry_hair']++
            await this.userProfile.set(step.context, user);
        }

        return await step.prompt(REASON_PROMPT, 'ඔබගේ හිස කෙස් තෙත් සහිතව බොහෝ වේලාවක් තිබෙනවාද?', ['ඔව්', 'නැත']);
    }

    async captureReasonEnd(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'නැත') {
            user.reason['dry_hair']++
            await this.userProfile.set(step.context, user);
        }
        
        user.reason[REASON_TYPE] /= 2
        user.reason.lastReason = 'dry_hair'
        await this.userProfile.set(step.context, user);
        return await step.endDialog();
    }

}

exports.ReasonDryHairDialog = DryHair;
