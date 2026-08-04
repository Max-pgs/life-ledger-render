import { useState } from "react";
import { Link } from "react-router";

import { registerUser } from "../services/authService";

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    /* Clears errors related to the field being corrected. */
    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: undefined,
      non_field_errors: undefined,
      detail: undefined,
    }));

    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    /* Prevents duplicate registration requests. */
    if (isSubmitting) {
      return;
    }

    const validationErrors = {};

    /* Provides immediate client-side feedback before calling the API. */
    if (!formData.email.trim()) {
      validationErrors.email = ["Email address is required."];
    }

    if (formData.password.length < 8) {
      validationErrors.password = [
        "Password must contain at least 8 characters.",
      ];
    } else if (!/[A-Z]/.test(formData.password)) {
      validationErrors.password = [
        "Password must contain at least one uppercase letter.",
      ];
    } else if (!/\d/.test(formData.password)) {
      validationErrors.password = [
        "Password must contain at least one number.",
      ];
    }

    if (
      formData.password_confirm &&
      formData.password !== formData.password_confirm
    ) {
      validationErrors.password_confirm = [
        "The passwords do not match.",
      ];
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccessMessage("");
      return;
    }

    setErrors({});
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await registerUser(formData);

      setSuccessMessage(
        "Registration successful. You can now log in.",
      );

      /* Clears sensitive form values after successful registration. */
      setFormData({
        username: "",
        email: "",
        password: "",
        password_confirm: "",
      });
    } catch (error) {

      /* Preserves backend validation errors and provides a fallback message. */
      setErrors(
        error && typeof error === "object"
          ? error
          : {
            non_field_errors: [
              "Unable to create your account. Please try again.",
            ],
          },
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /* Combines the alternative general-error formats returned by the API. */
  const generalErrors = [
    ...(errors.non_field_errors || []),
    ...(errors.detail ? [errors.detail] : []),
  ];

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-card__eyebrow">REGISTER</p>

        <h1>Create your Life Ledger account</h1>

        <p className="auth-card__intro">
          Keep your household commitments, renewals and important
          deadlines in one place.
        </p>

        {successMessage && (
          <div className="auth-message auth-message--success" role="status">
            <p>{successMessage}</p>
          </div>
        )}

        {generalErrors.length > 0 && (
          <div
            className="auth-message auth-message--error"
            role="alert"
          >
            {generalErrors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="username">Username</label>

            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              required
              aria-invalid={Boolean(errors.username)}
              aria-describedby={
                errors.username ? "register-username-error" : undefined
              }
            />

            {errors.username && (
              <p
                id="register-username-error"
                className="field-error"
                role="alert"
              >
                {errors.username.join(" ")}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email">Email address</label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? "register-email-error" : undefined
              }
            />

            {errors.email && (
              <p
                id="register-email-error"
                className="field-error"
                role="alert"
              >
                {errors.email.join(" ")}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password">Password</label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              required
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password
                  ? "password-help register-password-error"
                  : "password-help"
              }
            />
            <p id="password-help" className="field-help">
              Use at least 8 characters, including one uppercase letter and one number.
            </p>

            {errors.password && (
              <p
                id="register-password-error"
                className="field-error"
                role="alert"
              >
                {errors.password.join(" ")}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password_confirm">
              Confirm password
            </label>

            <input
              id="password_confirm"
              name="password_confirm"
              type="password"
              autoComplete="new-password"
              value={formData.password_confirm}
              onChange={handleChange}
              required
              aria-invalid={Boolean(errors.password_confirm)}
              aria-describedby={
                errors.password_confirm
                  ? "register-password-confirm-error"
                  : undefined
              }
            />

            {errors.password_confirm && (
              <p
                id="register-password-confirm-error"
                className="field-error"
                role="alert"
              >
                {errors.password_confirm.join(" ")}
              </p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account?{" "}
          <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;