import React, { createContext, useContext, useState, useEffect } from 'react';
import { tourConfig } from '../constants/tourConfig';

const TourContext = createContext(null);

export const TourProvider = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [config, setConfig] = useState([]);
    const [hasSeenTour, setHasSeenTour] = useState(false);

    useEffect(() => {
        const seen = localStorage.getItem('mad_erp_tour_completed');
        if (seen) setHasSeenTour(true);
    }, []);

    const startTour = (moduleName) => {
        const moduleSteps = tourConfig[moduleName] || [];
        if (moduleSteps.length > 0) {
            setConfig(moduleSteps);
            setCurrentStep(0);
            setIsActive(true);
        }
    };

    const endTour = () => {
        setIsActive(false);
        setCurrentStep(0);
        localStorage.setItem('mad_erp_tour_completed', 'true');
        setHasSeenTour(true);
    };

    const nextStep = () => {
        if (currentStep < config.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            endTour();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <TourContext.Provider value={{
            isActive,
            currentStep,
            totalSteps: config.length,
            stepData: config[currentStep],
            startTour,
            endTour,
            nextStep,
            prevStep,
            hasSeenTour
        }}>
            {children}
        </TourContext.Provider>
    );
};

export const useTour = () => {
    const context = useContext(TourContext);
    if (!context) throw new Error('useTour must be used within a TourProvider');
    return context;
};
