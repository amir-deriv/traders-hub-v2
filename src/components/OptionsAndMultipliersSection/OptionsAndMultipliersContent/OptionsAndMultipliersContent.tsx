import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthData } from '@deriv-com/api-hooks';
import { Button, useDevice } from '@deriv-com/ui';
import { URLUtils } from '@deriv-com/utils';

import { TradingAccountCard, TradingAccountCardContent, TradingAppCardLoader } from '@/components';
import { optionsAndMultipliersContent } from '@/constants';
import { getUrlBinaryBot, getUrlDerivTrader, getUrlSmartTrader } from '@/helpers';
import { useActiveDerivTradingAccount, useRegulationFlags } from '@/hooks';

type OptionsAndMultipliersContentItem = {
    description: string;
    icon: JSX.Element;
    isExternal?: boolean;
    redirect: string;
    smallIcon: JSX.Element;
    title: string;
};

const { getDerivStaticURL } = URLUtils;

type TShowButtonProps = Pick<OptionsAndMultipliersContentItem, 'isExternal' | 'redirect'>;

type TLinkTitleProps = Pick<OptionsAndMultipliersContentItem, 'icon' | 'title'>;

const LinkTitle = ({ icon, title }: TLinkTitleProps) => {
    const handleClick = (
        event:
            | React.KeyboardEvent<HTMLButtonElement>
            | React.MouseEvent<HTMLButtonElement, MouseEvent>
            | React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        event.persist();
        switch (title) {
            case 'Deriv Trader':
                window.open(getUrlDerivTrader());
                break;
            case 'Deriv Bot':
                window.open(getDerivStaticURL(`/dbot`));
                break;
            case 'SmartTrader':
                window.open(getUrlSmartTrader());
                break;
            case 'Binary Bot':
                window.open(getUrlBinaryBot());
                break;
            case 'Deriv GO':
                window.open(getDerivStaticURL('/deriv-go'));
                break;
            default:
                break;
        }
    };
    return (
        // Had to result to button instead of div because of sonarcloud
        <button
            className='cursor-pointer'
            onClick={event => handleClick(event)}
            onKeyDown={event => {
                if (event.key === 'Enter') {
                    handleClick(event);
                }
            }}
        >
            {icon}
        </button>
    );
};

const ShowOpenButton = ({ isExternal, redirect }: TShowButtonProps) => {
    const navigate = useNavigate();

    const { regulationFlags } = useRegulationFlags();
    const { noRealCRNonEUAccount, noRealMFEUAccount } = regulationFlags;

    if (noRealCRNonEUAccount || noRealMFEUAccount) return null;

    return (
        <Button
            onClick={() => {
                if (isExternal) {
                    window.open(redirect, '_blank');
                } else {
                    navigate(redirect);
                }
            }}
            size='sm'
        >
            Open
        </Button>
    );
};

/**
 *  `OptionsAndMultipliersContent` is a component that renders the internal deriv trading platforms.
 * @returns {React.ElementType} The `OptionsAndMultipliersContent` component.
 */
export const OptionsAndMultipliersContent = () => {
    const { isDesktop } = useDevice();
    const { data } = useActiveDerivTradingAccount();
    const { regulationFlags } = useRegulationFlags();
    const { isEU, isSuccess: isRegulationAccessible } = regulationFlags;
    const { isAuthorized } = useAuthData();

    const getoptionsAndMultipliersContent = optionsAndMultipliersContent(isEU ?? false);

    const filteredContent = isEU
        ? getoptionsAndMultipliersContent.filter(account => account.title === 'Deriv Trader')
        : getoptionsAndMultipliersContent;

    if (!isRegulationAccessible && isAuthorized)
        return (
            <div className='pt-40'>
                <TradingAppCardLoader />
            </div>
        );

    return (
        <div className='grid w-full grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-x-24 lg:gap-y-4'>
            {filteredContent.map(account => {
                const { description, icon, isExternal, redirect, smallIcon, title } = account;

                const trailingComponent = () => <ShowOpenButton isExternal={isExternal} redirect={redirect} />;

                const leadingComponent = () => (
                    <LinkTitle icon={data?.loginid || isDesktop ? icon : smallIcon} title={title} />
                );

                return (
                    <TradingAccountCard
                        {...account}
                        key={`trading-account-card-${title}`}
                        leading={leadingComponent}
                        trailing={trailingComponent}
                    >
                        <TradingAccountCardContent title={title}>{description}</TradingAccountCardContent>
                    </TradingAccountCard>
                );
            })}
        </div>
    );
};
