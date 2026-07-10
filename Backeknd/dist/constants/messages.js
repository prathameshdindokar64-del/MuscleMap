"use strict";
/**
 * Warning messages and disclaimer text.
 * All user-facing text related to risk assessment is centralized here.
 * EXTENSIBILITY: Add multi-language support by loading these from a locale file or DB.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISCLAIMER_TEXT = exports.WARNING_TEXT = void 0;
/** Warning text mapped to each risk level */
exports.WARNING_TEXT = {
    mild: 'This appears to be mild discomfort. Try the suggested exercises gently. If pain persists or worsens after a few days, consult a physiotherapist.',
    moderate: 'Your symptoms suggest moderate pain. Avoid activities that aggravate it. If no improvement in 5–7 days, see a physiotherapist or doctor.',
    severe: 'Your pain level is significant. Rest the affected area and avoid strenuous activity. We strongly recommend consulting a physiotherapist or doctor soon.',
    red_flag: 'WARNING: Your symptoms include red-flag signs such as severe intensity, numbness, or prolonged duration. Please consult a doctor promptly. If you experience chest pain, arm weakness, bladder or bowel changes, or loss of sensation — go to an emergency facility immediately.',
};
/** Standard disclaimer appended to every assessment result */
exports.DISCLAIMER_TEXT = 'This information is for educational and self-care guidance only. It is not a medical diagnosis or a substitute for professional medical advice. If you are unsure about your symptoms, always consult a qualified healthcare professional.';
//# sourceMappingURL=messages.js.map