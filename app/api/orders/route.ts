import { NextRequest, NextResponse } from "next/server";
import { createOrder, OrderError } from "@/lib/fake-order-store";
import { getOrCreateSessionId } from "@/lib/session";
import type { CreateOrderRequest } from "@/lib/types";

const PAYMENT_METHODS = ["bkash", "nagad", "cod"];
const ZONES = ["inside_dhaka", "outside_dhaka"];
// Bangladeshi mobile numbers: 01XXXXXXXXX, optionally prefixed with +88.
const BD_PHONE = /^(?:\+?88)?01[3-9]\d{8}$/;

export async function POST(request: NextRequest) {
  const sessionId = await getOrCreateSessionId();
  const body = (await request.json()) as Partial<CreateOrderRequest>;

  const phone = body.phone?.replace(/[\s-]/g, "") ?? "";
  if (
    !body.customerName?.trim() ||
    !BD_PHONE.test(phone) ||
    !body.address?.trim() ||
    !body.city?.trim() ||
    !ZONES.includes(body.deliveryZone ?? "") ||
    !PAYMENT_METHODS.includes(body.paymentMethod ?? "")
  ) {
    return NextResponse.json(
      { message: "Please check your delivery details and try again." },
      { status: 400 }
    );
  }

  try {
    const result = createOrder(sessionId, {
      ...(body as CreateOrderRequest),
      phone,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    throw error;
  }
}
