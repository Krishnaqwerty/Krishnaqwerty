import { FieldValue } from "firebase-admin/firestore";
import { getFirestore } from "@/lib/firebaseAdmin";

const METRICS_COLLECTION = "site_metrics";
const VISITORS_DOC = "visitors";
const VISITOR_COLLECTION = "visitor_signatures";

function headerValue(request, name) {
  return request.headers.get(name) || null;
}

function extractIpAddress(request) {
  const xForwardedFor = headerValue(request, "x-forwarded-for");
  if (xForwardedFor) {
    const first = xForwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const xRealIp = headerValue(request, "x-real-ip");
  if (xRealIp) return xRealIp.trim();

  const cfConnectingIp = headerValue(request, "cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return null;
}

function isPrivateOrLocalIp(ip) {
  if (!ip) return true;

  if (ip === "::1" || ip === "127.0.0.1") return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("172.")) {
    const second = Number(ip.split(".")[1]);
    if (second >= 16 && second <= 31) return true;
  }
  if (ip.startsWith("fc") || ip.startsWith("fd")) return true;

  return false;
}

async function lookupIpDetails(ipAddress) {
  if (!ipAddress || isPrivateOrLocalIp(ipAddress)) {
    return {
      ipAddress,
      location: null,
      isp: null,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800);

    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ipAddress)}`, {
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        ipAddress,
        location: null,
        isp: null,
      };
    }

    const result = await response.json();

    return {
      ipAddress,
      location: {
        country: result?.country || null,
        city: result?.city || null,
      },
      isp: result?.connection?.isp || null,
    };
  } catch {
    return {
      ipAddress,
      location: null,
      isp: null,
    };
  }
}

async function parseBody(request) {
  try {
    return await request.json();
  } catch {
    try {
      const raw = await request.text();
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
}

export async function GET() {
  try {
    const db = getFirestore();
    const snapshot = await db.collection(METRICS_COLLECTION).doc(VISITORS_DOC).get();
    const count = snapshot.exists ? Number(snapshot.data()?.count || 0) : 0;
    return Response.json({ count });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load visitor count." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await parseBody(request);
    const visitorId = typeof body?.visitorId === "string" ? body.visitorId.trim() : "";

    if (!visitorId) {
      return Response.json({ error: "visitorId is required." }, { status: 400 });
    }

    const eventType = body?.eventType === "session_end" ? "session_end" : "session_start";
    const nowIso = new Date().toISOString();
    const ipAddress = extractIpAddress(request);
    const network = await lookupIpDetails(ipAddress);

    const requestHeaders = {
      userAgent: headerValue(request, "user-agent"),
      acceptLanguage: headerValue(request, "accept-language"),
      referer: headerValue(request, "referer"),
      host: headerValue(request, "host"),
    };

    const db = getFirestore();
    const metricsRef = db.collection(METRICS_COLLECTION).doc(VISITORS_DOC);
    const visitorRef = db.collection(VISITOR_COLLECTION).doc(visitorId);
    const sessionId = typeof body?.sessionId === "string" && body.sessionId.trim()
      ? body.sessionId.trim()
      : `session-${Date.now()}`;
    const sessionRef = visitorRef.collection("sessions").doc(sessionId);

    await db.runTransaction(async (transaction) => {
      const [visitorSnap, metricsSnap] = await Promise.all([
        transaction.get(visitorRef),
        transaction.get(metricsRef),
      ]);

      const visitorExists = visitorSnap.exists;
      const shouldCountVisit = eventType === "session_start";

      if (!visitorExists) {
        transaction.set(
          metricsRef,
          {
            count: FieldValue.increment(1),
            createdAt: metricsSnap.exists
              ? metricsSnap.data()?.createdAt || FieldValue.serverTimestamp()
              : FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        transaction.set(
          metricsRef,
          {
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }

      const createdAt = visitorExists
        ? visitorSnap.data()?.createdAt || FieldValue.serverTimestamp()
        : FieldValue.serverTimestamp();

      const visitorUpdate = {
        visitorId,
        eventType,
        lastSeen: nowIso,
        updatedAt: FieldValue.serverTimestamp(),
        createdAt,
        latestRequestHeaders: requestHeaders,
        latestNetwork: network,
        latestTimezone: body?.timezone || null,
        latestPagePath: body?.pagePath || null,
        latestReferrer: body?.referrer || requestHeaders.referer || null,
        latestCurrentUrl: body?.currentUrl || null,
      };

      if (shouldCountVisit) {
        visitorUpdate.visitCount = FieldValue.increment(1);
        visitorUpdate.firstSeen = visitorExists ? visitorSnap.data()?.firstSeen || nowIso : nowIso;
      }

      if (body?.signature && typeof body.signature === "object") {
        visitorUpdate.latestSignature = body.signature;
      }

      transaction.set(visitorRef, visitorUpdate, { merge: true });

      transaction.set(
        sessionRef,
        {
          visitorId,
          sessionId,
          eventType,
          sessionStart: body?.sessionStart || null,
          sessionEnd: body?.sessionEnd || null,
          visitTimestamp: body?.visitTimestamp || nowIso,
          timezone: body?.timezone || null,
          pagePath: body?.pagePath || null,
          pageVisitSequence: Array.isArray(body?.pageVisitSequence) ? body.pageVisitSequence : [],
          timeSpentMs: Number.isFinite(body?.timeSpentMs) ? Number(body.timeSpentMs) : null,
          navigationType: body?.navigationType || null,
          online: typeof body?.online === "boolean" ? body.online : null,
          behavior: body?.behavior && typeof body.behavior === "object" ? body.behavior : null,
          requestHeaders,
          network,
          updatedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });

    const metrics = await metricsRef.get();
    const count = metrics.exists ? Number(metrics.data()?.count || 0) : 0;

    return Response.json({ ok: true, count });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to store visitor analytics." },
      { status: 500 }
    );
  }
}
