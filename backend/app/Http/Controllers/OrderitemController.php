<?php

namespace App\Http\Controllers;

use App\Models\Orderitem;
use Illuminate\Http\Request;

class OrderitemController extends Controller
{
    public function store(Request $request)
    {   
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'items' => 'required|array|min:1'
        ]);

        foreach ($request['items'] as $item) {
            Orderitem::create([
                'order_id' => $request->order_id,
                'product_id' => $item['product_id'],
                'product_name' => $item['product_name'],
                'product_category' => $item['product_category'],
                'product_price' => $item['product_price'],
                'quantity' => $item['quantity'],
                'sugar' => $item['sugar'],
                'size' => $item['size']
            ]);
        }

        return response()->json([
            'status' => true,
            'data' => $request['items'],
            'message' => 'Order items added successfully'
        ]);
    }
}
