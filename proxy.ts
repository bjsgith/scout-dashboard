import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isAllowedRequestHost } from "@/lib/host-validation";

export function proxy(request: NextRequest) {
  if (!isAllowedRequestHost(request.headers)) {
    return new NextResponse("Forbidden\n", {
      status: 403,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  return NextResponse.next();
}
