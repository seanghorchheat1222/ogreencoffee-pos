import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  items: []
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addCart: (state, action) => {
     const existingitems = state.items.find(
      (item) => item.product_id === action.payload.product_id
     );

     if(existingitems){
      existingitems.quantity += action.payload.quantity 
     }else{
      state.items.push(
        action.payload
      )
     }
    },

    increase: (state, action) => {
      const item = state.items.find(
        (item) => item.product_id === action.payload
      );

      if(item){
        item.quantity +=  1;
      }
    },

    decrease: (state, action) => {
      const item = state.items.find((item) => item.product_id === action.payload);
      
      if(item){
        if(item.quantity > 1){
             item.quantity -= 1;
        }
      }
    },

    remove: (state, action) => {
        state.items = state.items.filter(
          (item) => item.product_id !== action.payload
        )
    },

    clear: (state) => {
        state.items = initialState.items
    }
  }
})

export const {addCart, increase, decrease, remove, clear} = cartSlice.actions

export default cartSlice.reducer