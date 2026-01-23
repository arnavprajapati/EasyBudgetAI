const trackEvent = (eventName, properties = {}) => {
    if (import.meta.env.DEV) {
        console.log(`[Analytics] ${eventName}`, properties);
    }
};

export const identifyUser = (userId, userProperties = {}) => {
    if (import.meta.env.DEV) {
        console.log(`[Analytics] Identify User: ${userId}`, userProperties);
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

export { trackEvent };
export default analytics;