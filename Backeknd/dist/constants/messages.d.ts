/**
 * Warning messages and disclaimer text.
 * All user-facing text related to risk assessment is centralized here.
 * EXTENSIBILITY: Add multi-language support by loading these from a locale file or DB.
 */
import { RiskLevel } from '../types';
/** Warning text mapped to each risk level */
export declare const WARNING_TEXT: Record<RiskLevel, string>;
/** Standard disclaimer appended to every assessment result */
export declare const DISCLAIMER_TEXT = "This information is for educational and self-care guidance only. It is not a medical diagnosis or a substitute for professional medical advice. If you are unsure about your symptoms, always consult a qualified healthcare professional.";
//# sourceMappingURL=messages.d.ts.map