import { NextResponse } from 'next/server';
import ShippingService from '../../../../../services/ShippingService';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { provider } = body;
    
    const result = await ShippingService.dispatchOrderToCourier(id, provider);
    
    return NextResponse.json({
      message: `Order successfully dispatched to ${provider}.`,
      data: result
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
