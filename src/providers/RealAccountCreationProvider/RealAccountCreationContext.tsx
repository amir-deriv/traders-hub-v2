import React, { createContext, useCallback, useContext, useMemo, useReducer, useState } from 'react';
import { useStep } from 'usehooks-ts';

import { Helpers, TRealAccountCreationContext, TRealAccountCreationProvider } from './types';
import { valuesReducer } from './ValuesReducer';

export const ACTION_TYPES = {
    RESET: 'RESET',
    SET_ADDRESS: 'SET_ADDRESS',
    SET_CURRENCY: 'SET_CURRENCY',
    SET_PERSONAL_DETAILS: 'SET_PERSONAL_DETAILS',
} as const;

const initialHelpers: Helpers = {
    canGoToNextStep: false,
    canGoToPrevStep: false,
    goToNextStep: () => {},
    goToPrevStep: () => {},
    reset: () => {},
    setStep: (() => {}) as React.Dispatch<React.SetStateAction<number>>,
};

export const RealAccountCreationContext = createContext<TRealAccountCreationContext>({
    currentStep: 0,
    dispatch: () => {},
    helpers: initialHelpers,
    isSuccessModalOpen: false,
    isWizardOpen: false,
    setIsSuccessModalOpen: () => {},
    setIsWizardOpen: () => {},
    setTotalSteps: () => {},
    state: {
        currency: '',
    },
    reset: () => {},
    totalSteps: 0,
});

export const useRealAccountCreationContext = () => {
    const context = useContext<TRealAccountCreationContext>(RealAccountCreationContext);
    if (!context)
        throw new Error(
            'useRealAccountCreationContext() must be called within a component wrapped in RealAccountCreationProvider.'
        );

    return context;
};

/**
 * @name RealAccountCreationProvider
 * @description The RealAccountCreationProvider component is used to wrap the components that need access to the RealAccountCreationContext.
 * @param children - The content to be wrapped.
 */
export const RealAccountCreationProvider = ({ children }: TRealAccountCreationProvider) => {
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [totalSteps, setTotalSteps] = useState(0);
    const [currentStep, helpers] = useStep(totalSteps);
    const [state, dispatch] = useReducer(valuesReducer, {
        currency: '',
    });

    const reset = useCallback(() => {
        dispatch({
            type: ACTION_TYPES.RESET,
        });
        setIsSuccessModalOpen(false);
        setIsWizardOpen(false);
        helpers.setStep(1);
    }, [helpers]);

    const contextState: TRealAccountCreationContext = useMemo(
        () => ({
            currentStep,
            dispatch,
            helpers,
            isSuccessModalOpen,
            isWizardOpen,
            setIsSuccessModalOpen,
            setIsWizardOpen,
            state,
            reset,
            setTotalSteps,
            totalSteps,
        }),
        [currentStep, helpers, isSuccessModalOpen, isWizardOpen, reset, state, totalSteps]
    );

    return <RealAccountCreationContext.Provider value={contextState}>{children}</RealAccountCreationContext.Provider>;
};
