import Link from 'next/link';

export default function SignupPage() {
  return (
    <main>
      <h1>Sign up</h1>
      <form action="/api/auth/signup" method="post">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" minLength={8} required />

        <button type="submit">Create account</button>
      </form>
      <p>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </main>
  );
}
