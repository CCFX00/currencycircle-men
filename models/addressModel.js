const getAddressComponent = (components, type) => {
    const component = components.find(component => component.types.includes(type));
    return component ? component.long_name : '';
  };
  
  module.exports = {
    getAddressComponent
  };
  