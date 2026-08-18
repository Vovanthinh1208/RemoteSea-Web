import type { RequestOptions } from "@/core/http/request-config";
import { messageRepository } from "@/features/messages/message.repository";
import {
  toMessage,
  toThread,
  type Thread,
} from "@/features/messages/message.mapper";
import type { Message } from "@/types/message";
import type { UserRole } from "@/types/user";

export type { Thread };

export const getThread = async (
  applicationId: string,
  role: UserRole,
  opts?: RequestOptions
): Promise<Thread> =>
  toThread(await messageRepository.list(applicationId, role, opts));

export const sendMessage = async (
  applicationId: string,
  role: UserRole,
  body: string
): Promise<Message> =>
  toMessage(await messageRepository.send(applicationId, role, { body }));
