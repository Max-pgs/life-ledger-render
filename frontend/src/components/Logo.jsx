import "./Logo.css";

function Logo({
  variant = "compact",
  className = "",
  ariaLabel = "Life Ledger",
}) {
  /* Combines the base class, selected size variant, and any optional custom class. */
  const classes = ["logo", `logo--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role="img" aria-label={ariaLabel}>
      <svg
        className="logo__svg"
        viewBox="0 0 120 120"
        aria-hidden="true"
        focusable="false"
      >
        {/* Separate SVG paths allow each letter to be animated independently. */}
        <path
          className="logo__letter logo__letter--first"
          d="M25 20V83H64"
        />

        <path
          className="logo__letter logo__letter--second"
          d="M57 37V100H96"
        />
      </svg>
    </div>
  );
}

export default Logo;