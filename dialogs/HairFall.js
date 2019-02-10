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
const HAIR_FALL = 'hair_fall_dialog';

// Prompt IDs
const REASON_PROMPT = 'reason_prompt';

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
class HairFall extends ComponentDialog {
    constructor(dialogId, userProfile) {
        super(dialogId);

        // validate what was passed in
        if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
        if (!userProfile) throw new Error('Missing parameter.  userProfile is required');

        // Add a water fall dialog with 4 steps.
        // The order of step function registration is importent
        // as a water fall dialog executes steps registered in order
        this.addDialog(new WaterfallDialog(HAIR_FALL, [
            this.promptNutritionFruit.bind(this),
            this.promptNutritionKola.bind(this),
            this.promptNutritionSuppliment.bind(this),
            this.captureNutritionEnd.bind(this),
            this.promptDepressionSleep.bind(this),
            this.promptDepressionSad.bind(this),
            this.promptDepressionEnviroment.bind(this),
            this.promptDepressionAngry.bind(this),
            this.captureDpressionEnd.bind(this),
            this.promptDandruffHave.bind(this),
            this.promptDandruffDry.bind(this),
            this.captureDandruffEnd.bind(this),
        ]));

        // Add text prompts for name and city
        this.addDialog(new ChoicePrompt(REASON_PROMPT));

        // Save off our state accessor for later use
        this.userProfile = userProfile;
    }
    
    async promptNutritionFruit(step) {
        const user = await this.userProfile.get(step.context, {});
        user.reason = user.reason ? {...user.reason} : {}
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

        return await step.next();
    }

    async promptDepressionSleep(step) {
        const user = await this.userProfile.get(step.context, {});
        user.reason = user.reason ? {...user.reason} : {}
        user.reason.depression = 0
        await this.userProfile.set(step.context, user);
    
        return await step.prompt(REASON_PROMPT, 'ඔබ අවම වශයෙන් පැය 8ක රාත්‍රී නින්දක් ලබා ගන්නවද?', ['yes', 'no']);
    }
    async promptDepressionSad(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'no') {
            user.reason.depression++
            await this.userProfile.set(step.context, user);
        }
        
        return await step.prompt(REASON_PROMPT, 'ඔබ මේ දිනවල කිසියම් ගැටලුවක් සම්බන්ධව සිත් තැවුලෙන් පසු වෙනවාද?', ['yes', 'no']);
    }
    async promptDepressionEnviroment(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'no') {
            user.reason.depression++
            await this.userProfile.set(step.context, user);
        }
    
        return await step.prompt(REASON_PROMPT, 'ඔබ කිසියම් අසහනකාරී පරිසරයක ජීවත් වනවාද?', ['yes', 'no']);
    }
    async promptDepressionAngry(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'no') {
            user.reason.depression++
            await this.userProfile.set(step.context, user);
        }
    
        return await step.prompt(REASON_PROMPT, 'මේ දිනවල ඔබට නිතර කේන්තියන ස්වභාවයක් තිබේද?', ['yes', 'no']);
    }
    
    async captureDpressionEnd(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'no') {
            user.reason.depression++
            await this.userProfile.set(step.context, user);
        }
    
        return await step.next();
    }

    async promptDandruffHave(step) {
        const user = await this.userProfile.get(step.context, {});
        user.reason = user.reason ? {...user.reason} : {}
        user.reason.dandruff = 0
        await this.userProfile.set(step.context, user);
    
        return await step.prompt(REASON_PROMPT, 'ඔබට හිශොරි තිබෙද?', ['yes', 'no']);
    }
    
    async promptDandruffDry(step) {
        const user = await this.userProfile.get(step.context, {});
        if (step.result && step.result.value === 'no') {
            user.reason.dandruff++
            await this.userProfile.set(step.context, user);
        }
    
        return await step.prompt(REASON_PROMPT, 'ඔබේ හිස් කබලේ නිතර වියලි ස්වභාවයක් තිබේද?', ['yes', 'no']);
    }
    
    async captureDandruffEnd(step) {
        const user = await this.userProfile.get(step.context);
        if (step.result && step.result.value === 'no') {
            user.reason.dandruff++
            await this.userProfile.set(step.context, user);
        }
    
        return await step.next();
    }
}

exports.HairFallDialog = HairFall;
