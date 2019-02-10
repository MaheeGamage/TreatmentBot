// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

//Steps
// No Step data - ask basic questions ['කොන්ඩය', 'Skin', 'Lips', 'Nails']
// Step === 2 - ask symptoms eg- kondaya watenawada?

const { ActivityTypes } = require('botbuilder');
const { ChoicePrompt, DialogSet, NumberPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');

// const { HairSymptomsDialog } = require('./dialogs/HairSymptoms');
// const { HairFallDialog } = require('./dialogs/HairFall');

/***** Reason Dialogs */
const { ReasonNutritionDialog } = require('./dialogs/reasons/Nutrition');
const { ReasonDepressionDialog } = require('./dialogs/reasons/Depression');
const { ReasonDandruffDialog } = require('./dialogs/reasons/Dandruff');
const { ReasonEnviromentDialog } = require('./dialogs/reasons/Enviroment');
const { ReasonChemicalDialog } = require('./dialogs/reasons/Chemical');

const DIALOG_REASON_NUTRITION = 'dialog_reason_nutrition';
const DIALOG_REASON_DEPRESSION = 'dialog_reason_depression';
const DIALOG_REASON_DANDRUFF = 'dialog_reason_dandruff';
const DIALOG_REASON_ENVIROMENT = 'dialog_reason_enviroment';
const DIALOG_REASON_CHEMICAL = 'dialog_reason_chemical';
/******************** */

const DIALOG_STATE_PROPERTY = 'dialogState';
const USER_PROFILE_PROPERTY = 'user';

const WHO_ARE_YOU = 'who_are_you';
const HELLO_USER = 'hello_user';
const SET_NEXT_STEP_4 = 'set_next_step_4'
const DIALOG_HAIR_SYMPTOMS = 'hair_symptoms_dialog';
const DIALOG_HAIR_PROBLEMS = 'dialog_hair_problems'

const DIALOG_HAIR_FALL = 'hair_fall_dialog'

const NAME_PROMPT = 'name_prompt';
// const CONFIRM_PROMPT = 'confirm_prompt';
const SYMPTOMS_PROMPT = 'symptoms_prompt';
const AGE_PROMPT = 'age_prompt';
const ILL_LOCATION_PROMPT = 'ILL_LOCATION_PROMPT';
const HAIR_PROBLEM_PROMPT = 'HAIR_PROBLEM_PROMPT';

class MultiTurnBot {
    /**
     *
     * @param {ConversationState} conversationState A ConversationState object used to store the dialog state.
     * @param {UserState} userState A UserState object used to store values specific to the user.
     */
    constructor(conversationState, userState) {
        // Create a new state accessor property. See https://aka.ms/about-bot-state-accessors to learn more about bot state and state accessors.
        this.conversationState = conversationState;
        this.userState = userState;

        this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);

        this.userProfile = this.userState.createProperty(USER_PROFILE_PROPERTY);

        this.dialogs = new DialogSet(this.dialogState);

        // Add prompts that will be used by the main dialogs.
        this.dialogs.add(new TextPrompt(NAME_PROMPT));
        // this.dialogs.add(new ChoicePrompt(CONFIRM_PROMPT));
        this.dialogs.add(new ChoicePrompt(ILL_LOCATION_PROMPT));
        this.dialogs.add(new ChoicePrompt(SYMPTOMS_PROMPT));
        this.dialogs.add(new ChoicePrompt(HAIR_PROBLEM_PROMPT));
        this.dialogs.add(new NumberPrompt(AGE_PROMPT, async (prompt) => {
            if (prompt.recognized.succeeded) {
                if (prompt.recognized.value <= 0) {
                    await prompt.context.sendActivity(`Your age can't be less than zero.`);
                    return false;
                } else {
                    return true;
                }
            }

            return false;
        }));

        /*******Reason dialogs */
        this.dialogs.add(new ReasonNutritionDialog(DIALOG_REASON_NUTRITION, this.userProfile));
        this.dialogs.add(new ReasonDepressionDialog(DIALOG_REASON_DEPRESSION, this.userProfile));
        this.dialogs.add(new ReasonDandruffDialog(DIALOG_REASON_DANDRUFF, this.userProfile));
        this.dialogs.add(new ReasonEnviromentDialog(DIALOG_REASON_ENVIROMENT, this.userProfile));
        this.dialogs.add(new ReasonChemicalDialog(DIALOG_REASON_CHEMICAL, this.userProfile));
        /***********************/

        // Create a dialog that asks the user for their name.
        this.dialogs.add(new WaterfallDialog(WHO_ARE_YOU, [
            this.promptForName.bind(this),
            // this.confirmAgePrompt.bind(this),
            this.promptForAge.bind(this),
            this.captureAge.bind(this),
            this.promptIllLocation.bind(this),
            this.captureIllLocation.bind(this),
        ]));

        this.dialogs.add(new WaterfallDialog(DIALOG_HAIR_PROBLEMS, [
            this.promptHairProblem.bind(this),
            this.captureHairProblem.bind(this),
        ]));

        // Create a dialog that displays a user name after it has been collected.
        this.dialogs.add(new WaterfallDialog(HELLO_USER, [
            this.displayProfile.bind(this)
        ]));

        // Create a dialog that set step of User state to next step number.
        this.dialogs.add(new WaterfallDialog(SET_NEXT_STEP_4, [
            this.goToNextStep4.bind(this)
        ]));
    }

    // This step in the dialog prompts the user for their name.
    async promptForName(step) {
        return await step.prompt(NAME_PROMPT, `ඔබගේ නම කුමක්ද?`);
    }

    // This step captures the user's name, then prompts whether or not to collect an age.
    async promptForAge(step) {
        const user = await this.userProfile.get(step.context, {});
        user.name = step.result;
        await this.userProfile.set(step.context, user);
        return await step.prompt(AGE_PROMPT, `What is your age?`,
            {
                retryPrompt: 'Sorry, please specify your age as a positive number or say cancel.'
            }
        );
    }

    // This step checks the user's response - if yes, the bot will proceed to prompt for age.
    // Otherwise, the bot will skip the age step.
    // async promptForAge(step) {
    //     if (step.result && step.result.value === 'yes') {
    //         return await step.prompt(AGE_PROMPT, `What is your age?`,
    //             {
    //                 retryPrompt: 'Sorry, please specify your age as a positive number or say cancel.'
    //             }
    //         );
    //     } else {
    //         return await step.next(-1);
    //     }
    // }

    // This step captures the user's age.
    async captureAge(step) {
        const user = await this.userProfile.get(step.context, {});
        if (step.result !== -1) {
            user.age = step.result;
            await this.userProfile.set(step.context, user);
            await step.context.sendActivity(`I will remember that you are ${step.result} years old.`);
        } else {
            await step.context.sendActivity(`No age given.`);
        }
        return await step.next(-1); //step.endDialog();
    }

    async promptIllLocation(step) {
        return await step.prompt(ILL_LOCATION_PROMPT, 'Where is your ill location', ['කොන්ඩය', 'Skin', 'Lips', 'Nails']);
    }

    async captureIllLocation(step) {
        const user = await this.userProfile.get(step.context, {});
        user.location = step.result && step.result.value
        user.step = 2
        await this.userProfile.set(step.context, user);

        return await step.endDialog();
    }

    async promptHairProblem(step) {
        return await step.prompt(HAIR_PROBLEM_PROMPT, 'Where is your Hair Problem', ['කොන්ඩය වැටීම', 'කොන්ඩය තුනී වීම',
            'කෙස් අග පැලීම', 'කෙස් වර්ධනය හීන වීම', 'ඉස්සොරි/හිස්සොරි/හිස්හොරි', 'පරපොශිතයන්', 'කොන්ඩය සුදු වීම']);
    }

    async captureHairProblem(step) {
        const user = await this.userProfile.get(step.context, {});
        user.hairProblem = step.result && step.result.value
        user.step = 3
        await this.userProfile.set(step.context, user);

        return await step.endDialog();
    }

    async goToNextStep4(step) {
        const user = await this.userProfile.get(step.context, {});
        user.step = 4
        await this.userProfile.set(step.context, user);
        console.log('end of step 3')
        // return await step.endDialog();
        
        await step.context.sendActivity(`Say something to get your treatments`);
    }


    // This step displays the captured information back to the user.
    async displayProfile(step) {
        const user = await this.userProfile.get(step.context, {});
        if (user.age) {
            await step.context.sendActivity(`Your name is ${user.name} and you are ${user.age} years old.`);
        } else {
            await step.context.sendActivity(`Your name is ${user.name} and you did not share your age.`);
        }

        return await step.endDialog();
    }

    /**
     *
     * @param {TurnContext} turnContext A TurnContext object that will be interpreted and acted upon by the bot.
     */
    async onTurn(turnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        if (turnContext.activity.type === ActivityTypes.Message) {
            // Create a dialog context object.
            const dc = await this.dialogs.createContext(turnContext);

            const utterance = (turnContext.activity.text || '').trim().toLowerCase();
            if (utterance === 'cancel') {
                // await this.userProfile.delete()
                if (dc.activeDialog) {
                    await dc.cancelAllDialogs();
                    await dc.context.sendActivity(`Ok... canceled.`);
                } else {
                    await dc.context.sendActivity(`Nothing to cancel.`);
                }

            }

            // If the bot has not yet responded, continue processing the current dialog.
            await dc.continueDialog();

            // Start the sample dialog in response to any other input.
            if (!turnContext.responded) {
                const user = await this.userProfile.get(dc.context, {});
                console.log('out: ' + user.step)
                if (!user.step) {
                    await dc.beginDialog(WHO_ARE_YOU);
                }
                else if (user.step === 2) {
                    if (user.location === 'කොන්ඩය') { //&& false
                        await dc.beginDialog(DIALOG_HAIR_PROBLEMS);
                    }
                }
                else if (user.step === 3) {
                    if (user.location === 'කොන්ඩය') { //&& false
                        if (user.hairProblem === 'කොන්ඩය වැටීම') { //&& false
                            // console.log(user.reason)
                            if (user.reason && user.reason.lastReason && user.reason.lastReason === 'nutrition') {
                                await dc.beginDialog(SET_NEXT_STEP_4)
                                // await dc.beginDialog(DIALOG_REASON_DEPRESSION)
                            }
                            else if (user.reason && user.reason.lastReason && user.reason.lastReason === 'depression') {
                                await dc.beginDialog(DIALOG_REASON_DANDRUFF)
                            }
                            else if (user.reason && user.reason.lastReason && user.reason.lastReason === 'dandruff') {
                                await dc.beginDialog(DIALOG_REASON_ENVIROMENT)
                            }
                            else if (user.reason && user.reason.lastReason && user.reason.lastReason === 'enviroment') {
                                await dc.beginDialog(DIALOG_REASON_CHEMICAL)
                            }
                            else if (user.reason && user.reason.lastReason && user.reason.lastReason === 'chemical') {
                                await dc.beginDialog(SET_NEXT_STEP_4)
                            }
                            else
                                await dc.beginDialog(DIALOG_REASON_NUTRITION);

                        }
                    }
                }
                else if (user.step === 4) {
                    console.log(user.step)
                    await dc.beginDialog(HELLO_USER);
                }

            }
        } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
            // Do we have any new members added to the conversation?
            if (turnContext.activity.membersAdded.length !== 0) {
                // Iterate over all new members added to the conversation
                for (var idx in turnContext.activity.membersAdded) {
                    // Greet anyone that was not the target (recipient) of this message.
                    // Since the bot is the recipient for events from the channel,
                    // context.activity.membersAdded === context.activity.recipient.Id indicates the
                    // bot was added to the conversation, and the opposite indicates this is a user.
                    if (turnContext.activity.membersAdded[idx].id !== turnContext.activity.recipient.id) {
                        // Send a "this is what the bot does" message.
                        const description = [
                            'I am a bot that demonstrates the TextPrompt and NumberPrompt classes',
                            'to collect your name and age, then store those values in UserState for later use.',
                            'Say anything to continue.'
                        ];
                        await turnContext.sendActivity(description.join(' '));
                    }
                }
            }
        }

        // Save changes to the user state.
        await this.userState.saveChanges(turnContext);

        // End this turn by saving changes to the conversation state.
        await this.conversationState.saveChanges(turnContext);
    }
}

module.exports.MultiTurnBot = MultiTurnBot;


