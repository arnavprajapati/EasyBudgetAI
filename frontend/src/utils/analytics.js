import * as amplitude from '@amplitude/unified';

const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY;

if (AMPLITUDE_API_KEY) {
    amplitude.initAll(AMPLITUDE_API_KEY, {
        analytics: {
            autocapture: {
                attribution: true,
                fileDownloads: true,
                formInteractions: true,
                pageViews: true,
                sessions: true,
                elementInteractions: true
            },
            sampleRate: 1
        }
    });
}

export const trackEvent = (eventName, properties = {}) => {
    if (AMPLITUDE_API_KEY) {
        amplitude.track(eventName, {
            ...properties,
            timestamp: new Date().toISOString()
        });
    }
};

export const identifyUser = (userId, userProperties = {}) => {
    if (AMPLITUDE_API_KEY) {
        amplitude.setUserId(userId);
        if (Object.keys(userProperties).length > 0) {
            const identify = new amplitude.Identify();
            Object.entries(userProperties).forEach(([key, value]) => {
                identify.set(key, value);
            });
            amplitude.identify(identify);
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
