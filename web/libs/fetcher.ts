import { logInfo, logError } from "./logger";

const fetcher = async (url: string) => {
  try {
    logInfo("fetcher:start", { url });

    const res = await fetch(url, {
      credentials: "include",
      cache: "no-store",
    });

    const text = await res.text();
    logInfo("fetcher:response", {
      url,
      status: res.status,
      preview: text.slice(0, 120),
    });

    if (!res.ok) {
      logError("fetcher:response:error", {
        url,
        status: res.status,
        error: text.slice(0, 200),
      });
      throw new Error(`HTTP ${res.status} - ${text.slice(0, 200)}`);
    }

    return text ? JSON.parse(text) : null;
  } catch (err) {
    logError("fetcher", err, { url });
    throw err; // quan trọng để SWR nhận lỗi
  }
};

export default fetcher;
