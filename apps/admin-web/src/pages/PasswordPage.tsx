import { FormEvent, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { requestPasswordReset } from "../lib/api";

export function PasswordPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      await requestPasswordReset(email);
      setMessage("If the account exists, reset instructions have been sent.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h2>Password Change</h2>
      <p>Request a password reset email for your account.</p>
      <form className="card" onSubmit={onSubmit}>
        <label>
          Account Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <button className="primary" type="submit" disabled={submitting}>
          {submitting ? "Sending..." : "Send Reset Email"}
        </button>
        {message ? <p className="state">{message}</p> : null}
        {error ? <p className="state error">{error}</p> : null}
      </form>
    </section>
  );
}
