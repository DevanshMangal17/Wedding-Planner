"use server";

import { getOwnedWeddingOrThrow, requireSession } from "@/lib/session";
import { answerAssistantQuery, type AssistantReply } from "@/ai/assistant";

export async function askAssistantAction(weddingId: string, message: string): Promise<AssistantReply> {
  const session = await requireSession();
  await getOwnedWeddingOrThrow(weddingId, session.user.id);
  return answerAssistantQuery(message, weddingId);
}
