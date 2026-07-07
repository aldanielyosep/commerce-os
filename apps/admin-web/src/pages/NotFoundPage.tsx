import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section>
      <h2>Page Not Found</h2>
      <p>The page you requested does not exist in this MVP.</p>
      <Link to="/dashboard">Back to Dashboard</Link>
    </section>
  );
}
