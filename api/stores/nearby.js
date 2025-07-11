import { NearbyStores } from 'dominos'
import { verifyToken } from '../auth.js'

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check authentication
  const authToken = req.headers.authorization?.replace('Bearer ', '')
  if (!verifyToken(authToken)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { zipCode, address } = req.body

  if (!zipCode && !address) {
    return res.status(400).json({ error: 'Zip code or address is required' })
  }

  try {
    console.log('Finding nearby stores for:', zipCode || address)
    
    // Use zip code if provided, otherwise use address
    const searchLocation = zipCode || address
    
    const nearbyStores = await new NearbyStores(searchLocation)
    
    // Filter and sort stores by distance
    const availableStores = nearbyStores.stores
      .filter(store => 
        store.IsOnlineCapable && 
        store.IsDeliveryStore && 
        store.IsOpen &&
        store.ServiceIsOpen?.Delivery
      )
      .sort((a, b) => a.MinDistance - b.MinDistance)
      .slice(0, 10) // Limit to 10 closest stores
      .map(store => ({
        storeId: store.StoreID,
        address: store.StoreCoordinates?.Description || store.AddressDescription,
        distance: store.MinDistance,
        phone: store.Phone,
        isOpen: store.IsOpen,
        deliveryMinutes: store.ServiceEstimatedWaitMinutes?.Delivery
      }))

    console.log(`Found ${availableStores.length} nearby stores`)

    res.status(200).json({
      stores: availableStores,
      searchLocation: searchLocation
    })

  } catch (error) {
    console.error('Error finding nearby stores:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ 
      error: 'Failed to find nearby stores',
      message: errorMessage,
      debug: process.env.NODE_ENV !== 'production' ? errorMessage : undefined
    })
  }
}