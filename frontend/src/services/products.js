export async function getAllProducts() {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/products`);
  const data = await response.json();

  return data;
}

export async function getProducts(id, search) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/products?sort=${id}&&search=${search}`);
  const data = await response.json();

  return data;
}

export async function showProduct(id) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`);
  const data = await response.json();

  return data;
}