export async function storeOrder(order) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type' : 'application/json',
      'Accept' : 'application/json'
    },
    body: JSON.stringify(order)
  })

  return await response.json();
}