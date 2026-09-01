<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_type',
        'customer_name',
        'table',
        'payment_method',
        'line_total',
        'total',
        'transaction_status',
    ];

    public function Orderitem(){
        return $this->hasMany(Orderitem::class)->select('order_id', 'product_name', 'product_price', 'quantity');
    }
}
