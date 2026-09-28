// SunoAPI requires a callBackUrl on every generation request. The app polls
// for results instead, so this endpoint just acknowledges the callback.
export default async () =>
  new Response(JSON.stringify({ code: 200, msg: 'received' }), {
    headers: { 'Content-Type': 'application/json' },
  });
