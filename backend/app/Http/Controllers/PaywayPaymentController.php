<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PaywayPaymentController extends Controller
{
    public function create(Request $request)
    {
        $order = Order::findOrFail($request->order_id);

        $reqTime = now('UTC')->format('YmdHis');

        $amount = number_format($order->total, 2, '.', '');

        $merchantId = env('PAYWAY_MERCHANT_ID');
        $apiKey = env('PAYWAY_API_KEY');

        $paymentOption = env(
            'PAYWAY_PAYMENT_OPTION',
            'abapay_khqr'
        );

        $currency = env(
            'PAYWAY_CURRENCY',
            'USD'
        );

        $lifetime = env(
            'PAYWAY_QR_LIFETIME_MINUTES',
            10
        );

        /*
        |--------------------------------------------------------------------------
        | Callback URL
        |--------------------------------------------------------------------------
        */

        $callbackUrl = base64_encode(
            env('PAYWAY_CALLBACK_URL')
        );

        /*
        |--------------------------------------------------------------------------
        | Items
        |--------------------------------------------------------------------------
        */

        $items = base64_encode(
            json_encode([])
        );

        /*
        |--------------------------------------------------------------------------
        | Transaction ID
        |--------------------------------------------------------------------------
        */

        $tranId = 'ORDER-' . $order->id;

        /*
        |--------------------------------------------------------------------------
        | Hash
        |--------------------------------------------------------------------------
        */

        $hashData =
            $reqTime .
            $merchantId .
            $tranId .
            $amount .
            $items .
            $order->customer_name .
            '' .
            '' .
            '' .
            'purchase' .
            $paymentOption .
            $callbackUrl .
            $currency .
            $tranId .
            $lifetime .
            'template1_color';

        $hash = base64_encode(
            hash_hmac(
                'sha512',
                $hashData,
                $apiKey,
                true
            )
        );

        /*
        |--------------------------------------------------------------------------
        | Generate QR
        |--------------------------------------------------------------------------
        */

        $response = Http::acceptJson()
            ->asJson()
            ->post(
                env('PAYWAY_BASE_URL') .
                '/api/payment-gateway/v1/payments/generate-qr',
                [
                    'req_time' => $reqTime,
                    'merchant_id' => $merchantId,
                    'tran_id' => $tranId,

                    'first_name' => $order->customer_name,
                    'last_name' => '',
                    'email' => '',
                    'phone' => '',

                    'amount' => $amount,

                    'purchase_type' => 'purchase',

                    'payment_option' => $paymentOption,

                    'items' => $items,

                    'currency' => $currency,

                    'callback_url' => $callbackUrl,

                    'return_params' => $tranId,

                    'lifetime' => $lifetime,

                    'qr_image_template' => 'template1_color',

                    'hash' => $hash,
                ]
            );

        return response()->json([
            'order_id' => $order->id,
            'status' => 'pending',
            'payway' => $response->json(),
        ]);
    }


    public function fail(Order $order)
    {
        $order->update([
            'transaction_status' => 'failed'
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Payment failed',
            'order_id' => $order->id
        ]);
    }

    public function status(Order $order)
    {
        return response()->json([
            'order_id' => $order->id,
            'status' => $order->transaction_status,
        ]);
    }
}
