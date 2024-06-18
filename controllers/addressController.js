const axios = require('axios');
const { getAddressComponent } = require('../models/addressModel');

const autofillAddress = async (req, res) => {
  const { address } = req.query;

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    const { results } = response.data;

    if (results.length > 0) {
      const { address_components } = results[0];

      const streetNumber = getAddressComponent(address_components, 'street_number');
      const route = getAddressComponent(address_components, 'route');
      const locality = getAddressComponent(address_components, 'locality');
      const administrativeAreaLevel1 = getAddressComponent(address_components, 'administrative_area_level_1');
      const postalCode = getAddressComponent(address_components, 'postal_code');
      const country = getAddressComponent(address_components, 'country');

      const autofilledAddress = {
        streetNumber,
        route,
        locality,
        administrativeAreaLevel1,
        postalCode,
        country
      };

      res.json(autofilledAddress);
    } else {
      res.status(404).json({ error: 'Address not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  autofillAddress
};
