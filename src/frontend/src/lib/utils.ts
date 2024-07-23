import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ChatModel } from "../../generated";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isLocalModel(model: ChatModel) {
  return ![
    ChatModel.LLAMA_3_405B,
    ChatModel.LLAMA_3_70B,
    ChatModel.GPT_4O,
    ChatModel.GPT_3_5_TURBO,

  ].includes(model);
}

export function isCloudModel(model: ChatModel) {
  return !isLocalModel(model);
}
