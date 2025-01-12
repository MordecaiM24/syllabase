"use client"; // Error boundaries must be Client Components

export default function GlobalError() {
  return (
    // global-error must include html and body tags
    <html>
      <body>
        <div className="absolute left-1/2 top-1/2 flex items-center justify-center bg-black">
          <h2 className="text-3xl font-thin">404</h2>
          <p>That page doesn&apost exist</p>
        </div>
      </body>
    </html>
  );
}
