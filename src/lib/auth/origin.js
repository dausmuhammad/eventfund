export function localOriginRedirects(origin) {
  if (!origin) return [];
  const canonical = new URL(origin);
  if (!["localhost", "127.0.0.1"].includes(canonical.hostname)) return [];
  const alternate =
    canonical.hostname === "localhost" ? "127.0.0.1" : "localhost";
  return [
    {
      source: "/:path*",
      has: [{ type: "host", value: alternate.replaceAll(".", "\\.") }],
      destination: `${canonical.origin}/:path*`,
      permanent: false,
    },
  ];
}
