<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Orderitem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'product_category',
        'product_price',
        'product_quantity',
        'quantity',
        'sugar',
        'size'
    ];
}
