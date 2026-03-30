import Link from 'next/link';

export default function LoginPage() {
  return (
    <main>
      <h1>Log in</h1>
      <form action="/api/auth/login" method="post">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />

        <button type="submit">Log in</button>
      </form>
      <p>
        Need an account? <Link href="/signup">Sign up</Link>
      </p>
    </main>
  );
}
