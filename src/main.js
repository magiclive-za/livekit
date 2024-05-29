import { AccessToken } from "livekit-server-sdk";
import { generateShortCode, throwIfMissing } from "./utils.js";

export default async (context) => {
  try {
    throwIfMissing(process.env, ["LIVEKIT_API_KEY", "LIVEKIT_API_SECRET"]);
    // Parse JSON body
    const body =
      context.req.body instanceof String
        ? JSON.parse(context.req.body)
        : { roomName: undefined, participantName: undefined };
    // if this room doesn't exist, it'll be automatically created when the first
    // client joins
    const roomName = context.req.body.roomName || body.roomName;
    // identifier to be used for participant.
    // it's available as LocalParticipant.identity with livekit-client SDK
    const participantName =
      context.req.body.participantName || body.participantName;
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: participantName,
        // token to expire after 10 minutes
        ttl: "10m",
      }
    );
    at.addGrant({ roomJoin: true, room: roomName });
    return context.res.json({ ok: true, token: await at.toJwt() });
  } catch ({ name, message }) {
    return context.res.json(
      { ok: false, error: "An error has occurred", name, message },
      500
    );
  }
};
