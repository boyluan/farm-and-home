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

import Confetti from "react-dom-confetti";

import "react-circular-progressbar/dist/styles.css"

// See: <https://codesandbox.io/s/z4v8j0?file=/App.js&from-sandpack=true>
const confettiConfig = {
    angle: 90,
    spread: 100,
    startVelocity: 34,
    elementCount: 81,
    dragFriction: 0.11,
    duration: 3000,
    stagger: 3,
    width: "10px",
    height: "10px",
    colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
  };

export default function Confirmed() {
    const [percentage, setPercentage] = useState(0);
    // const [text, setText] = useState('🛒')
    const [done, setDone] = useState(false);
    const [pathColor, setPathColor] = useState("#00BA00")

    useEffect(() => {
        const t1 = setTimeout(() => setPercentage(100), 100);
        // const t2 = setTimeout(() => {setText('✅'); setPathColor("#00AB00");}, 600);
        const t2 = setTimeout(() => setDone(true), 400);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    return (
        <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ height: "20rem", width: "20rem"}} >
                <CircularProgressbarWithChildren
                    value={percentage}
                    // text={text}
                    styles={buildStyles({
                        pathColor: '#00BA00',
                        pathTransitionDuration: 1.0,
                        // pathColor,
                    })}
                >
                    {/* ##
                        // The question mark operator ? takes three operands (contd. below):
                        // 1) some condition 2) a value if that condition is TRUE 3) and a value if that condition is FALSE
                        // It is used in JavaScript to shorten an if else statement to one line of code. */}
                    <p style={{fontSize: 50}}>{done ? "✅" : "🛒"}</p>
                    <Confetti active={done} config={confettiConfig} />
                </CircularProgressbarWithChildren>
            </div>
        </div>
        /*
        <CircularProgressbar value={percentage} text={text} styles={
            buildStyles({
                pathColor: '#00BA00'
            })
        }/> */
    );
}