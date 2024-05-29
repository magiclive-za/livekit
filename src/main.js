import { AccessToken } from "livekit-server-sdk";
import { generateShortCode, throwIfMissing } from "./utils.js";

export default async (context) => {
  try {
    throwIfMissing(process.env, ["LIVEKIT_API_KEY", "LIVEKIT_API_SECRET"]);
    // if this room doesn't exist, it'll be automatically created when the first
    // client joins
    const roomName = context.req.body.roomName;
    // identifier to be used for participant.
    // it's available as LocalParticipant.identity with livekit-client SDK
    const participantName = context.req.body.participantName;
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
    context.log(context.req.body);
    context.log(context.req.body.roomName);
    return context.res.json({ ok: true, token: await at.toJwt() });
  } catch ({ name, message }) {
    return context.res.json(
      { ok: false, error: "An error has occurred", name, message },
      500
    );
  }
};
