/* eslint-disable no-process-env */

import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_API_URL: z.string(),
    NEXT_PUBLIC_LOCAL_MODE_ENABLED: z.boolean().default(false),
    // NEXT_PUBLIC_FREEIMAGE_HOST_API_KEY: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    // NEXT_PUBLIC_FREEIMAGE_HOST_API_KEY: process.env.NEXT_PUBLIC_FREEIMAGE_HOST_API_KEY,
    NEXT_PUBLIC_LOCAL_MODE_ENABLED:
      process.env.NEXT_PUBLIC_LOCAL_MODE_ENABLED === "true",
  },
});
