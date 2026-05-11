import { getEncoding } from "js-tiktoken";

const enc = getEncoding("cl100k_base");

export const TokenService = {
  countTokens: (text: any): number => {
    if (!text || typeof text !== 'string') return 0;
    return enc.encode(text).length;
  },

  countMessagesTokens: (messages: any[]): number => {
    let count = 0;
    for (const msg of messages) {
      count += 4; // every message follows <im_start>{role/name}\n{content}<im_end>\n
      for (const key in msg) {
        count += TokenService.countTokens(msg[key]);
        if (key === "name") count += 1; // if there's a name, the role is omitted
      }
    }
    count += 2; // every reply is primed with <im_start>assistant
    return count;
  }
};
