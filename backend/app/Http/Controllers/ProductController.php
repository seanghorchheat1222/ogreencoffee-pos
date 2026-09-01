<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;


class ProductController extends Controller
{  
    public function index(Request $request)
    {
       $products = Product::with('category');
       
       if($request->search){
        $products->where('name', 'LIKE', '%' . $request->search . '%');
       }

       if($request->sort){
        $products->where('category_id', $request->sort);
       }
  
        return response()->json([
            'stauts' => true,
            'data' => $products->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp',
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'price' => 'required'
        ]);

        $request->file('image')?->store('products', 'public');

        $product = new Product();

        $product->category_id = $request->category_id;
        $product->name = $request->name;
        $product->description = $request->description;
        $product->price = $request->price;
        $product->image = $request->file('image')?->store('products', 'public');

        $product->save();

        return response()->json([
            'status' => true,
            'data' => $product,
            'message' => 'Product added successfully!'
        ]);
    }

    public function show(Request $request)
    {
        $product = Product::with('category')->findOrFail($request->product);

        return response()->json([
            'status' => true,
            'data' => $product
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'price' => 'required',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048'
        ]);

        $product = Product::with('category')->findOrFail($request->product);

        $product->category_id = $request->category_id;
        $product->name = $request->name;
        $product->description = $request->description;
        $product->price = $request->price;
        if ($request->hasFile('image')) {
            if ($product->image){
                Storage::disk('public')->delete($product->image);
            }
            $product->image = $request->file('image')?->store('products', 'public');
        }

        $product->save();

        return response()->json([
            'status' => true,
            'data' => $product,
            'message' => 'Product updated successfully!'
        ]);
    }

    public function destroy(Request $request){
        $product = Product::with('category')->findOrFail($request->product);

        if($product->image){
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return response()->json([
            'stauts' => true,
            'message' => 'Product deleted successfully!'
        ]);
    }
}
