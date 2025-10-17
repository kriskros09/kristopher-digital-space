import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface LlmLogEntry {
	timestamp: string;
	user_id?: string;
	route: string;
	prompt: string;
	response: string;
	status: string;
	error?: string;
}

export async function logLlmInteraction(entry: LlmLogEntry) {
	console.log("[llmLogger] Starting to log interaction:", {
		route: entry.route,
		status: entry.status,
		userId: entry.user_id,
		timestamp: entry.timestamp,
	});

	try {
		console.log("[llmLogger] Creating Supabase client...");
		const supabase = await createSupabaseServerClient();
		console.log("[llmLogger] Inserting log entry...");
		const { error } = await supabase.from("llm_logs").insert([entry]);
		if (error) {
			console.error("[llmLogger] Supabase log insert error:", error);
		} else {
			console.log("[llmLogger] Successfully logged interaction");
		}
	} catch (err) {
		console.error("[llmLogger] Failed to log interaction:", err);
		console.error("[llmLogger] Error details:", {
			message: err instanceof Error ? err.message : String(err),
			stack: err instanceof Error ? err.stack : "No stack trace",
		});
		// Don't throw - logging failures shouldn't break the main flow
	}
}

export async function getLlmLogs() {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("llm_logs")
		.select("*")
		.order("timestamp", { ascending: false })
		.limit(100);
	if (error) throw error;
	return data;
}

export async function deleteAllLlmLogs() {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("llm_logs")
		.delete()
		.not("id", "is", null); // delete all rows
	if (error) {
		console.error("Delete error:", error);
		throw error;
	}
	console.log("Deleted rows:", data);
}
