<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\Request;

class CategorieController extends Controller
{
    public function index(){
        $categories = Categorie::withCount('products')
        ->with('products')->get();

        return response()->json([
            'status' => true,
            'data' => $categories
        ]);
    }

    public function store(Request $request){
       
        $request->validate([
             'name' => 'required|string|max:100',
             'description' => 'nullable|string'
        ]);

        $categorie = Categorie::create($request->all());

        return response()->json([
            'status' => true,
            'data' => $categorie,
            'message' => 'Categorie added successfully!'
        ]);

    }

    public function show(Request $request){
        $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string'
        ]);

        $categorie = Categorie::findOrFail($request->category);

        return response()->json([
            'status' => true,
            'data' => $categorie
        ]);
    }

    public function update(Request $request){
       $request->validate([
        'name' => 'required|string|max:100',
        'description' => 'nullable|string'
       ]);

       $categorie = Categorie::findOrFail($request->category);

       $categorie->name = $request->name;
       $categorie->description  = $request->description;

       $categorie->save();

       return response()->json([
        'status' => true,
        'data' => $categorie,
        'message' => 'Categorie updated successfully!'
       ]);
    }

    public function destroy(Request $request){
      $categorie = Categorie::findOrFail($request->category); 
      $categorie->delete();

      return response()->json([
        'status' => true,
        'message' => 'Categorie deleted successfully!'
      ]);
    }
}
