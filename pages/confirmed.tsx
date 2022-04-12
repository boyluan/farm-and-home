// ## These are hooks
// useState: allows you to keep up with local states - i.e. updates data and causes a UI update
// useEffect: is a hook that allows you to invoke a function when the component loads
import { 
    useEffect, 
    useState 
} from "react";

import { 
    buildStyles, 
    CircularProgressbarWithChildren 
} from "react-circular-progressbar";

import 'react-circular-progressbar/dist/styles.css';
import BackLink from "../components/BackLink";
import Confirmed from "../components/Confirmed";
import PageHeading from "../components/PageHeading";

export default function ConfirmedPage() {
    return (
        <div className='font-loader2 flex flex-col gao-8 items-center'>
            <BackLink href='/'>Home</BackLink>

            <PageHeading>Thank you, enjoy your order</PageHeading>

            <div className="'h-80 w-80"><Confirmed/></div>
        </div>
    )
}