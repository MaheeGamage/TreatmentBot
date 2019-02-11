// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

//Steps
// No Step data - ask basic questions ['කොන්ඩය', 'Skin', 'Lips', 'Nails']
// Step === 2 - ask symptoms eg- kondaya watenawada?

const { ActivityTypes } = require('botbuilder');
const { ChoicePrompt, DialogSet, NumberPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');

const { Step4Dialog } = require('./dialogs/step4');
const DIALOG_STEP_4 = 'dialog_step_4'

/***** Reason Dialogs */
const { ReasonNutritionDialog } = require('./dialogs/reasons/Nutrition');
const { ReasonDepressionDialog } = require('./dialogs/reasons/Depression');
const { ReasonDandruffDialog } = require('./dialogs/reasons/Dandruff');
const { ReasonEnviromentDialog } = require('./dialogs/reasons/Enviroment');
const { ReasonChemicalDialog } = require('./dialogs/reasons/Chemical');
const { ReasonFamilyDialog } = require('./dialogs/reasons/Family');
const { ReasonCatarrhDialog } = require('./dialogs/reasons/Catarrh');
const { ReasonHighTempDialog } = require('./dialogs/reasons/HighTemp');
const { ReasonDryHairDialog } = require('./dialogs/reasons/DryHair');
const { ReasonUncleanDialog } = require('./dialogs/reasons/Unclean');
const { ReasonUnbalanceFoodDialog } = require('./dialogs/reasons/UnbalanceFood');
const { ReasonOtherDialog } = require('./dialogs/reasons/Other');

const DIALOG_REASON_NUTRITION = 'dialog_reason_nutrition';
const DIALOG_REASON_DEPRESSION = 'dialog_reason_depression';
const DIALOG_REASON_DANDRUFF = 'dialog_reason_dandruff';
const DIALOG_REASON_ENVIROMENT = 'dialog_reason_enviroment';
const DIALOG_REASON_CHEMICAL = 'dialog_reason_chemical';
const DIALOG_REASON_FAMILY = 'dialog_reason_family';
const DIALOG_REASON_CATARRH = 'dialog_reason_catarrh';
const DIALOG_REASON_HIGH_TEMP = 'dialog_reason_high_temp';
const DIALOG_REASON_DRY_HAIR = 'dialog_reason_dry_hair';
const DIALOG_REASON_UNCLEAN = 'dialog_reason_unclean';
const DIALOG_REASON_UNBALANCE_FOOD = 'dialog_reason_unbalance_food';
const DIALOG_REASON_OTHER = 'dialog_reason_other';
/******************** */

const DIALOG_STATE_PROPERTY = 'dialogState';
const USER_PROFILE_PROPERTY = 'user';

const WHO_ARE_YOU = 'who_are_you';
const HELLO_USER = 'hello_user';
const GET_TREATMENT_LOCATION = 'get_treatment_location';
const SUGGEST_TREATMENT = 'suggest_treatment';
const SET_NEXT_STEP_4 = 'set_next_step_4'
const DIALOG_HAIR_SYMPTOMS = 'hair_symptoms_dialog';
const DIALOG_HAIR_PROBLEMS = 'dialog_hair_problems'

const DIALOG_FAT_PROBLEMS = 'dialog_fat_problems'

const DIALOG_HAIR_FALL = 'hair_fall_dialog'

const NAME_PROMPT = 'name_prompt';
// const CONFIRM_PROMPT = 'confirm_prompt';
const SYMPTOMS_PROMPT = 'symptoms_prompt';
const AGE_PROMPT = 'age_prompt';
const ILL_LOCATION_PROMPT = 'ILL_LOCATION_PROMPT';
const HAIR_PROBLEM_PROMPT = 'HAIR_PROBLEM_PROMPT';
const RESTART_QUESTION_PROMPT = 'RESTART_QUESTION_PROMPT'

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
        this.dialogs.add(new ChoicePrompt(RESTART_QUESTION_PROMPT));
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

        this.dialogs.add(new Step4Dialog(DIALOG_STEP_4, this.userProfile));

        /*******Reason dialogs */
        this.dialogs.add(new ReasonNutritionDialog(DIALOG_REASON_NUTRITION, this.userProfile));
        this.dialogs.add(new ReasonDepressionDialog(DIALOG_REASON_DEPRESSION, this.userProfile));
        this.dialogs.add(new ReasonDandruffDialog(DIALOG_REASON_DANDRUFF, this.userProfile));
        this.dialogs.add(new ReasonEnviromentDialog(DIALOG_REASON_ENVIROMENT, this.userProfile));
        this.dialogs.add(new ReasonChemicalDialog(DIALOG_REASON_CHEMICAL, this.userProfile));
        this.dialogs.add(new ReasonFamilyDialog(DIALOG_REASON_FAMILY, this.userProfile));
        this.dialogs.add(new ReasonCatarrhDialog(DIALOG_REASON_CATARRH, this.userProfile));
        this.dialogs.add(new ReasonHighTempDialog(DIALOG_REASON_HIGH_TEMP, this.userProfile));
        this.dialogs.add(new ReasonDryHairDialog(DIALOG_REASON_DRY_HAIR, this.userProfile));
        this.dialogs.add(new ReasonUncleanDialog(DIALOG_REASON_UNCLEAN, this.userProfile));
        this.dialogs.add(new ReasonUnbalanceFoodDialog(DIALOG_REASON_UNBALANCE_FOOD, this.userProfile));
        this.dialogs.add(new ReasonOtherDialog(DIALOG_REASON_OTHER, this.userProfile));
        /***********************/

        /********Treatment Dialog ******/
        this.dialogs.add(new WaterfallDialog(SUGGEST_TREATMENT, [
            this.getTreatment.bind(this),
            this.captureRestartQuestion.bind(this),
        ]));
        /*******************************/

        // Create a dialog that asks the user for their name.
        this.dialogs.add(new WaterfallDialog(WHO_ARE_YOU, [
            this.promptForName.bind(this),
            // this.confirmAgePrompt.bind(this),
            this.promptForAge.bind(this),
            this.captureAge.bind(this),
            // this.promptIllLocation.bind(this),
            // this.captureIllLocation.bind(this),
        ]));

        this.dialogs.add(new WaterfallDialog(GET_TREATMENT_LOCATION, [
            this.promptIllLocation.bind(this),
            this.captureIllLocation.bind(this),
        ]));

        this.dialogs.add(new WaterfallDialog(DIALOG_HAIR_PROBLEMS, [
            this.promptHairProblem.bind(this),
            this.captureHairProblem.bind(this),
        ]));

        this.dialogs.add(new WaterfallDialog(DIALOG_FAT_PROBLEMS, [
            this.promptFatProblem.bind(this),
            this.captureFatProblem.bind(this),
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
        // if (step.result !== -1) {
        user.age = step.result;
        user.step = 1
        await this.userProfile.set(step.context, user);
        // await step.context.sendActivity(`I will remember that you are ${step.result} years old.`);
        // } else {
        //     await step.context.sendActivity(`No age given.`);
        // }
        return await step.endDialog(); //step.next(-1); //
    }

    async promptIllLocation(step) {
        return await step.prompt(ILL_LOCATION_PROMPT, 'Where is your ill location', ['කොන්ඩය', 'ස්ථුලතාවය']);
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

    async promptFatProblem(step) {
        return await step.prompt(HAIR_PROBLEM_PROMPT, 'Where is your Hair Problem', ['අධික මේද තැන්පත් වීම', 'බඩ ඉදිරියට නෙරා ඒම']);
    }

    async captureFatProblem(step) {
        const user = await this.userProfile.get(step.context, {});
        user.fatProblem = step.result && step.result.value
        user.step = 3
        await this.userProfile.set(step.context, user);

        return await step.endDialog();
    }

    async goToNextStep4(step) {
        const user = await this.userProfile.get(step.context, {});
        user.step = 4

        console.log('before remove: ')
        console.log(user.reason)
        delete user.reason.lastReason
        // console.log(user.reason)

        var maxProb
        for (var key in user.reason) {
            if (user.reason.hasOwnProperty(key)) {
                if (!maxProb) {
                    maxProb = key
                }
                else {
                    if (user.reason[key] > user.reason[maxProb]) {
                        maxProb = key
                    }

                }
                if (user.reason[key] == 1) {
                    maxProb = key
                    break;
                }
            }
        }
        user.suggestedReason = maxProb

        await this.userProfile.set(step.context, user);
        console.log('highest Prob ' + maxProb)

        await step.context.sendActivity(`Say something to get your treatments`);
        return await step.endDialog();
    }

    async getTreatment(step) {
        const user = await this.userProfile.get(step.context, {});

        await step.context.sendActivity(`Reason: ${user.suggestedReason}`);
        await step.context.sendActivity(`Treatments: ${Treatments[user.suggestedReason]}`);

        return await step.prompt(RESTART_QUESTION_PROMPT, 'Do you have another question', ['ඔව්', 'නැත']);
    }

    async captureRestartQuestion(step) {
        const user = await this.userProfile.get(step.context, {});

        if (step.result && step.result.value === 'ඔව්') {
            let newUser = {}
            newUser.name = user.name
            newUser.age = user.age
            newUser.step = 1
            await this.userProfile.set(step.context, newUser);
        } else {
            await step.context.sendActivity(`Thank you`);
        }


        // return await step.endDialog();
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
                    await this.userProfile.set(dc.context, {});
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
                console.log('Fat: ' + user.location)
                if (!user.step) {
                    await dc.beginDialog(WHO_ARE_YOU);
                }
                else if (user.step === 1) {
                    await dc.beginDialog(GET_TREATMENT_LOCATION);
                }
                else if (user.step === 2) {
                    if (user.location === 'කොන්ඩය') { //&& false
                        await dc.beginDialog(DIALOG_HAIR_PROBLEMS);
                    }
                    if (user.location === 'ස්ථුලතාවය') { //&& false
                        await dc.beginDialog(DIALOG_FAT_PROBLEMS);
                    }
                }
                else if (user.step === 3) {
                    if (user.location === 'කොන්ඩය') { //&& false
                        if (user.hairProblem === 'කොන්ඩය වැටීම') { //&& false
                            // console.log(user.reason)
                            if (user.reason && user.reason.lastReason && user.reason.lastReason === 'nutrition') {
                                // await dc.beginDialog(SET_NEXT_STEP_4)
                                await dc.beginDialog(DIALOG_REASON_DEPRESSION)
                            }
                            else if (user.reason && user.reason.lastReason && user.reason.lastReason === 'depression') {
                                await dc.beginDialog(DIALOG_REASON_DANDRUFF)
                            }
                            else if (user.reason && user.reason.lastReason && user.reason.lastReason === 'dandruff') {
                                await dc.beginDialog(DIALOG_REASON_ENVIROMENT)
                            }
                            else if (user.reason && user.reason.lastReason && user.reason.lastReason === 'enviroment') {
                                console.log('Reason enviroment dialog')
                                await dc.beginDialog(DIALOG_REASON_CHEMICAL)
                            }
                            else if (user.reason && user.reason.lastReason && user.reason.lastReason === 'chemical') {
                                console.log('Reason chemical dialog')
                                await dc.beginDialog(SET_NEXT_STEP_4)
                            }
                            else
                                await dc.beginDialog(DIALOG_REASON_NUTRITION);

                        }
                        else if (user.hairProblem === 'කොන්ඩය තුනී වීම') { //&& false
                            // console.log(user.reason)
                            if (user.reason && user.reason.lastReason && user.reason.lastReason === 'family') {
                                await dc.beginDialog(DIALOG_REASON_CATARRH)
                            }
                            else if (user.reason && user.reason.lastReason && user.reason.lastReason === 'catarrh') {
                                await dc.beginDialog(DIALOG_REASON_CHEMICAL)
                            }
                            else if (user.reason && user.reason.lastReason && user.reason.lastReason === 'chemical') {
                                console.log(user.reason)
                                await dc.beginDialog(SET_NEXT_STEP_4)
                            }
                            else
                                await dc.beginDialog(DIALOG_REASON_FAMILY);

                        }
                        else if (user.hairProblem === 'කෙස් අග පැලීම') { //&& false
                            // console.log(user.reason)
                            if (user.reason && user.reason.lastReason && user.reason.lastReason === 'dry_hair') {
                                await dc.beginDialog(DIALOG_REASON_CHEMICAL)
                            }
                            else if (user.reason && user.reason.lastReason && user.reason.lastReason === 'chemical') {
                                await dc.beginDialog(DIALOG_REASON_NUTRITION)
                            }
                            else if (user.reason && user.reason.lastReason && user.reason.lastReason === 'nutrition') {
                                await dc.beginDialog(DIALOG_REASON_HIGH_TEMP)
                            }
                            else if (user.reason && user.reason.lastReason && user.reason.lastReason === 'high_temp') {
                                await dc.beginDialog(SET_NEXT_STEP_4)
                            }
                            else
                                await dc.beginDialog(DIALOG_REASON_DRY_HAIR);

                        }
                        else if (user.hairProblem === 'කෙස් වර්ධනය හීන වීම') { //&& false
                            // console.log(user.reason)
                            if (user.reason && user.reason.lastReason && user.reason.lastReason === 'nutrition') {
                                await dc.beginDialog(DIALOG_REASON_CHEMICAL)
                            }
                            else if (user.reason && user.reason.lastReason && user.reason.lastReason === 'chemical') {
                                await dc.beginDialog(DIALOG_REASON_FAMILY)
                            }
                            else if (user.reason && user.reason.lastReason && user.reason.lastReason === 'family') {
                                await dc.beginDialog(DIALOG_REASON_DEPRESSION)
                            }
                            else if (user.reason && user.reason.lastReason && user.reason.lastReason === 'depression') {
                                console.log(user.reason)
                                await dc.beginDialog(SET_NEXT_STEP_4)
                            }
                            else
                                await dc.beginDialog(DIALOG_REASON_NUTRITION);

                        }
                        else if (user.hairProblem === 'ඉස්සොරි/හිස්සොරි/හිස්හොරි') { //&& false
                            // console.log(user.reason)
                            if (user.reason && user.reason.lastReason && user.reason.lastReason === 'dandruff') {
                                console.log(user.reason)
                                await dc.beginDialog(SET_NEXT_STEP_4)
                            }
                            else
                                await dc.beginDialog(DIALOG_REASON_DANDRUFF);

                        }
                        else if (user.hairProblem === 'පරපොශිතයන්') { //&& false
                            // console.log(user.reason)
                            if (user.reason && user.reason.lastReason && user.reason.lastReason === 'unclean') {
                                console.log(user.reason)
                                await dc.beginDialog(SET_NEXT_STEP_4)
                            }
                            else
                                await dc.beginDialog(DIALOG_REASON_UNCLEAN);

                        }
                        else if (user.hairProblem === 'කොන්ඩය සුදු වීම') { //&& false
                            // console.log(user.reason)
                            if (user.reason && user.reason.lastReason && user.reason.lastReason === 'nutrition') {
                                await dc.beginDialog(DIALOG_REASON_CHEMICAL)
                            }
                            else if (user.reason && user.reason.lastReason && user.reason.lastReason === 'chemical') {
                                await dc.beginDialog(DIALOG_REASON_FAMILY)
                            }
                            else if (user.reason && user.reason.lastReason && user.reason.lastReason === 'family') {
                                await dc.beginDialog(DIALOG_REASON_DEPRESSION)
                            }
                            else if (user.reason && user.reason.lastReason && user.reason.lastReason === 'depression') {
                                console.log(user.reason)
                                await dc.beginDialog(SET_NEXT_STEP_4)
                            }
                            else
                                await dc.beginDialog(DIALOG_REASON_NUTRITION);

                        }
                    }
                    else if (user.location === 'ස්ථුලතාවය') {
                        if (user.fatProblem === 'අධික මේද තැන්පත් වීම') { //&& false
                            // console.log(user.reason)
                            if (user.reason && user.reason.lastReason && user.reason.lastReason === 'unbalance_food') {
                                // await dc.beginDialog(SET_NEXT_STEP_4)
                                await dc.beginDialog(DIALOG_REASON_FAMILY)
                            }
                            else if (user.reason && user.reason.lastReason && user.reason.lastReason === 'family') {
                                await dc.beginDialog(SET_NEXT_STEP_4)
                            }
                            else
                                await dc.beginDialog(DIALOG_REASON_UNBALANCE_FOOD);

                        }
                        else if (user.fatProblem === 'බඩ ඉදිරියට නෙරා ඒම') { //&& false
                            // console.log(user.reason)
                            if (user.reason && user.reason.lastReason && user.reason.lastReason === 'unbalance_food') {
                                // await dc.beginDialog(SET_NEXT_STEP_4)
                                await dc.beginDialog(DIALOG_REASON_FAMILY)
                            }
                            else if (user.reason && user.reason.lastReason && user.reason.lastReason === 'family') {
                                await dc.beginDialog(SET_NEXT_STEP_4)
                            }
                            else
                                await dc.beginDialog(DIALOG_REASON_UNBALANCE_FOOD);

                        }
                    }

                }
                else if (user.step === 4) {
                    console.log(user.reason)
                    await dc.beginDialog(SUGGEST_TREATMENT);
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

const Treatments = {
    nutrition: 'get nutrition',
    depression: 'reduce depression',
    dandruff: 'remove dandruff',
    enviroment: 'better enviroment',
    chemical: 'remove chemical',
}
