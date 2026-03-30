export default function LogoutPage() {
  return (
    <main>
      <h1>Log out</h1>
      <form action="/api/auth/logout" method="post">
        <button type="submit">Confirm logout</button>
      </form>
    </main>
  );
}
