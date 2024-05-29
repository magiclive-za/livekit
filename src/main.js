import { AccessToken } from "livekit-server-sdk";
import { generateShortCode, throwIfMissing } from "./utils.js";

export default async ({ res, req, log, error }) => {
  try {
    throwIfMissing(process.env, ["LIVEKIT_API_KEY", "LIVEKIT_API_SECRET"]);
    // if this room doesn't exist, it'll be automatically created when the first
    // client joins
    const roomName = req.body.roomName;
    // identifier to be used for participant.
    // it's available as LocalParticipant.identity with livekit-client SDK
    const participantName = req.body.participantName;
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
    return res.json({ token: await at.toJwt() }, 200);
  } catch ({ name, message }) {
    return res.json(
      { ok: false, error: "An error has occurred", name, message },
      500
    );
  }
};
