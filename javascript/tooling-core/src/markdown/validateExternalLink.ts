import type {
    LinkRecord,
    LinkValidationError,
    LinkValidationWarning,
    LinkValidationOptions,
} from "./types.js";

const USER_AGENT = "Mozilla/5.0 (compatible; link-checker/1.0)";

export async function validateExternalLink(
    filePath: string,
    link: LinkRecord,
    options: LinkValidationOptions = {}
): Promise<LinkValidationError | LinkValidationWarning | null> {
    const timeoutMs = options.timeoutMs ?? 3000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const headers = { "User-Agent": USER_AGENT };

    let status: number;

    options.onDebug?.(`validateExternalLink: fetching href=${link.href} timeoutMs=${timeoutMs}`);

    try {
        const response = await fetch(link.href, {
            method: "HEAD",
            signal: controller.signal,
            headers: headers,
            redirect: "manual",
        });
        status = response.status;

        if (status === 405) {
            options.onDebug?.(
                `validateExternalLink: 405 HEAD, retrying with GET href=${link.href}`
            );
            const getResponse = await fetch(link.href, {
                method: "GET",
                signal: controller.signal,
                headers: headers,
            });
            status = getResponse.status;
        }
    } catch (err) {
        clearTimeout(timer);
        const isAbort = err instanceof Error && err.name === "AbortError";
        const reason = isAbort ? "timeout" : "unreachable";
        options.onDebug?.(`validateExternalLink: fetch error href=${link.href} reason=${reason}`);
        return {
            file: filePath,
            line: link.line,
            link: link.href,
            reason: reason,
        } as LinkValidationError;
    }

    clearTimeout(timer);

    options.onDebug?.(`validateExternalLink: status=${status} href=${link.href}`);

    if (status >= 200 && status < 300) {
        options.onVerbose?.(`✓ ${link.href}`);
        return null;
    }

    if (status === 301) {
        return {
            file: filePath,
            line: link.line,
            link: link.href,
            reason: "permanent redirect (301)",
        } as LinkValidationWarning;
    }

    if (status === 302 || status === 307 || status === 308) {
        options.onVerbose?.(`✓ ${link.href}`);
        return null;
    }

    if (status === 403) {
        return {
            file: filePath,
            line: link.line,
            link: link.href,
            reason: "access forbidden (403) — resource may exist but requests are blocked",
        } as LinkValidationWarning;
    }

    if (status >= 400 && status < 500) {
        return {
            file: filePath,
            line: link.line,
            link: link.href,
            reason: `HTTP ${status}`,
        } as LinkValidationError;
    }

    if (status >= 500) {
        return {
            file: filePath,
            line: link.line,
            link: link.href,
            reason: `server error (${status})`,
        } as LinkValidationWarning;
    }

    return null;
}
