"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackController = void 0;
class FeedbackController {
    constructor(credentialStore, feedbackPostClient) {
        this.credentialStore = credentialStore;
        this.feedbackPostClient = feedbackPostClient;
    }
    async sendFeedback(feedback) {
        const { email } = await this.credentialStore.getCredentials();
        return this.feedbackPostClient.sendFeedback({
            summary: feedback.length <= 50 ? feedback : feedback.slice(0, 50) + '...',
            description: feedback,
            email
        });
    }
}
exports.FeedbackController = FeedbackController;
