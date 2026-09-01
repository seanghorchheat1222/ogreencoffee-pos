export async function storeOrderitem(orderitem) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/orderitems`, {
    method: 'POST',
    headers: {
      'Content-Type' : 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(orderitem)
  })

  return await response.json();
}