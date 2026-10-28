import type { Instrumentation } from "next";
export const onRequestError: Instrumentation.onRequestError = async (_error, _request, context) => {
 if (process.env.NEXT_RUNTIME === "nodejs") {
  const { reportServerError } = await import("./lib/server-error-reporting");
  await reportServerError(context.routePath);
 }
};
