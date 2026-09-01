<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;


class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with('OrderItem');

        return response()->json([
            'status' => true,
            'data' => $orders->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'order_type' => 'required|string',
            'customer_name' => 'required|string|max:100',
            'table' => 'required|string',
            'payment_method' => 'required|in:cash,card,qr',
            'line_total' => 'required',
            'total' => 'required',
        ]);

          $order = Order::create([
        'order_type' => $request->order_type,
        'customer_name' => $request->customer_name,
        'table' => $request->table,
        'payment_method' => $request->payment_method,
        'line_total' => $request->line_total,
        'total' => $request->total,
        'transaction_status' => 'pending',
    ]);


        $order = Order::with("Orderitem")->find($order->id);

        return response()->json([
            'status' => true,
            'data' => $order
        ]);
    }
}
