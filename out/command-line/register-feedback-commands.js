"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const registerFeedbackCommands = ({ cmd, ui, controllers: { feedbackController } }) => {
    cmd
        .command(cli_shared_1.Text.feedback.cmd)
        .description(cli_shared_1.Text.feedback.description)
        .action(async () => {
        ui.info(cli_shared_1.Text.feedback.action.start);
        const feedback = await ui.promptForText(cli_shared_1.Text.feedback.action.enterFeedbackPrompt);
        if (!feedback || 0 === feedback.trim().length)
            return;
        ui.emptyLine();
        try {
            await ui.displayProgress(() => feedbackController.sendFeedback(feedback), cli_shared_1.Text.feedback.action.sendingFeedbackProgress, (result) => {
                const successful = result.status == 200;
                return {
                    successful,
                    message: successful ? cli_shared_1.Text.feedback.action.success : cli_shared_1.Text.feedback.action.error
                };
            });
        }
        catch (e) {
            throw new Error(cli_shared_1.Text.feedback.action.error);
        }
    });
};
const registerCommands = (deps) => {
    registerFeedbackCommands(deps);
};
exports.registerCommands = registerCommands;
