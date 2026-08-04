import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { loginUser } from "../services/authService";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    /* Clears only the validation errors affected by the edited field. */
    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: undefined,
      non_field_errors: undefined,
      detail: undefined,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    /* Prevents duplicate login requests from repeated submissions. */
    if (isSubmitting) {
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const data = await loginUser(formData);

      /* Stores authentication data so protected routes can recognise the session. */
      localStorage.setItem("authToken", data.token);

      if (data.user) {
        localStorage.setItem(
          "authUser",
          JSON.stringify(data.user),
        );
      }

      /* Route state tells the dashboard to run the post-login logo transition. */
      navigate("/dashboard", {
        state: {
          showLoginTransition: true,
        },
      });
    } catch (error) {
      /* Preserves backend validation errors and provides a fallback message. */
      setErrors(
        error && typeof error === "object"
          ? error
          : {
            non_field_errors: [
              "Unable to log in. Please try again.",
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
        <p className="auth-card__eyebrow">LOGIN</p>

        <h1>Log in to Life Ledger</h1>

        <p className="auth-card__intro">
          Access your commitments, upcoming deadlines and
          household overview.
        </p>

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
                errors.username
                  ? "login-username-error"
                  : undefined
              }
            />

            {errors.username && (
              <p
                id="login-username-error"
                className="field-error"
                role="alert"
              >
                {errors.username.join(" ")}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password">Password</label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              required
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password
                  ? "login-password-error"
                  : undefined
              }
            />

            {errors.password && (
              <p
                id="login-password-error"
                className="field-error"
                role="alert"
              >
                {errors.password.join(" ")}
              </p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="auth-card__footer">
          Need an account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;