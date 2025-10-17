import {
	AI_VOICE_GREETING_INSTRUCTIONS,
	AI_VOICE_INSTRUCTIONS,
	CONTACT_KEYWORDS,
	PROJECT_KEYWORDS,
	SYSTEM_PROMPT,
} from "@/server/constants/aiPrompts";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getKnowledge } from "@/lib/knowledge";
import { getProjects } from "@/lib/projects";
import { chatRequestSchema } from "@/lib/utils/chatRequestSchema";
import { logLlmInteraction } from "@/server/lib/llmLogger";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateRequest } from "@/lib/utils/validateRequest";
import { checkRateLimit } from "@/lib/utils/rateLimit";
import { z } from "zod";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY_PRIVATE,
});

export async function POST(req: NextRequest) {
	const route = "/api/chat";
	const timestamp = new Date().toISOString();
	let userId: string | undefined = undefined;

	console.log(`[${route}] Starting request at ${timestamp}`);

	try {
		// Get Supabase user
		console.log(`[${route}] Creating Supabase client...`);
		const supabase = await createSupabaseServerClient();
		console.log(`[${route}] Getting user from Supabase...`);
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();

		if (error) {
			console.log(`[${route}] Supabase auth error:`, error);
			if (error.status === 400 && error.code === "refresh_token_not_found") {
				console.log(`[${route}] Refresh token not found, returning 401`);
				return new Response("Unauthorized", { status: 401 });
			}
			// For other auth errors (like missing session), continue with undefined userId
			console.log(`[${route}] Auth error but continuing with undefined userId`);
		}

		userId = user?.id;
		console.log(`[${route}] User ID:`, userId);

		// --- Rate limiting by IP ---
		console.log(`[${route}] Checking rate limit...`);
		const ip = req.headers.get("x-forwarded-for") || "unknown";
		const rate = await checkRateLimit(ip);
		console.log(`[${route}] Rate limit result:`, rate);
		if (!rate.success) {
			console.log(`[${route}] Rate limit exceeded for IP: ${ip}`);
			await logLlmInteraction({
				timestamp,
				user_id: userId,
				route,
				prompt: "",
				response: "",
				status: "rate-limit",
				error: "Too many requests",
			});
			return NextResponse.json({ error: "Too many requests" }, { status: 429 });
		}

		// --- Input validation with Zod ---
		console.log(`[${route}] Validating request...`);
		const { data: parsed, error: validationError } = await validateRequest<
			z.infer<typeof chatRequestSchema>
		>(req, chatRequestSchema);
		if (validationError) {
			console.log(`[${route}] Validation error:`, validationError);
			await logLlmInteraction({
				timestamp,
				user_id: userId,
				route,
				prompt: JSON.stringify(parsed) || "",
				response: "",
				status: "invalid-request",
				error: JSON.stringify(validationError),
			});
			return NextResponse.json(
				{ error: "Invalid request", details: validationError },
				{ status: 400 }
			);
		}
		const { message, tts } = parsed || {};
		console.log(
			`[${route}] Parsed request - message:`,
			message?.substring(0, 50) + "...",
			"tts:",
			tts
		);

		const apiKey = process.env.OPENAI_API_KEY_PRIVATE;
		console.log(`[${route}] OpenAI API key present:`, !!apiKey);
		if (!apiKey) {
			console.log(`[${route}] Missing OpenAI API key`);
			await logLlmInteraction({
				timestamp,
				user_id: userId,
				route,
				prompt: message || "",
				response: "",
				status: "error",
				error: "Missing OpenAI API key",
			});
			return NextResponse.json(
				{ error: "Missing OpenAI API key" },
				{ status: 500 }
			);
		}

		const lowerMsg = (message || "").toLowerCase();
		const isContactQuestion = CONTACT_KEYWORDS.some((k) =>
			lowerMsg.includes(k)
		);
		const isProjectQuestion = PROJECT_KEYWORDS.some((k) =>
			lowerMsg.includes(k)
		);
		const SHOW_PROJECT_SLIDER = false; // Set to false to disable the project slider ( temporary fix )

		if (isContactQuestion) {
			const { links } = await getKnowledge();
			await logLlmInteraction({
				timestamp,
				user_id: userId,
				route,
				prompt: message || "",
				response:
					JSON.stringify({ type: "contact-info", contacts: links }) || "",
				status: "success",
			});
			return NextResponse.json({
				aiMessage: null,
				type: "contact-info",
				contacts: [
					{ name: "LinkedIn", url: links.linkedin },
					{ name: "GitHub", url: links.github },
				],
				audioUrl: null,
			});
		}

		if (SHOW_PROJECT_SLIDER) {
			if (isProjectQuestion) {
				// Return special project-list message
				try {
					const projects = await getProjects();
					await logLlmInteraction({
						timestamp,
						user_id: userId,
						route,
						prompt: message || "",
						response: JSON.stringify({ type: "project-list", projects }) || "",
						status: "success",
					});
					return NextResponse.json({
						aiMessage: null,
						type: "project-list",
						projects,
						audioUrl: null,
					});
				} catch (err) {
					await logLlmInteraction({
						timestamp,
						user_id: userId,
						route,
						prompt: message || "",
						response: "",
						status: "error",
						error: err instanceof Error ? err.message : String(err),
					});
					return NextResponse.json(
						{ error: "Failed to load projects", details: err },
						{ status: 500 }
					);
				}
			}
		}

		// 1. Get AI response (skip for welcome)
		let aiMessage = "";
		if (tts === "welcome") {
			// No AI message needed for welcome
		} else {
			// Always use Kristopher SYSTEM_PROMPT and knowledge
			const { markdown } = await getKnowledge();
			const openaiRes = await openai.chat.completions.create({
				model: "gpt-4o",
				messages: [
					{ role: "system", content: SYSTEM_PROMPT },
					{ role: "user", content: markdown },
					{ role: "user", content: message || "" },
				],
				max_tokens: 256,
				temperature: 0.7,
			});
			aiMessage =
				openaiRes.choices[0]?.message?.content ?? "No response from AI.";
		}

		// 2. Always generate TTS for every response (except welcome)
		let audioUrl: string | null = null;
		if (tts) {
			const ttsInput =
				tts === "welcome" ? AI_VOICE_GREETING_INSTRUCTIONS : aiMessage;
			const ttsInstructions = AI_VOICE_INSTRUCTIONS;
			const ttsRes = await fetch(
				`${process.env.OPENAI_API_URL}/v1/audio/speech`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${apiKey}`,
					},
					body: JSON.stringify({
						model: "tts-1",
						input: ttsInput,
						instructions: ttsInstructions,
						voice: "alloy",
						response_format: "mp3",
					}),
				}
			);

			if (ttsRes.ok) {
				const audioBuffer = await ttsRes.arrayBuffer();
				const base64Audio = Buffer.from(new Uint8Array(audioBuffer)).toString(
					"base64"
				);
				audioUrl = `data:audio/mp3;base64,${base64Audio}`;
			}
		}

		await logLlmInteraction({
			timestamp,
			user_id: userId,
			route,
			prompt: message || "",
			response: aiMessage || "",
			status: "success",
		});
		return NextResponse.json({ aiMessage, audioUrl });
	} catch (err) {
		console.error(`[${route}] Unexpected error:`, err);
		const errorMsg = err instanceof Error ? err.message : String(err);
		console.error(`[${route}] Error message:`, errorMsg);
		console.error(
			`[${route}] Error stack:`,
			err instanceof Error ? err.stack : "No stack trace"
		);

		try {
			await logLlmInteraction({
				timestamp: new Date().toISOString(),
				user_id: userId,
				route: "/api/chat",
				prompt: "",
				response: "",
				status: "error",
				error: errorMsg,
			});
		} catch (logError) {
			console.error(`[${route}] Failed to log error:`, logError);
		}

		return NextResponse.json(
			{ error: "Server error", details: err },
			{ status: 500 }
		);
	}
}
