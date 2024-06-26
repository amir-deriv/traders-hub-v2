import { memo, useMemo } from 'react';

import { useRegulationFlags } from '@/hooks';
import { useRealAccountCreationContext } from '@/providers';
import {
    Address,
    CurrencySelector,
    FinancialAssessment,
    PersonalDetails,
    TermsOfUse,
    TradingAssessment,
} from '@/screens';

/**
 * @name WizardScreens
 * @description The WizardScreens component is used to render the screens in the RealAccountCreation component based on the active step from `RealAccountCreationContext`.
 * @example
 * return (
 *   <WizardScreens />
 * );
 */
export const WizardScreens = memo(() => {
    const { currentStep } = useRealAccountCreationContext();
    const { regulationFlags } = useRegulationFlags();
    const { isEU } = regulationFlags;

    // If the user is in the EU, we need to display the TradingAssessment and FinancialAssessment screens
    const screens = useMemo(() => {
        if (isEU) {
            return [CurrencySelector, PersonalDetails, Address, TradingAssessment, FinancialAssessment, TermsOfUse];
        }
        return [CurrencySelector, PersonalDetails, Address, TermsOfUse];
    }, [isEU]);

    // currentStep is 1-indexed, so we need to subtract 1 to get the correct index
    const Screen = screens[currentStep - 1];

    return <Screen />;
});

WizardScreens.displayName = 'WizardScreens';
