// ##
// This page is what we'll use to redirect buyers after we receive their payment
// We also need to add an interval in our 'pages/shop/checkout.tsx' file ⬇
// To check for a transaction matching our reference (see: Lines xxx)


import 'react-circular-progressbar/dist/styles.css';
import BackLink from '../../components/BackLink';
import Confirmed from '../../components/Confirmed';
import PageHeading from '../../components/PageHeading';

export default function ConfirmedPage() {
    return (
        <div className='font-loader2 flex flex-col gap-8 items-center'>
            <BackLink href='/shop'>Next Order</BackLink>

            <PageHeading>Thank you, enjoy your order</PageHeading>

            <div className='h-80 w-80'><Confirmed /></div>
        </div>
    )
}