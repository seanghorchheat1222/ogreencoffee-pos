export async function getCategories(){
  const respone = await fetch( `${import.meta.env.VITE_API_URL}/categories`)
  const data = await respone.json();

  return data;
}
