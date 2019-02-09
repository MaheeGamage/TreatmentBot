// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// greeting.js defines the greeting dialog

// Import required Bot Builder
const { ComponentDialog, WaterfallDialog, TextPrompt, ChoicePrompt } = require('botbuilder-dialogs');

// User state for greeting dialog
// const { UserProfile } = require('./userProfile');

// Minimum length requirements for city and name
// const CITY_LENGTH_MIN = 5;
// const NAME_LENGTH_MIN = 3;

// Dialog IDs
const HAIR_SYMPTOMS_DIALOG = 'hair_symptoms_dialog';

// Prompt IDs
const SYMPTOMS_PROMPT = 'symptoms_prompt';

const VALIDATION_SUCCEEDED = true;
const VALIDATION_FAILED = !VALIDATION_SUCCEEDED;

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
class HairSymptoms extends ComponentDialog {
    constructor(dialogId, userProfile) {
        super(dialogId);

        // validate what was passed in
        if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
        if (!userProfile) throw new Error('Missing parameter.  userProfile is required');

        // Add a water fall dialog with 4 steps.
        // The order of step function registration is importent
        // as a water fall dialog executes steps registered in order
        this.addDialog(new WaterfallDialog(HAIR_SYMPTOMS_DIALOG, [
            this.promptSymptomHairFall.bind(this),
            this.promptSymptomHairThin.bind(this),
            this.promptSymptomHairCrack.bind(this),
            this.promptSymptomHairSlowGrow.bind(this),
            this.promptSymptomHairDandruff.bind(this),
            this.promptSymptomHairInsect.bind(this),
            this.promptSymptomHairWhite.bind(this),
            this.promptSymptomHairNextStep.bind(this),
        ]));

        // Add text prompts for name and city
        this.addDialog(new ChoicePrompt(SYMPTOMS_PROMPT));

        // Save off our state accessor for later use
        this.userProfile = userProfile;
    }
    
    async promptSymptomHairFall(step) {
        console.log('1bc')
        return await step.prompt(SYMPTOMS_PROMPT, 'කොන්ඩය වැටීමෙන් පෙලෙනවාද?', ['yes', 'no']);
    }
    async promptSymptomHairThin(step) {
        console.log('1bc')
        const user = await this.userProfile.get(step.context);
        user.hair = {}
        user.hair.fall = step.result && step.result.value
        await this.userProfile.set(step.context, user);

        return await step.prompt(SYMPTOMS_PROMPT, 'කොන්ඩය තුනී වීමෙන් පෙලෙනවාද?', ['yes', 'no']);
    }
    async promptSymptomHairCrack(step) {
        const user = await this.userProfile.get(step.context, {});
        user.hair.thin = step.result && step.result.value
        await this.userProfile.set(step.context, user);

        return await step.prompt(SYMPTOMS_PROMPT, 'කෙස් අග පැලීමෙන් පෙලෙනවාද?', ['yes', 'no']);
    }
    async promptSymptomHairSlowGrow(step) {
        const user = await this.userProfile.get(step.context, {});
        user.hair.crack = step.result && step.result.value
        await this.userProfile.set(step.context, user);

        return await step.prompt(SYMPTOMS_PROMPT, 'හිසකෙස් වර්ධනය හීනද?', ['yes', 'no']);
    }
    async promptSymptomHairDandruff(step) {
        const user = await this.userProfile.get(step.context, {});
        user.hair.slowGrow = step.result && step.result.value
        await this.userProfile.set(step.context, user);

        return await step.prompt(SYMPTOMS_PROMPT, 'හිස්සොරි වලින් පීඩා විදිනවාද?', ['yes', 'no']);
    }
    async promptSymptomHairInsect(step) {
        const user = await this.userProfile.get(step.context, {});
        user.hair.dandruff = step.result && step.result.value
        await this.userProfile.set(step.context, user);

        return await step.prompt(SYMPTOMS_PROMPT, 'පරපොශිතයන්ගෙන් පීඩා විදිනවාද?', ['yes', 'no']);
    }
    async promptSymptomHairWhite(step) {
        const user = await this.userProfile.get(step.context, {});
        user.hair.insect = step.result && step.result.value
        await this.userProfile.set(step.context, user);

        return await step.prompt(SYMPTOMS_PROMPT, 'කොන්ඩය සුදු වීමෙන් පෙලෙනවාද?', ['yes', 'no']);
    }
    async promptSymptomHairNextStep(step) {
        const user = await this.userProfile.get(step.context, {});
        user.hair.white = step.result && step.result.value
        user.step=3
        await this.userProfile.set(step.context, user); 

        return await step.endDialog();
    }
}

exports.HairSymptomsDialog = HairSymptoms;
