import { Fragment, useMemo } from 'react';

import { DesktopLinks, getWebtraderUrl, MarketType, MarketTypeDetails, PlatformDetails } from '@cfd/constants';
import { Text, useDevice } from '@deriv-com/ui';

import { IconComponent } from '@/components';
import {
    useActiveDerivTradingAccount,
    useCtraderAccountsList,
    useDxtradeAccountsList,
    useRegulationFlags,
} from '@/hooks';
import { useCFDContext } from '@/providers';
import { THooks, TPlatforms } from '@/types';

import { MT5MobileRedirectOption } from './MT5MobileRedirectOption';
import { TradeDetailsItem } from './TradeDetailsItem';
import { TradeLink } from './TradeLink';

type TradeScreenProps = {
    account?: THooks.CtraderAccountsList | THooks.DxtradeAccountsList | THooks.MT5AccountsList;
};

const serviceMaintenanceMessages: Record<TPlatforms.All, string> = {
    ctrader:
        'Server maintenance occurs every first Saturday of the month from 7 to 10 GMT time. You may experience service disruption during this time.',
    dxtrade:
        'Server maintenance starts at 06:00 GMT every Sunday and may last up to 2 hours. You may experience service disruption during this time.',
    mt5: 'Server maintenance starts at 01:00 GMT every Sunday, and this process may take up to 2 hours to complete. Service may be disrupted during this time.',
};

export const TradeScreen = ({ account }: TradeScreenProps) => {
    const { isDesktop } = useDevice();
    const { regulationFlags } = useRegulationFlags();
    const { isEU } = regulationFlags;

    const { cfdState } = useCFDContext();
    const { data: dxtradeAccountsList } = useDxtradeAccountsList();
    const { data: ctraderAccountsList } = useCtraderAccountsList();
    const { data: activeAccount } = useActiveDerivTradingAccount();

    const mt5Platform = PlatformDetails.mt5.platform;
    const dxtradePlatform = PlatformDetails.dxtrade.platform;
    const ctraderPlatform = PlatformDetails.ctrader.platform;

    const { marketType, platform } = cfdState;

    const platformToAccountsListMapper = useMemo(
        () => ({
            ctrader: ctraderAccountsList?.find(account => account.is_virtual === activeAccount?.isVirtual),
            dxtrade: dxtradeAccountsList?.find(account => account.is_virtual === activeAccount?.isVirtual),
            mt5: account,
        }),
        [ctraderAccountsList, dxtradeAccountsList, account, activeAccount?.isVirtual]
    );

    const details = platformToAccountsListMapper[platform as TPlatforms.All];

    const loginId = useMemo(() => {
        if (platform === mt5Platform) {
            return (details as THooks.MT5AccountsList)?.display_login;
        }
        return (details as THooks.CtraderAccountsList | THooks.DxtradeAccountsList)?.account_id;
    }, [details, mt5Platform, platform]);

    const marketTypeDetails = MarketTypeDetails(isEU);

    const platformIcon =
        platform === mt5Platform
            ? marketTypeDetails[marketType ?? MarketType.ALL]?.iconWithWidth?.(24)
            : PlatformDetails[platform as keyof typeof PlatformDetails]?.icon?.(24);

    return (
        <div className='lg:w-[45vw] lg:min-w-[512px] lg:max-w-[600px] w-full min-w-full h-auto'>
            <div className='flex flex-col gap-16 p-24 border-b-3 border-system-light-secondary-background'>
                <div className='flex items-center justify-between w-full'>
                    <div className='flex items-center'>
                        <div className='mr-8'>{platformIcon}</div>
                        <div className='flex flex-col'>
                            <div className='flex flex-row items-center gap-6'>
                                <Text size='sm'>
                                    {platform === mt5Platform
                                        ? marketTypeDetails[marketType ?? MarketType.ALL]?.title
                                        : PlatformDetails[platform as keyof typeof PlatformDetails]?.title}
                                    {platform === mt5Platform &&
                                        !activeAccount?.is_virtual &&
                                        ` ${details?.landing_company_short?.toUpperCase()}`}
                                </Text>
                            </div>
                            <Text className='text-system-light-less-prominent-text' size='2xs'>
                                {loginId}
                            </Text>
                        </div>
                    </div>
                    <div className='flex flex-col items-end'>
                        <Text weight='bold'>
                            {platform === ctraderPlatform
                                ? (details as THooks.CtraderAccountsList)?.display_balance
                                : details?.display_balance}
                        </Text>
                    </div>
                </div>
                <div className='flex flex-col gap-4'>
                    {platform === mt5Platform && (
                        <Fragment>
                            <TradeDetailsItem label='Broker' value='Deriv Holdings (Guernsey) Ltd' />
                            <TradeDetailsItem
                                label='Server'
                                value={(details as THooks.MT5AccountsList)?.server_info?.environment ?? 'Deriv-Server'}
                            />
                            <TradeDetailsItem label='Login ID' value={loginId ?? '12345678'} />
                            <TradeDetailsItem label='Password' value='********' variant='password' />
                        </Fragment>
                    )}
                    {platform === dxtradePlatform && (
                        <Fragment>
                            <TradeDetailsItem
                                label='Username'
                                value={(details as THooks.DxtradeAccountsList)?.login ?? '12345678'}
                            />
                            <TradeDetailsItem label='Password' value='********' variant='password' />
                        </Fragment>
                    )}
                    {platform === ctraderPlatform && (
                        <TradeDetailsItem
                            className='rounded-t-sm'
                            value=' Use your Deriv account email and password to login into the cTrader platform.'
                            variant='info'
                        />
                    )}
                </div>
                <div className='flex items-center gap-8'>
                    <IconComponent
                        icon='ImportantIcon'
                        height={platform === mt5Platform ? 16 : 20}
                        width={platform === mt5Platform ? 16 : 20}
                    />
                    <Text color='less-prominent' size='2xs'>
                        {serviceMaintenanceMessages[(platform ?? mt5Platform) as TPlatforms.All]}
                    </Text>
                </div>
            </div>
            <div className='w-full p-24'>
                {platform === mt5Platform &&
                    (isDesktop ? (
                        <Fragment>
                            <TradeLink
                                app={DesktopLinks.MT5_WEB}
                                platform={mt5Platform}
                                webtraderUrl={getWebtraderUrl({ details } as { details: THooks.MT5AccountsList })}
                            />

                            <TradeLink app={DesktopLinks.MT5_WINDOWS} platform={mt5Platform} />
                            <TradeLink app={DesktopLinks.MT5_MACOS} platform={mt5Platform} />
                            <TradeLink app={DesktopLinks.MT5_LINUX} platform={mt5Platform} />
                        </Fragment>
                    ) : (
                        <MT5MobileRedirectOption details={details as THooks.MT5AccountsList} />
                    ))}

                {platform === dxtradePlatform && (
                    <TradeLink app={DesktopLinks.DXTRADE_WEB} platform={dxtradePlatform} />
                )}
                {platform === ctraderPlatform && isDesktop && (
                    <Fragment>
                        <TradeLink app={DesktopLinks.CTRADER_WEB} platform={ctraderPlatform} />
                        <TradeLink app={DesktopLinks.CTRADER_WINDOWS} platform={ctraderPlatform} />
                        <TradeLink app={DesktopLinks.CTRADER_MAC} platform={ctraderPlatform} />
                    </Fragment>
                )}
            </div>
        </div>
    );
};
