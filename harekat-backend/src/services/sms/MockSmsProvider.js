import { BaseSmsProvider } from './BaseSmsProvider.js';

export class MockSmsProvider extends BaseSmsProvider {
    getName() {
        return 'mock';
    }

    /**
     * Mock OTP delivery: prints to console for development and testing
     */
    async sendOtp({ phoneNumber, otp }) {
        // Output format required by spec: [OTP MOCK] 09120000000 -> 12345
        console.log(`[OTP MOCK] ${phoneNumber} -> ${otp}`);
        
        return {
            success: true,
            provider: 'mock',
            messageId: `mock-${Date.now()}`
        };
    }
}
