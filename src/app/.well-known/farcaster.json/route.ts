import { PROJECT_TITLE } from "~/lib/constants";

export async function GET() {
  const appUrl =
    process.env.NEXT_PUBLIC_URL ||
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

  const config = {
    accountAssociation: {
      header: "eyJmaWQiOjg2OTk5OSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDc2ZDUwQjBFMTQ3OWE5QmEyYkQ5MzVGMUU5YTI3QzBjNjQ5QzhDMTIifQ",
      payload: "eyJkb21haW4iOiJsdWNpYW5vLWlkZWFjcmFjdGlvbi52ZXJjZWwuYXBwIn0",
      signature: "MHgxOGE5MDAwNGM4N2QzOGE5MjUwNzhlZDlkZjJiODE3Y2M2NTA2YjdjMGU3YmRjZTZmNzI0YjU5NjA2OWRhYmRjMDdmYjA5NzdhMmVmNzQwNjU3NmM5Zjk2ZjYxZWE1MDQ1NTBjNTllZWM3MDhhM2VkNTYyZWE0NDExMDRmMzhkYTFj",
    },
    frame: {
      version: "1",
      name: PROJECT_TITLE,
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/frames/hello/opengraph-image`,
      ogImageUrl: `${appUrl}/frames/hello/opengraph-image`,
      buttonTitle: "Open",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return Response.json(config);
}
