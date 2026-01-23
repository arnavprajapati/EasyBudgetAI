import * as amplitude from '@amplitude/analytics-browser';

const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY;

let isInitialized = false;

const initializeAmplitude = () => {
    if (!AMPLITUDE_API_KEY) {
        console.warn('Amplitude API key not found in environment variables');
        return;
    }

    if (isInitialized) return;

    try {
        amplitude.init(AMPLITUDE_API_KEY, {
            defaultTracking: {
                sessions: true,
                pageViews: true,
                formInteractions: false,
                fileDownloads: false,
            },
            logLevel: import.meta.env.DEV ? amplitude.Types.LogLevel.Warn : amplitude.Types.LogLevel.None,
        });
        isInitialized = true;
    } catch (error) {
        console.error('Failed to initialize Amplitude:', error);
    }
};

if (AMPLITUDE_API_KEY) {
    initializeAmplitude();
}

export const trackEvent = (eventName, properties = {}) => {
    if (!isInitialized) return;
    
    try {
        amplitude.track(eventName, properties);
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('Amplitude track error:', error);
        }
    }
};

export const identifyUser = (userId, userProperties = {}) => {
    if (!isInitialized) return;
    
    try {
        amplitude.setUserId(userId);
        if (Object.keys(userProperties).length > 0) {
            const identify = new amplitude.Identify();
            Object.entries(userProperties).forEach(([key, value]) => {
                identify.set(key, value);
            });
            amplitude.identify(identify);
        }
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('Amplitude identify error:', error);
        }
    }
};

export const analytics = {
    login: (method = 'email') => trackEvent('Login', { method }),
    register: (method = 'email') => trackEvent('Register', { method }),
    logout: () => trackEvent('Logout'),
    
    pageView: (pageName, properties = {}) => trackEvent('Page View', { page: pageName, ...properties }),
    
    addTransaction: (type, amount, category) => trackEvent('Transaction Added', { type, amount, category }),
    editTransaction: (type, amount, category) => trackEvent('Transaction Edited', { type, amount, category }),
    deleteTransaction: (type, amount) => trackEvent('Transaction Deleted', { type, amount }),
    
    viewParty: (partyName) => trackEvent('Party Viewed', { partyName }),
    viewPartyDetails: (partyName, balance) => trackEvent('Party Details Opened', { partyName, balance }),
    
    filterChanged: (filterType, value) => trackEvent('Filter Changed', { filterType, value }),
    
    modalOpened: (modalName) => trackEvent('Modal Opened', { modal: modalName }),
    modalClosed: (modalName) => trackEvent('Modal Closed', { modal: modalName }),
    
    telegramLinkStarted: () => trackEvent('Telegram Link Started'),
    telegramLinkCompleted: () => trackEvent('Telegram Link Completed'),
    
    buttonClick: (buttonName, location) => trackEvent('Button Clicked', { button: buttonName, location }),
    
    error: (errorType, message) => trackEvent('Error Occurred', { errorType, message })
};

export default analytics;