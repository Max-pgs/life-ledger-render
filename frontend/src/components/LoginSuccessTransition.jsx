import { useEffect, useRef, useState } from "react";

import Logo from "./Logo";
import "./LoginSuccessTransition.css";


/* Keeps the JavaScript phases aligned with the matching CSS durations. */
const FORMATION_DURATION = 1700;
const MOVE_DURATION = 850;
const REVEAL_DURATION = 2000;

function LoginSuccessTransition({
  targetRef,
  onComplete,
}) {
  const overlayLogoRef = useRef(null);

  const [phase, setPhase] = useState("forming");
  const [targetTransform, setTargetTransform] = useState(null);

  /* Starts the movement phase after the two logo letters have formed. */
  useEffect(() => {
    const formationTimer = window.setTimeout(() => {
      setPhase("moving");
    }, FORMATION_DURATION);

    return () => {
      window.clearTimeout(formationTimer);
    };
  }, []);

  /* Calculates the transform required to move the overlay logo to the dashboard logo. */
  useEffect(() => {
    if (phase !== "moving") {
      return undefined;
    }

    const overlayLogo = overlayLogoRef.current;
    const targetLogo = targetRef?.current;

    if (!overlayLogo || !targetLogo) {
      onComplete();
      return undefined;
    }

    const overlayRect = overlayLogo.getBoundingClientRect();
    const targetRect = targetLogo.getBoundingClientRect();

    const translateX =
      targetRect.left +
      targetRect.width / 2 -
      (overlayRect.left + overlayRect.width / 2);

    const translateY =
      targetRect.top +
      targetRect.height / 2 -
      (overlayRect.top + overlayRect.height / 2);

    const scale =
      targetRect.width / overlayRect.width;

    /* Applies the transform on the next rendered frame so the CSS transition runs. */
    const animationFrame =
      window.requestAnimationFrame(() => {
        setTargetTransform({
          translateX,
          translateY,
          scale,
        });
      });

    const movementTimer = window.setTimeout(() => {
      setPhase("revealing");
    }, MOVE_DURATION);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(movementTimer);
    };
  }, [phase, targetRef, onComplete]);

  /* Removes the overlay only after the dashboard reveal animation has finished. */
  useEffect(() => {
    if (phase !== "revealing") {
      return undefined;
    }

    const revealTimer = window.setTimeout(() => {
      onComplete();
    }, REVEAL_DURATION);

    return () => {
      window.clearTimeout(revealTimer);
    };
  }, [phase, onComplete]);

  const movingStyle =
    targetTransform
      ? {
        transform: `
            translate3d(
              ${targetTransform.translateX}px,
              ${targetTransform.translateY}px,
              0
            )
            scale(${targetTransform.scale})
          `,
      }
      : undefined;

  return (
    <div
      className={`
        login-transition
        login-transition--${phase}
      `}
      aria-label="Login successful"
    >
      <div
        ref={overlayLogoRef}
        className="login-transition__logo"
        style={movingStyle}
      >
        <Logo variant="large" />
      </div>
    </div>
  );
}

export default LoginSuccessTransition;