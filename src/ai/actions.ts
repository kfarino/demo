"use server";

import { z } from "zod";
import { ElevenLabsClient } from "elevenlabs";
import { createSafeActionClient } from "next-safe-action";

const actionClient = createSafeActionClient();

export const getAgentSignedUrl = actionClient
	.schema(z.object({}))
	.action(async () => {
		const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
		const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

		if (!agentId || !apiKey) {
			throw new Error("Environment variables are not set");
		}

		const elevenlabs = new ElevenLabsClient({
			apiKey: apiKey,
		});

		try {
			const { signed_url: signedUrl } = await elevenlabs.conversationalAi
				.getSignedUrl({
					agent_id: agentId,
				})
				.catch((err) => {
					console.error("Error getting signed URL:", err.message);
					throw new Error("Failed to get signed URL");
				});

			if (!signedUrl) {
				throw new Error("Failed to get signed URL");
			}

			return { signedUrl };
		} catch (error) {
			throw new Error(`Failed to get signed URL: ${error}`);
		}
	});
