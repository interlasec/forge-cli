"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = exports.loginCommandHandler = void 0;
const tslib_1 = require("tslib");
const child_process_1 = tslib_1.__importDefault(require("child_process"));
const cli_shared_1 = require("@forge/cli-shared");
const cli_shared_2 = require("@forge/cli-shared");
const anon_user_id_1 = require("./anon-user-id");
function guessEmail() {
    const child = child_process_1.default.spawnSync('git', ['config', '--global', 'user.email'], { encoding: 'utf8', shell: true });
    if (child.status || child.error) {
        return undefined;
    }
    return child.stdout.trim();
}
async function loginCommandHandler(ui, instructionsUrl, loginCommand, { email, token }) {
    try {
        ui.info(cli_shared_2.Text.login.introText);
        ui.info(cli_shared_2.Text.ctrlC);
        ui.emptyLine();
        if (!email) {
            const maybeEmail = guessEmail();
            email = await ui.promptForText(cli_shared_2.Text.login.promptEmail, maybeEmail);
            ui.emptyLine();
        }
        if (!token) {
            ui.info(cli_shared_2.Text.login.url(instructionsUrl));
            ui.emptyLine();
            token = await ui.promptForSecret(cli_shared_2.Text.login.promptToken);
            ui.emptyLine();
        }
        const args = { email, token };
        const { creds, analytics } = await ui.displayProgress(() => loginCommand.execute(args), cli_shared_2.Text.login.checking, (data) => cli_shared_2.Text.login.success(data.user.name));
        ui.emptyLine();
        ui.info(cli_shared_2.Text.login.nextStep);
        return {
            creds,
            analytics: Object.assign(Object.assign({}, analytics), { anonymousId: (0, anon_user_id_1.getAnonId)(true) })
        };
    }
    catch (error) {
        throw error instanceof cli_shared_1.UserNotFoundError ? new cli_shared_1.UserNotFoundError(cli_shared_2.Text.login.error) : error;
    }
}
exports.loginCommandHandler = loginCommandHandler;
function registerLoginCommand({ cmd, ui, commands: { loginCommand } }) {
    const instructionsUrl = (0, cli_shared_1.getInstructionsUrl)();
    cmd
        .command('login')
        .description(cli_shared_2.Text.login.cmd)
        .option('-u, --email <user email>', cli_shared_2.Text.login.optionEmail)
        .option('-t, --token <api token>', cli_shared_2.Text.login.optionToken)
        .requireNoAuthentication()
        .nonInteractiveOption('--email', '--token')
        .action((options) => loginCommandHandler(ui, instructionsUrl, loginCommand, options));
}
function registerLogoutCommand({ cmd, ui, commands: { logoutCommand } }) {
    cmd
        .command('logout')
        .description(cli_shared_2.Text.logout.cmd)
        .requireNoAuthentication()
        .action(async () => {
        await logoutCommand.execute();
        ui.info(cli_shared_2.Text.logout.loggedOut);
    });
}
function registerWhoAmICommand({ cmd, ui, services: { credentialStore }, commands: { loginCommand } }) {
    cmd
        .command('whoami')
        .description(cli_shared_2.Text.whoami.cmd)
        .action(async () => {
        try {
            const credentials = await credentialStore.getCredentials();
            const { name, accountId } = await loginCommand.getUser(credentials);
            ui.info(cli_shared_2.Text.whoami.success.personalCredentials(credentials.email, name, accountId));
        }
        catch (error) {
            if (error instanceof cli_shared_1.UserNotFoundError) {
                if (process.env[cli_shared_1.EMAIL_KEY] && process.env[cli_shared_1.API_TOKEN_KEY]) {
                    throw new cli_shared_1.UserNotFoundError(cli_shared_2.Text.whoami.error.personalCredentialsEnv(cli_shared_1.EMAIL_KEY, cli_shared_1.API_TOKEN_KEY));
                }
                else {
                    throw new cli_shared_1.UserNotFoundError(cli_shared_2.Text.whoami.error.personalCredentialsKeytar);
                }
            }
            throw error;
        }
    });
}
function registerCommands(deps) {
    registerLoginCommand(deps);
    registerLogoutCommand(deps);
    registerWhoAmICommand(deps);
}
exports.registerCommands = registerCommands;
